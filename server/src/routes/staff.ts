import { Router } from 'express';
import { body } from 'express-validator';
import {
  getStaffMembers,
  getStaffMember,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  bulkDeleteStaffMembers,
  bulkUpdateStaffMembers,
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  bulkDeleteSchedules,
  bulkUpdateSchedules,
  optimizeScheduleAI,
  analyzeStaffAI,
} from '../controllers/staffController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Staff Members Routes
router.get('/members', getStaffMembers);
router.get('/members/:id', getStaffMember);

router.post(
  '/members',
  [
    body('restaurantId').isUUID(),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('role').notEmpty().trim(),
    body('email').optional().isEmail(),
    body('phone').optional().trim(),
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('employmentType').optional().isIn(['full_time', 'part_time', 'contractor']),
    body('hireDate').optional().isISO8601(),
    body('skills').optional().isArray(),
    body('availability').optional().isObject(),
    body('maxHoursPerWeek').optional().isInt({ min: 1, max: 80 }),
  ],
  createStaffMember
);

router.put(
  '/members/:id',
  [
    body('firstName').optional().notEmpty().trim(),
    body('lastName').optional().notEmpty().trim(),
    body('role').optional().notEmpty().trim(),
    body('email').optional().isEmail(),
    body('phone').optional().trim(),
    body('hourlyRate').optional().isFloat({ min: 0 }),
    body('employmentType').optional().isIn(['full_time', 'part_time', 'contractor']),
    body('hireDate').optional().isISO8601(),
    body('skills').optional().isArray(),
    body('availability').optional().isObject(),
    body('maxHoursPerWeek').optional().isInt({ min: 1, max: 80 }),
    body('isActive').optional().isBoolean(),
  ],
  updateStaffMember
);

// Bulk delete staff members
router.post('/members/bulk-delete', requireRole('admin', 'manager'), bulkDeleteStaffMembers);

// Bulk update staff members
router.post('/members/bulk-update', requireRole('admin', 'manager'), bulkUpdateStaffMembers);

router.delete('/members/:id', deleteStaffMember);

// Schedules Routes
router.get('/schedules', getSchedules);
router.get('/schedules/:id', getSchedule);

router.post(
  '/schedules',
  [
    body('staffMemberId').isUUID(),
    body('restaurantId').isUUID(),
    body('shiftDate').isISO8601(),
    body('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('breakMinutes').optional().isInt({ min: 0, max: 120 }),
    body('roleForShift').optional().trim(),
    body('status').optional().isIn(['scheduled', 'confirmed', 'completed', 'cancelled']),
    body('notes').optional().trim(),
  ],
  createSchedule
);

router.put(
  '/schedules/:id',
  [
    body('staffMemberId').optional().isUUID(),
    body('shiftDate').optional().isISO8601(),
    body('startTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('endTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('breakMinutes').optional().isInt({ min: 0, max: 120 }),
    body('roleForShift').optional().trim(),
    body('status').optional().isIn(['scheduled', 'confirmed', 'completed', 'cancelled']),
    body('notes').optional().trim(),
  ],
  updateSchedule
);

router.delete('/schedules/:id', deleteSchedule);

// Bulk delete schedules
router.post('/schedules/bulk-delete', requireRole('admin', 'manager'), bulkDeleteSchedules);

// Bulk update schedules
router.post('/schedules/bulk-update', requireRole('admin', 'manager'), bulkUpdateSchedules);

// AI Analyze Staff Team
router.post('/analyze', analyzeStaffAI);

// AI Optimize Schedule
router.post(
  '/optimize',
  [
    body('restaurantId').isUUID(),
    body('targetDate').isISO8601(),
    body('expectedDemand').optional().isIn(['low', 'medium', 'high']),
  ],
  optimizeScheduleAI
);

export default router;
