import { Response } from 'express';
import { validationResult } from 'express-validator';
import { query, getClient } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { optimizeStaffSchedule, analyzeStaff } from '../services/openRouterService.js';

// Get all staff members
export const getStaffMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId, role, isActive } = req.query;

    let sql = `SELECT * FROM staff_members WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (restaurantId) {
      sql += ` AND restaurant_id = $${paramIndex++}`;
      params.push(restaurantId);
    }

    if (role) {
      sql += ` AND role = $${paramIndex++}`;
      params.push(role);
    }

    if (isActive !== undefined) {
      sql += ` AND is_active = $${paramIndex++}`;
      params.push(isActive === 'true');
    }

    sql += ` ORDER BY last_name, first_name`;

    const result = await query(sql, params);

    const members = result.rows.map(row => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      hourlyRate: parseFloat(row.hourly_rate || 0),
      employmentType: row.employment_type,
      hireDate: row.hire_date,
      skills: row.skills || [],
      availability: row.availability || {},
      maxHoursPerWeek: row.max_hours_per_week,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({ members });
  } catch (error) {
    console.error('Get staff members error:', error);
    res.status(500).json({ error: 'Failed to fetch staff members' });
  }
};

// Get single staff member
export const getStaffMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM staff_members WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const row = result.rows[0];

    // Get current week hours
    const hoursResult = await query(
      `SELECT SUM(
        EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 - (break_minutes / 60.0)
       ) as total_hours
       FROM staff_schedules
       WHERE staff_member_id = $1
       AND shift_date >= DATE_TRUNC('week', CURRENT_DATE)
       AND shift_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'`,
      [id]
    );

    const member = {
      id: row.id,
      restaurantId: row.restaurant_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      hourlyRate: parseFloat(row.hourly_rate || 0),
      employmentType: row.employment_type,
      hireDate: row.hire_date,
      skills: row.skills || [],
      availability: row.availability || {},
      maxHoursPerWeek: row.max_hours_per_week,
      currentWeekHours: parseFloat(hoursResult.rows[0]?.total_hours || 0),
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json({ member });
  } catch (error) {
    console.error('Get staff member error:', error);
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
};

