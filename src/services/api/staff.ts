import { apiRequest } from './config';

// Types
export interface StaffMember {
  id: string;
  restaurantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: string;
  hourlyRate: number;
  employmentType: 'full_time' | 'part_time' | 'contractor';
  hireDate?: string;
  skills: string[];
  availability: Record<string, any>;
  maxHoursPerWeek: number;
  currentWeekHours?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffSchedule {
  id: string;
  staffMemberId: string;
  staffName?: string;
  staffRole?: string;
  restaurantId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  roleForShift?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  aiSuggested: boolean;
  aiConfidence?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleOptimization {
  suggestions: Array<{
    staffId: string;
    staffName: string;
    date: string;
    startTime: string;
    endTime: string;
    role: string;
    reason: string;
    confidence: number;
  }>;
  conflicts: Array<{ description: string }>;
  summary: string;
}

export interface CreateStaffMemberInput {
  restaurantId: string;
  firstName: string;
  lastName: string;
  role: string;
  email?: string;
  phone?: string;
  hourlyRate?: number;
  employmentType?: 'full_time' | 'part_time' | 'contractor';
  hireDate?: string;
  skills?: string[];
  availability?: Record<string, any>;
  maxHoursPerWeek?: number;
}

export interface UpdateStaffMemberInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  hourlyRate?: number;
  employmentType?: 'full_time' | 'part_time' | 'contractor';
  hireDate?: string;
  skills?: string[];
  availability?: Record<string, any>;
  maxHoursPerWeek?: number;
  isActive?: boolean;
}

export interface CreateScheduleInput {
  staffMemberId: string;
  restaurantId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  roleForShift?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface UpdateScheduleInput {
  staffMemberId?: string;
  shiftDate?: string;
  startTime?: string;
  endTime?: string;
  breakMinutes?: number;
  roleForShift?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

// Staff Members API
export const getStaffMembers = async (params?: {
  restaurantId?: string;
  role?: string;
  isActive?: boolean;
}): Promise<{ members: StaffMember[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.restaurantId) queryParams.set('restaurantId', params.restaurantId);
  if (params?.role) queryParams.set('role', params.role);
  if (params?.isActive !== undefined) queryParams.set('isActive', String(params.isActive));

  const queryString = queryParams.toString();
  return apiRequest(`/staff/members${queryString ? `?${queryString}` : ''}`);
};

export const getStaffMember = async (id: string): Promise<{ member: StaffMember }> => {
  return apiRequest(`/staff/members/${id}`);
};

export const createStaffMember = async (
  data: CreateStaffMemberInput
): Promise<{ member: StaffMember }> => {
  return apiRequest('/staff/members', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateStaffMember = async (
  id: string,
  data: UpdateStaffMemberInput
): Promise<{ member: StaffMember }> => {
  return apiRequest(`/staff/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteStaffMember = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/staff/members/${id}`, {
    method: 'DELETE',
  });
};

export const bulkDeleteStaffMembers = async (
  ids: string[]
): Promise<{ message: string; deletedCount: number }> => {
  return apiRequest('/staff/members/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
};

export const bulkUpdateStaffMembers = async (
  ids: string[],
  updates: { role?: string; employmentType?: string; hourlyRate?: number }
): Promise<{ message: string; updatedCount: number }> => {
  return apiRequest('/staff/members/bulk-update', {
    method: 'POST',
    body: JSON.stringify({ ids, updates }),
  });
};

// Schedules API
export const getSchedules = async (params?: {
  restaurantId?: string;
  staffMemberId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ schedules: StaffSchedule[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.restaurantId) queryParams.set('restaurantId', params.restaurantId);
  if (params?.staffMemberId) queryParams.set('staffMemberId', params.staffMemberId);
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);

  const queryString = queryParams.toString();
  return apiRequest(`/staff/schedules${queryString ? `?${queryString}` : ''}`);
};

export const getSchedule = async (id: string): Promise<{ schedule: StaffSchedule }> => {
  return apiRequest(`/staff/schedules/${id}`);
};

export const createSchedule = async (
  data: CreateScheduleInput
): Promise<{ schedule: StaffSchedule }> => {
  return apiRequest('/staff/schedules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateSchedule = async (
  id: string,
  data: UpdateScheduleInput
): Promise<{ schedule: StaffSchedule }> => {
  return apiRequest(`/staff/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteSchedule = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/staff/schedules/${id}`, {
    method: 'DELETE',
  });
};

export const bulkDeleteSchedules = async (
  ids: string[]
): Promise<{ message: string; deletedCount: number }> => {
  return apiRequest('/staff/schedules/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
};

export const bulkUpdateSchedules = async (
  ids: string[],
  updates: { status?: string; breakMinutes?: number; roleForShift?: string }
): Promise<{ message: string; updatedCount: number }> => {
  return apiRequest('/staff/schedules/bulk-update', {
    method: 'POST',
    body: JSON.stringify({ ids, updates }),
  });
};

// Staff Analysis Types
export interface StaffAnalysis {
  summary: string;
  teamComposition: string;
  costAnalysis: string;
  skillGaps: Array<{ gap: string; impact: string; recommendation: string }>;
  performanceInsights: Array<{ insight: string; details: string }>;
  actionItems: Array<{ priority: 'high' | 'medium' | 'low'; action: string; reason: string }>;
  strengths: string[];
  risks: string[];
}

// AI Staff Analysis
export const analyzeStaff = async (): Promise<{ analysis: StaffAnalysis }> => {
  return apiRequest('/staff/analyze', {
    method: 'POST',
  });
};

// AI Optimization
export const optimizeSchedule = async (data: {
  restaurantId: string;
  targetDate: string;
  expectedDemand?: 'low' | 'medium' | 'high';
}): Promise<{ optimization: ScheduleOptimization }> => {
  return apiRequest('/staff/optimize', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
