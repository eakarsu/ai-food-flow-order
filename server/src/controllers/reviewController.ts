import { Response } from 'express';
import { validationResult } from 'express-validator';
import { query, getClient } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateReviewResponse, analyzeReviews } from '../services/openRouterService.js';

// Get all reviews
export const getReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId, rating, sentiment, hasResponse, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT r.*, u.first_name as user_first_name, u.last_name as user_last_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (restaurantId) {
      sql += ` AND r.restaurant_id = $${paramIndex++}`;
      params.push(restaurantId);
    }

    if (rating) {
      sql += ` AND r.rating = $${paramIndex++}`;
      params.push(parseInt(rating as string));
    }

    if (sentiment) {
      sql += ` AND r.sentiment = $${paramIndex++}`;
      params.push(sentiment);
    }

    if (hasResponse === 'true') {
      sql += ` AND r.ai_response IS NOT NULL`;
    } else if (hasResponse === 'false') {
      sql += ` AND r.ai_response IS NULL`;
    }

    sql += ` ORDER BY r.created_at DESC`;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await query(sql, params);

    const reviews = result.rows.map(row => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      orderId: row.order_id,
      userId: row.user_id,
      customerName: row.customer_name || (row.user_first_name ? `${row.user_first_name} ${row.user_last_name}` : 'Anonymous'),
      rating: row.rating,
      title: row.title,
      content: row.content,
      sentiment: row.sentiment,
      aiResponse: row.ai_response,
      aiResponseGeneratedAt: row.ai_response_generated_at,
      isPublished: row.is_published,
      isResponded: row.is_responded,
      responsePublishedAt: row.response_published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    // Get total count with all active filters
    let countSql = `SELECT COUNT(*) FROM reviews r WHERE 1=1`;
    const countParams: any[] = [];
    let countIndex = 1;

    if (restaurantId) {
      countSql += ` AND r.restaurant_id = $${countIndex++}`;
      countParams.push(restaurantId);
    }
    if (rating) {
      countSql += ` AND r.rating = $${countIndex++}`;
      countParams.push(parseInt(rating as string));
    }
    if (sentiment) {
      countSql += ` AND r.sentiment = $${countIndex++}`;
      countParams.push(sentiment);
    }
    if (hasResponse === 'true') {
      countSql += ` AND r.ai_response IS NOT NULL`;
    } else if (hasResponse === 'false') {
      countSql += ` AND r.ai_response IS NULL`;
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      reviews,
      total,
      pagination: {
        page: Math.floor(parseInt(offset as string) / parseInt(limit as string)) + 1,
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get single review
export const getReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT r.*, u.first_name as user_first_name, u.last_name as user_last_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const row = result.rows[0];
    res.json({
      review: {
        id: row.id,
        restaurantId: row.restaurant_id,
        orderId: row.order_id,
        userId: row.user_id,
        customerName: row.customer_name || (row.user_first_name ? `${row.user_first_name} ${row.user_last_name}` : 'Anonymous'),
        rating: row.rating,
        title: row.title,
        content: row.content,
        sentiment: row.sentiment,
        aiResponse: row.ai_response,
        aiResponseGeneratedAt: row.ai_response_generated_at,
        isPublished: row.is_published,
        isResponded: row.is_responded,
        responsePublishedAt: row.response_published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
};

// Create review
export const createReview = async (req: AuthRequest, res: Response) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      restaurantId, orderId, customerName, rating, title, content, sentiment,
    } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO reviews
       (restaurant_id, order_id, user_id, customer_name, rating, title, content, sentiment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [restaurantId, orderId, req.user?.id, customerName, rating, title, content, sentiment]
    );

    await client.query('COMMIT');

    const row = result.rows[0];
    res.status(201).json({
      review: {
        id: row.id,
        restaurantId: row.restaurant_id,
        orderId: row.order_id,
        userId: row.user_id,
        customerName: row.customer_name,
        rating: row.rating,
        title: row.title,
        content: row.content,
        sentiment: row.sentiment,
        isPublished: row.is_published,
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  } finally {
    client.release();
  }
};

// Update review
export const updateReview = async (req: AuthRequest, res: Response) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    await client.query('BEGIN');

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const fieldMapping: Record<string, string> = {
      customerName: 'customer_name',
      rating: 'rating',
      title: 'title',
      content: 'content',
      sentiment: 'sentiment',
      aiResponse: 'ai_response',
      isPublished: 'is_published',
      isResponded: 'is_responded',
    };

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      if (updates[key] !== undefined) {
        setClauses.push(`${dbField} = $${paramIndex++}`);
        values.push(updates[key]);
      }
    }

    if (setClauses.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await client.query(
      `UPDATE reviews SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Review not found' });
    }

    await client.query('COMMIT');

    const row = result.rows[0];
    res.json({
      review: {
        id: row.id,
        restaurantId: row.restaurant_id,
        orderId: row.order_id,
        userId: row.user_id,
        customerName: row.customer_name,
        rating: row.rating,
        title: row.title,
        content: row.content,
        sentiment: row.sentiment,
        aiResponse: row.ai_response,
        aiResponseGeneratedAt: row.ai_response_generated_at,
        isPublished: row.is_published,
        isResponded: row.is_responded,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  } finally {
    client.release();
  }
};

// Delete review
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM reviews WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Bulk delete reviews
export const bulkDeleteReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const result = await query(
      'DELETE FROM reviews WHERE id = ANY($1) RETURNING id',
      [ids]
    );

    res.json({
      message: `${result.rows.length} reviews deleted`,
      deletedCount: result.rows.length,
    });
  } catch (error) {
    console.error('Bulk delete reviews error:', error);
    res.status(500).json({ error: 'Failed to bulk delete reviews' });
  }
};

// Bulk update reviews
export const bulkUpdateReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'updates object is required' });
    }

    const fieldMapping: Record<string, string> = {
      sentiment: 'sentiment',
      isPublished: 'is_published',
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      if (updates[key] !== undefined) {
        setClauses.push(`${dbField} = $${paramIndex++}`);
        values.push(updates[key]);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(ids);
    const result = await query(
      `UPDATE reviews SET ${setClauses.join(', ')}
       WHERE id = ANY($${paramIndex})
       RETURNING id`,
      values
    );

    res.json({
      message: `${result.rows.length} reviews updated`,
      updatedCount: result.rows.length,
    });
  } catch (error) {
    console.error('Bulk update reviews error:', error);
    res.status(500).json({ error: 'Failed to bulk update reviews' });
  }
};

// Generate AI response for review
export const generateAIResponse = async (req: AuthRequest, res: Response) => {
  const client = await getClient();

  try {
    const { id } = req.params;

    // Get the review
    const reviewResult = await query(
      'SELECT * FROM reviews WHERE id = $1',
      [id]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const review = reviewResult.rows[0];

    // Generate AI response
    const aiResult = await generateReviewResponse({
      customerName: review.customer_name || 'Valued Customer',
      rating: review.rating,
      title: review.title || '',
      content: review.content,
      sentiment: review.sentiment || (review.rating >= 4 ? 'positive' : review.rating <= 2 ? 'negative' : 'neutral'),
    });

    await client.query('BEGIN');

    // Update review with AI response
    const updateResult = await client.query(
      `UPDATE reviews
       SET ai_response = $1, ai_response_generated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [aiResult.response, id]
    );

    await client.query('COMMIT');

    const row = updateResult.rows[0];
    res.json({
      review: {
        id: row.id,
        restaurantId: row.restaurant_id,
        customerName: row.customer_name,
        rating: row.rating,
        title: row.title,
        content: row.content,
        sentiment: row.sentiment,
        aiResponse: row.ai_response,
        aiResponseGeneratedAt: row.ai_response_generated_at,
        isPublished: row.is_published,
        isResponded: row.is_responded,
        updatedAt: row.updated_at,
      },
      aiMeta: {
        tone: aiResult.tone,
        keyPoints: aiResult.keyPoints,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Generate AI response error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  } finally {
    client.release();
  }
};

// Publish AI response
export const publishResponse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE reviews
       SET is_responded = true, response_published_at = NOW()
       WHERE id = $1 AND ai_response IS NOT NULL
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or no AI response to publish' });
    }

    const row = result.rows[0];
    res.json({
      review: {
        id: row.id,
        aiResponse: row.ai_response,
        isResponded: row.is_responded,
        responsePublishedAt: row.response_published_at,
      },
    });
  } catch (error) {
    console.error('Publish response error:', error);
    res.status(500).json({ error: 'Failed to publish response' });
  }
};

// Get review statistics
export const getReviewStats = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId } = req.query;

    const result = await query(
      `SELECT
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
        COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_count,
        COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_count,
        COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_count,
        COUNT(CASE WHEN ai_response IS NOT NULL THEN 1 END) as responses_generated,
        COUNT(CASE WHEN is_responded = true THEN 1 END) as responses_published
       FROM reviews
       WHERE restaurant_id = $1`,
      [restaurantId]
    );

    const stats = result.rows[0];
    res.json({
      stats: {
        totalReviews: parseInt(stats.total_reviews),
        averageRating: parseFloat(stats.average_rating) || 0,
        ratingDistribution: {
          5: parseInt(stats.five_star),
          4: parseInt(stats.four_star),
          3: parseInt(stats.three_star),
          2: parseInt(stats.two_star),
          1: parseInt(stats.one_star),
        },
        sentimentDistribution: {
          positive: parseInt(stats.positive_count),
          neutral: parseInt(stats.neutral_count),
          negative: parseInt(stats.negative_count),
        },
        responsesGenerated: parseInt(stats.responses_generated),
        responsesPublished: parseInt(stats.responses_published),
      },
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ error: 'Failed to fetch review statistics' });
  }
};

