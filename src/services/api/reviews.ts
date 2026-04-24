import { apiRequest } from './config';

// Types
export interface Review {
  id: string;
  restaurantId: string;
  orderId?: string;
  userId?: string;
  customerName: string;
  rating: number;
  title?: string;
  content: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  aiResponse?: string;
  aiResponseGeneratedAt?: string;
  isPublished: boolean;
  isResponded: boolean;
  responsePublishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  responsesGenerated: number;
  responsesPublished: number;
}

export interface AIResponseMeta {
  tone: string;
  keyPoints: string[];
}

export interface CreateReviewInput {
  restaurantId: string;
  rating: number;
  content: string;
  orderId?: string;
  customerName?: string;
  title?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface UpdateReviewInput {
  rating?: number;
  content?: string;
  customerName?: string;
  title?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  aiResponse?: string;
  isPublished?: boolean;
  isResponded?: boolean;
}

// API Functions
export const getReviews = async (params?: {
  restaurantId?: string;
  rating?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  hasResponse?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ reviews: Review[]; total: number }> => {
  const queryParams = new URLSearchParams();
  if (params?.restaurantId) queryParams.set('restaurantId', params.restaurantId);
  if (params?.rating) queryParams.set('rating', String(params.rating));
  if (params?.sentiment) queryParams.set('sentiment', params.sentiment);
  if (params?.hasResponse !== undefined) queryParams.set('hasResponse', String(params.hasResponse));
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.offset) queryParams.set('offset', String(params.offset));

  const queryString = queryParams.toString();
  return apiRequest(`/reviews${queryString ? `?${queryString}` : ''}`);
};

export const getReview = async (id: string): Promise<{ review: Review }> => {
  return apiRequest(`/reviews/${id}`);
};

export const getReviewStats = async (
  restaurantId: string
): Promise<{ stats: ReviewStats }> => {
  return apiRequest(`/reviews/stats?restaurantId=${restaurantId}`);
};

export const createReview = async (
  data: CreateReviewInput
): Promise<{ review: Review }> => {
  return apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateReview = async (
  id: string,
  data: UpdateReviewInput
): Promise<{ review: Review }> => {
  return apiRequest(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteReview = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/reviews/${id}`, {
    method: 'DELETE',
  });
};

export const bulkDeleteReviews = async (
  ids: string[]
): Promise<{ message: string; deletedCount: number }> => {
  return apiRequest('/reviews/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
};

export const bulkUpdateReviews = async (
  ids: string[],
  updates: { sentiment?: string; isPublished?: boolean }
): Promise<{ message: string; updatedCount: number }> => {
  return apiRequest('/reviews/bulk-update', {
    method: 'POST',
    body: JSON.stringify({ ids, updates }),
  });
};

export const generateAIResponse = async (
  reviewId: string
): Promise<{ review: Review; aiMeta: AIResponseMeta }> => {
  return apiRequest(`/reviews/${reviewId}/generate-response`, {
    method: 'POST',
  });
};

export const publishResponse = async (
  reviewId: string
): Promise<{ review: Partial<Review> }> => {
  return apiRequest(`/reviews/${reviewId}/publish-response`, {
    method: 'POST',
  });
};

export interface ReviewAnalysis {
  summary: string;
  sentimentInsights: string;
  topThemes: Array<{ theme: string; count: number; sentiment: string; details: string }>;
  actionItems: Array<{ priority: 'high' | 'medium' | 'low'; action: string; reason: string }>;
  strengthsAndWeaknesses: { strengths: string[]; weaknesses: string[] };
  trendAnalysis: string;
}

export const analyzeAllReviews = async (): Promise<{ analysis: ReviewAnalysis }> => {
  return apiRequest('/reviews/analyze', {
    method: 'POST',
  });
};
