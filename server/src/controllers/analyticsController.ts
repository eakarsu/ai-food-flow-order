import { Response } from 'express';
import { query } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// GET /api/ai/wait-time/accuracy
// Computes: average predicted vs actual wait time, accuracy rate (within 2 min),
// worst/best performers by day-of-week from the wait_time_actuals table
export const getWaitTimeAccuracy = async (req: AuthRequest, res: Response) => {
  try {
    // Check if table exists and has data
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'wait_time_predictions'
      ) as exists
    `);

    if (!tableCheck.rows[0]?.exists) {
      return res.json({
        totalPredictions: 0,
        avgPredictedMinutes: null,
        avgActualMinutes: null,
        avgAbsoluteError: null,
        accuracyRate: null,
        message: 'No prediction data available yet.',
        byDayOfWeek: [],
      });
    }

    // Overall stats
    const overallResult = await query(`
      SELECT
        COUNT(*) FILTER (WHERE actual_minutes IS NOT NULL) AS total_with_actuals,
        COUNT(*) AS total_predictions,
        AVG(predicted_minutes) AS avg_predicted,
        AVG(actual_minutes) FILTER (WHERE actual_minutes IS NOT NULL) AS avg_actual,
        AVG(ABS(predicted_minutes - actual_minutes)) FILTER (WHERE actual_minutes IS NOT NULL) AS avg_absolute_error,
        COUNT(*) FILTER (WHERE actual_minutes IS NOT NULL AND ABS(predicted_minutes - actual_minutes) <= 2) AS within_2_min
      FROM wait_time_predictions
    `);

    const overall = overallResult.rows[0];
    const totalWithActuals = parseInt(overall.total_with_actuals) || 0;
    const accuracyRate = totalWithActuals > 0
      ? Math.round((parseInt(overall.within_2_min) / totalWithActuals) * 100)
      : null;

    // By day of week
    const byDayResult = await query(`
      SELECT
        TO_CHAR(created_at, 'Day') AS day_of_week,
        EXTRACT(DOW FROM created_at) AS day_num,
        COUNT(*) FILTER (WHERE actual_minutes IS NOT NULL) AS predictions_with_actuals,
        AVG(predicted_minutes) AS avg_predicted,
        AVG(actual_minutes) FILTER (WHERE actual_minutes IS NOT NULL) AS avg_actual,
        AVG(ABS(predicted_minutes - actual_minutes)) FILTER (WHERE actual_minutes IS NOT NULL) AS avg_error
      FROM wait_time_predictions
      WHERE actual_minutes IS NOT NULL
      GROUP BY day_of_week, day_num
      ORDER BY day_num
    `);

    const byDayOfWeek = byDayResult.rows.map(r => ({
      dayOfWeek: r.day_of_week?.trim(),
      predictionsCount: parseInt(r.predictions_with_actuals) || 0,
      avgPredicted: r.avg_predicted ? parseFloat(r.avg_predicted).toFixed(1) : null,
      avgActual: r.avg_actual ? parseFloat(r.avg_actual).toFixed(1) : null,
      avgError: r.avg_error ? parseFloat(r.avg_error).toFixed(1) : null,
    }));

    // Best and worst performers
    const sorted = [...byDayOfWeek].filter(d => d.avgError !== null).sort((a, b) =>
      parseFloat(a.avgError!) - parseFloat(b.avgError!)
    );

    res.json({
      totalPredictions: parseInt(overall.total_predictions) || 0,
      totalWithActuals,
      avgPredictedMinutes: overall.avg_predicted ? parseFloat(overall.avg_predicted).toFixed(1) : null,
      avgActualMinutes: overall.avg_actual ? parseFloat(overall.avg_actual).toFixed(1) : null,
      avgAbsoluteErrorMinutes: overall.avg_absolute_error ? parseFloat(overall.avg_absolute_error).toFixed(1) : null,
      accuracyRatePercent: accuracyRate,
      withinTwoMinutes: parseInt(overall.within_2_min) || 0,
      bestPerformerDay: sorted.length > 0 ? sorted[0] : null,
      worstPerformerDay: sorted.length > 0 ? sorted[sorted.length - 1] : null,
      byDayOfWeek,
    });
  } catch (error) {
    console.error('Get wait time accuracy error:', error);
    res.status(500).json({ error: 'Failed to compute accuracy metrics' });
  }
};