// AI-powered bulk review analysis
export const analyzeAllReviews = async (req: AuthRequest, res: Response) => {
  try {
    // Fetch all reviews
    const reviewsResult = await query(
      `SELECT r.*, u.first_name as user_first_name, u.last_name as user_last_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC
       LIMIT 50`
    );

    if (reviewsResult.rows.length === 0) {
      return res.status(400).json({ error: 'No reviews to analyze' });
    }

    // Build stats
    const statsResult = await query(
      `SELECT
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
        COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_count,
        COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_count,
        COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_count,
        COUNT(CASE WHEN ai_response IS NOT NULL THEN 1 END) as responses_generated,
        COUNT(CASE WHEN is_responded = true THEN 1 END) as responses_published
       FROM reviews`
    );

    const s = statsResult.rows[0];

    const reviews = reviewsResult.rows.map(row => ({
      customerName: row.customer_name || (row.user_first_name ? `${row.user_first_name} ${row.user_last_name}` : 'Anonymous'),
      rating: row.rating,
      title: row.title || '',
      content: row.content,
      sentiment: row.sentiment || 'neutral',
      aiResponse: row.ai_response,
      createdAt: row.created_at,
    }));

    const stats = {
      totalReviews: parseInt(s.total_reviews),
      averageRating: parseFloat(s.average_rating) || 0,
      ratingDistribution: {
        '5': parseInt(s.five_star),
        '4': parseInt(s.four_star),
        '3': parseInt(s.three_star),
        '2': parseInt(s.two_star),
        '1': parseInt(s.one_star),
      },
      sentimentDistribution: {
        positive: parseInt(s.positive_count),
        neutral: parseInt(s.neutral_count),
        negative: parseInt(s.negative_count),
      },
      responsesGenerated: parseInt(s.responses_generated),
      responsesPublished: parseInt(s.responses_published),
    };

    const analysis = await analyzeReviews({ reviews, stats });

    // Persist to ai_results
    try {
      const { query: dbQuery } = await import('../config/database.js');
      await dbQuery(
        `INSERT INTO ai_results (endpoint, input_data, output_data, model_used, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        ['reviews-analyze', JSON.stringify({ reviewCount: reviews.length }),
         JSON.stringify(analysis), process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022', req.user?.id || null]
      );
    } catch { /* ignore */ }

    res.json({ analysis });
  } catch (error) {
    console.error('Analyze reviews error:', error);
    res.status(500).json({ error: 'Failed to analyze reviews' });
  }
};
