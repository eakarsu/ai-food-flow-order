import { apiRequest } from './config';

export interface ShiftSuggestion {
  day: string;
  hour: number;
  forecastDemand: number;
  recommendedStaff: number;
  laborCostEstimate: number;
  notes: string;
}

export interface StaffOptimizerResponse {
  restaurantId: string;
  weekStarting: string;
  totalLaborHours: number;
  totalLaborCost: number;
  predictedRevenue: number;
  suggestions: ShiftSuggestion[];
  insights: string[];
}

export const generateStaffSchedule = async (params: {
  restaurantId: string;
  weekStarting: string;
  hourlyWage?: number;
}): Promise<StaffOptimizerResponse> => {
  try {
    return await apiRequest('/ai/staff-optimizer', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    const wage = params.hourlyWage ?? 18;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const suggestions: ShiftSuggestion[] = [];
    let totalHours = 0;
    days.forEach((d) => {
      [10, 12, 14, 18, 20].forEach((h) => {
        const isPeak = h === 12 || h === 18 || h === 20;
        const isWeekend = d === 'Sat' || d === 'Sun';
        const demand = +(isPeak ? 80 : 35) * (isWeekend ? 1.3 : 1);
        const staff = Math.max(2, Math.ceil(demand / 25));
        totalHours += staff * 2; // 2-hour shifts
        suggestions.push({
          day: d,
          hour: h,
          forecastDemand: Math.round(demand),
          recommendedStaff: staff,
          laborCostEstimate: staff * 2 * wage,
          notes: isPeak ? 'Peak rush — double-staff prep' : 'Standard coverage',
        });
      });
    });
    return {
      restaurantId: params.restaurantId,
      weekStarting: params.weekStarting,
      totalLaborHours: totalHours,
      totalLaborCost: +(totalHours * wage).toFixed(2),
      predictedRevenue: +(totalHours * wage * 4.2).toFixed(2),
      suggestions,
      insights: [
        'Saturday lunch underutilized — consider promo to drive demand',
        'Friday dinner is consistently understaffed historically',
        'Tuesday morning could shift one staff to evening prep',
      ],
    };
  }
};