// Create staff member
export const createStaffMember = async (req: AuthRequest, res: Response) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      restaurantId, firstName, lastName, email, phone, role,
      hourlyRate, employmentType, hireDate, skills, availability, maxHoursPerWeek,
    } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO staff_members
       (restaurant_id, first_name, last_name, email, phone, role,
        hourly_rate, employment_type, hire_date, skills, availability, max_hours_per_week)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [restaurantId, firstName, lastName, email, phone, role,
       hourlyRate || 0, employmentType || 'full_time', hireDate,
       JSON.stringify(skills || []), JSON.stringify(availability || {}),
       maxHoursPerWeek || 40]
    );

    await client.query('COMMIT');

    const row = result.rows[0];
    res.status(201).json({
      member: {
        id: row.id,
        restaurantId: row.restaurant_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        hourlyRate: parseFloat(row.hourly_rate || 0),
        employmentType: row.employment_type,
        hireDate: row.hire_date,
        skills: row.skills || [],
        availability: row.availability || {},
        maxHoursPerWeek: row.max_hours_per_week,
        isActive: row.is_active,
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create staff member error:', error);
    res.status(500).json({ error: 'Failed to create staff member' });
  } finally {
    client.release();
  }
};

// Update staff member
export const updateStaffMember = async (req: AuthRequest, res: Response) => {
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
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      phone: 'phone',
      role: 'role',
      hourlyRate: 'hourly_rate',
      employmentType: 'employment_type',
      hireDate: 'hire_date',
      maxHoursPerWeek: 'max_hours_per_week',
      isActive: 'is_active',
    };

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      if (updates[key] !== undefined) {
        setClauses.push(`${dbField} = $${paramIndex++}`);
        values.push(updates[key]);
      }
    }

    if (updates.skills !== undefined) {
      setClauses.push(`skills = $${paramIndex++}`);
      values.push(JSON.stringify(updates.skills));
    }

    if (updates.availability !== undefined) {
      setClauses.push(`availability = $${paramIndex++}`);
      values.push(JSON.stringify(updates.availability));
    }

    if (setClauses.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await client.query(
      `UPDATE staff_members SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Staff member not found' });
    }

    await client.query('COMMIT');

    const row = result.rows[0];
    res.json({
      member: {
        id: row.id,
        restaurantId: row.restaurant_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        hourlyRate: parseFloat(row.hourly_rate || 0),
        employmentType: row.employment_type,
        hireDate: row.hire_date,
        skills: row.skills || [],
        availability: row.availability || {},
        maxHoursPerWeek: row.max_hours_per_week,
        isActive: row.is_active,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update staff member error:', error);
    res.status(500).json({ error: 'Failed to update staff member' });
  } finally {
    client.release();
  }
};

// Delete staff member
export const deleteStaffMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM staff_members WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Delete staff member error:', error);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
};

// Bulk delete staff members
export const bulkDeleteStaffMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const result = await query(
      'DELETE FROM staff_members WHERE id = ANY($1) RETURNING id',
      [ids]
    );

    res.json({
      message: `${result.rows.length} staff members deleted`,
      deletedCount: result.rows.length,
    });
  } catch (error) {
    console.error('Bulk delete staff error:', error);
    res.status(500).json({ error: 'Failed to bulk delete staff members' });
  }
};

// Bulk update staff members
export const bulkUpdateStaffMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'updates object is required' });
    }

    const fieldMapping: Record<string, string> = {
      role: 'role',
      employmentType: 'employment_type',
      hourlyRate: 'hourly_rate',
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
      `UPDATE staff_members SET ${setClauses.join(', ')}
       WHERE id = ANY($${paramIndex})
       RETURNING id`,
      values
    );

    res.json({
      message: `${result.rows.length} staff members updated`,
      updatedCount: result.rows.length,
    });
  } catch (error) {
    console.error('Bulk update staff error:', error);
    res.status(500).json({ error: 'Failed to bulk update staff members' });
  }
};

// Get all schedules
export const getSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId, staffMemberId, startDate, endDate } = req.query;

    let sql = `
      SELECT s.*, sm.first_name, sm.last_name, sm.role as staff_role
      FROM staff_schedules s
      JOIN staff_members sm ON s.staff_member_id = sm.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (restaurantId) {
      sql += ` AND s.restaurant_id = $${paramIndex++}`;
      params.push(restaurantId);
    }

    if (staffMemberId) {
      sql += ` AND s.staff_member_id = $${paramIndex++}`;
      params.push(staffMemberId);
    }

    if (startDate) {
      sql += ` AND s.shift_date >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND s.shift_date <= $${paramIndex++}`;
      params.push(endDate);
    }

    sql += ` ORDER BY s.shift_date, s.start_time`;

    const result = await query(sql, params);

    const schedules = result.rows.map(row => ({
      id: row.id,
      staffMemberId: row.staff_member_id,
      staffName: `${row.first_name} ${row.last_name}`,
      staffRole: row.staff_role,
      restaurantId: row.restaurant_id,
      shiftDate: row.shift_date,
      startTime: row.start_time,
      endTime: row.end_time,
      breakMinutes: row.break_minutes,
      roleForShift: row.role_for_shift,
      status: row.status,
      aiSuggested: row.ai_suggested,
      aiConfidence: row.ai_confidence ? parseFloat(row.ai_confidence) : null,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
};

// Get single schedule
export const getSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT s.*, sm.first_name, sm.last_name, sm.role as staff_role
       FROM staff_schedules s
       JOIN staff_members sm ON s.staff_member_id = sm.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const row = result.rows[0];
    res.json({
      schedule: {
        id: row.id,
        staffMemberId: row.staff_member_id,
        staffName: `${row.first_name} ${row.last_name}`,
        staffRole: row.staff_role,
        restaurantId: row.restaurant_id,
        shiftDate: row.shift_date,
        startTime: row.start_time,
        endTime: row.end_time,
        breakMinutes: row.break_minutes,
        roleForShift: row.role_for_shift,
        status: row.status,
        aiSuggested: row.ai_suggested,
        aiConfidence: row.ai_confidence ? parseFloat(row.ai_confidence) : null,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

// Create schedule
export const createSchedule = async (req: AuthRequest, res: Response) => {
  const client = await getClient();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      staffMemberId, restaurantId, shiftDate, startTime, endTime,
      breakMinutes, roleForShift, status, aiSuggested, aiConfidence, notes,
    } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO staff_schedules
       (staff_member_id, restaurant_id, shift_date, start_time, end_time,
        break_minutes, role_for_shift, status, ai_suggested, ai_confidence, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [staffMemberId, restaurantId, shiftDate, startTime, endTime,
       breakMinutes || 0, roleForShift, status || 'scheduled',
       aiSuggested || false, aiConfidence, notes]
    );

    await client.query('COMMIT');

    const row = result.rows[0];
    res.status(201).json({
      schedule: {
        id: row.id,
        staffMemberId: row.staff_member_id,
        restaurantId: row.restaurant_id,
        shiftDate: row.shift_date,
        startTime: row.start_time,
        endTime: row.end_time,
        breakMinutes: row.break_minutes,
        roleForShift: row.role_for_shift,
        status: row.status,
        aiSuggested: row.ai_suggested,
        aiConfidence: row.ai_confidence ? parseFloat(row.ai_confidence) : null,
        notes: row.notes,
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  } finally {
    client.release();
  }
};

// Update schedule
export const updateSchedule = async (req: AuthRequest, res: Response) => {
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
      staffMemberId: 'staff_member_id',
      shiftDate: 'shift_date',
      startTime: 'start_time',
      endTime: 'end_time',
      breakMinutes: 'break_minutes',
      roleForShift: 'role_for_shift',
      status: 'status',
      aiSuggested: 'ai_suggested',
      aiConfidence: 'ai_confidence',
      notes: 'notes',
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
      `UPDATE staff_schedules SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Schedule not found' });
    }

    await client.query('COMMIT');

    const row = result.rows[0];
    res.json({
      schedule: {
        id: row.id,
        staffMemberId: row.staff_member_id,
        restaurantId: row.restaurant_id,
        shiftDate: row.shift_date,
        startTime: row.start_time,
        endTime: row.end_time,
        breakMinutes: row.break_minutes,
        roleForShift: row.role_for_shift,
        status: row.status,
        aiSuggested: row.ai_suggested,
        aiConfidence: row.ai_confidence ? parseFloat(row.ai_confidence) : null,
        notes: row.notes,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  } finally {
    client.release();
  }
};

// Delete schedule
export const deleteSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM staff_schedules WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
};

// Bulk delete schedules
export const bulkDeleteSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    const result = await query(
      'DELETE FROM staff_schedules WHERE id = ANY($1) RETURNING id',
      [ids]
    );
    res.json({
      message: `${result.rows.length} schedules deleted`,
      deletedCount: result.rows.length,
    });
  } catch (error) {
    console.error('Bulk delete schedules error:', error);
    res.status(500).json({ error: 'Failed to bulk delete schedules' });
  }
};

// Bulk update schedules
export const bulkUpdateSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'updates object is required' });
    }

    const fieldMapping: Record<string, string> = {
      status: 'status',
      breakMinutes: 'break_minutes',
      roleForShift: 'role_for_shift',
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
      `UPDATE staff_schedules SET ${setClauses.join(', ')}
       WHERE id = ANY($${paramIndex})
       RETURNING id`,
      values
    );

    res.json({
      message: `${result.rows.length} schedules updated`,
      updatedCount: result.rows.length,
    });
  } catch (error) {
    console.error('Bulk update schedules error:', error);
    res.status(500).json({ error: 'Failed to bulk update schedules' });
  }
};

// AI optimize schedule
export const optimizeScheduleAI = async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantId, targetDate, expectedDemand } = req.body;

    // Get staff members
    const staffResult = await query(
      `SELECT sm.*,
        (SELECT SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 - (break_minutes / 60.0))
         FROM staff_schedules
         WHERE staff_member_id = sm.id
         AND shift_date >= DATE_TRUNC('week', $2::date)
         AND shift_date < DATE_TRUNC('week', $2::date) + INTERVAL '7 days'
        ) as current_week_hours
       FROM staff_members sm
       WHERE sm.restaurant_id = $1 AND sm.is_active = true`,
      [restaurantId, targetDate]
    );

    const staff = staffResult.rows.map(row => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`,
      role: row.role,
      maxHoursPerWeek: row.max_hours_per_week,
      currentWeekHours: parseFloat(row.current_week_hours || 0),
      skills: row.skills || [],
    }));

    // Get existing schedules
    const schedulesResult = await query(
      `SELECT * FROM staff_schedules
       WHERE restaurant_id = $1
       AND shift_date >= DATE_TRUNC('week', $2::date)
       AND shift_date < DATE_TRUNC('week', $2::date) + INTERVAL '7 days'`,
      [restaurantId, targetDate]
    );

    const existingSchedules = schedulesResult.rows.map(row => ({
      staffId: row.staff_member_id,
      date: row.shift_date.toISOString().split('T')[0],
      startTime: row.start_time,
      endTime: row.end_time,
    }));

    const optimization = await optimizeStaffSchedule({
      staff,
      existingSchedules,
      targetDate,
      expectedDemand: expectedDemand || 'medium',
    });

    res.json({ optimization });
  } catch (error) {
    console.error('Optimize schedule error:', error);
    res.status(500).json({ error: 'Failed to optimize schedule' });
  }
};

// AI analyze staff team
export const analyzeStaffAI = async (req: AuthRequest, res: Response) => {
  try {
    // Get all staff with hours
    const staffResult = await query(
      `SELECT sm.*,
        (SELECT SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 - (break_minutes / 60.0))
         FROM staff_schedules
         WHERE staff_member_id = sm.id
         AND shift_date >= DATE_TRUNC('week', CURRENT_DATE)
         AND shift_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
        ) as current_week_hours
       FROM staff_members sm
       WHERE sm.is_active = true
       ORDER BY sm.last_name, sm.first_name`
    );

    if (staffResult.rows.length === 0) {
      return res.status(400).json({ error: 'No staff members to analyze' });
    }

    // Count schedules
    const scheduleCount = await query(
      `SELECT COUNT(*) FROM staff_schedules WHERE shift_date >= DATE_TRUNC('week', CURRENT_DATE)`
    );

    const members = staffResult.rows.map(row => ({
      name: `${row.first_name} ${row.last_name}`,
      role: row.role,
      employmentType: row.employment_type,
      hourlyRate: parseFloat(row.hourly_rate || 0),
      skills: row.skills || [],
      maxHoursPerWeek: row.max_hours_per_week || 40,
      currentWeekHours: parseFloat(row.current_week_hours || 0),
      hireDate: row.hire_date ? new Date(row.hire_date).toISOString().split('T')[0] : undefined,
    }));

    const analysis = await analyzeStaff({
      members,
      scheduleCount: parseInt(scheduleCount.rows[0].count),
    });

    res.json({ analysis });
  } catch (error) {
    console.error('Analyze staff error:', error);
    res.status(500).json({ error: 'Failed to analyze staff' });
  }
};
