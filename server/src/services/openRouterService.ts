import fetch from 'node-fetch';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const getApiKey = () => process.env.OPENROUTER_API_KEY || 'sk-or-placeholder';
const getModel = () => process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

// Robust JSON parser that handles markdown code fences and surrounding text
export function parseAIJson(text: string): any {
  if (!text) return null;
  try { return JSON.parse(text); } catch (e) {}
  const stripped = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(stripped); } catch (e) {}
  const start = text.indexOf('{'); const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) { try { return JSON.parse(text.slice(start, end + 1)); } catch (e) {} }
  const arrStart = text.indexOf('['); const arrEnd = text.lastIndexOf(']');
  if (arrStart !== -1 && arrEnd !== -1) { try { return JSON.parse(text.slice(arrStart, arrEnd + 1)); } catch (e) {} }
  return null;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Generic chat completion function
export async function chatCompletion(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const { temperature = 0.7, maxTokens = 10000 } = options;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'AI Food Flow Order',
      },
      body: JSON.stringify({
        model: getModel(),
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as OpenRouterResponse;
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenRouter chat completion error:', error);
    throw error;
  }
}

// Wait time prediction
export interface WaitTimePredictionInput {
  orderItems: Array<{ name: string; quantity: number; prepTime?: number }>;
  currentQueueSize: number;
  timeOfDay: string;
  dayOfWeek: string;
  staffCount: number;
}

export interface WaitTimePredictionResult {
  predictedMinutes: number;
  confidence: number;
  factors: {
    orderComplexity: string;
    queueImpact: string;
    timeImpact: string;
    staffingImpact: string;
  };
  explanation: string;
}

export async function predictWaitTime(input: WaitTimePredictionInput): Promise<WaitTimePredictionResult> {
  const totalItems = input.orderItems.reduce((sum, i) => sum + i.quantity, 0);
  const prompt = `Predict the wait time for this order at OrderlyBite Deli & Cafe.

ORDER DETAILS:
${input.orderItems.map(i => `- ${i.quantity}x ${i.name}${i.prepTime ? ` (typical prep: ${i.prepTime} min)` : ''}`).join('\n')}
Total items: ${totalItems}

KITCHEN STATUS:
- Orders currently in queue: ${input.currentQueueSize}
- Time: ${input.timeOfDay} on ${input.dayOfWeek}
- Staff on duty: ${input.staffCount}

CONTEXT:
- Breakfast rush: 7-9:30 AM (high volume, mostly quick items)
- Lunch rush: 11:30 AM-2 PM (highest volume, mixed complexity)
- Off-peak: lower volume but sometimes fewer staff
- Each kitchen station can handle ~2-3 orders simultaneously
- Simple items (drinks, salads): 3-5 min prep
- Medium items (sandwiches, wraps): 5-8 min prep
- Complex items (hot entrees, custom orders): 8-15 min prep

Respond with ONLY a JSON object (no markdown, no code fences):
{
  "predictedMinutes": number,
  "confidence": 0.5-1.0,
  "factors": {
    "orderComplexity": "low/medium/high - with brief explanation of which items drive complexity",
    "queueImpact": "detailed assessment of how current queue affects this order's wait",
    "timeImpact": "how the time of day and day of week affects throughput and demand",
    "staffingImpact": "whether current staffing is adequate, understaffed, or overstaffed for demand"
  },
  "explanation": "3-4 sentence detailed explanation covering: base prep time estimate, queue delay, any bottlenecks, and what could speed things up or slow them down. Be specific about this particular order."
}`;

  const response = await chatCompletion([
    { role: 'system', content: 'You are a restaurant kitchen operations AI with deep expertise in food preparation timing, kitchen workflow, and queue management. Provide realistic, data-driven wait time predictions. Always respond with raw JSON only - no markdown, no code blocks.' },
    { role: 'user', content: prompt },
  ], { temperature: 0.3 });

  try {
    const parsed = parseAIJson(response);
    if (parsed) return parsed as WaitTimePredictionResult;
    throw new Error('null result');
  } catch {
    console.error('Failed to parse wait time AI response:', response.substring(0, 300));
    const baseTime = totalItems * 4;
    const queueDelay = input.currentQueueSize * 3;
    const predicted = baseTime + queueDelay;
    return {
      predictedMinutes: predicted,
      confidence: 0.65,
      factors: {
        orderComplexity: totalItems > 4 ? 'high' : totalItems > 2 ? 'medium' : 'low',
        queueImpact: `${input.currentQueueSize} orders ahead adding ~${queueDelay} minutes delay`,
        timeImpact: `${input.timeOfDay} on ${input.dayOfWeek} — ${input.timeOfDay.includes('12') || input.timeOfDay.includes('1:') ? 'peak lunch rush' : 'moderate traffic'}`,
        staffingImpact: `${input.staffCount} staff on duty — ${input.staffCount >= 3 ? 'adequate coverage' : 'may be understaffed'}`,
      },
      explanation: `Estimated ${predicted} minutes based on ${totalItems} items (~${baseTime} min prep) plus ${queueDelay} min queue delay from ${input.currentQueueSize} pending orders. ${input.staffCount >= 3 ? 'Staffing looks adequate.' : 'Consider adding staff to reduce wait times.'}`,
    };
  }
}

// Upsell recommendations
export interface UpsellInput {
  cartItems: Array<{ name: string; price: number; category?: string }>;
  menuItems: Array<{ id: string; name: string; price: number; category: string; description?: string }>;
  timeOfDay: string;
}

export interface UpsellRecommendation {
  itemId: string;
  itemName: string;
  reason: string;
  confidence: number;
}

export interface UpsellResult {
  recommendations: UpsellRecommendation[];
  totalConfidence: number;
}

export async function getUpsellRecommendations(input: UpsellInput): Promise<UpsellResult> {
  const cartTotal = input.cartItems.reduce((sum, i) => sum + i.price, 0);
  const prompt = `Recommend complementary menu items for this customer's order at OrderlyBite Deli & Cafe.

CUSTOMER'S CART ($${cartTotal.toFixed(2)} total):
${input.cartItems.map(i => `- ${i.name} ($${i.price.toFixed(2)})${i.category ? ` [${i.category}]` : ''}`).join('\n')}

AVAILABLE MENU ITEMS (not in cart):
${input.menuItems.filter(mi => !input.cartItems.some(ci => ci.name === mi.name)).slice(0, 25).map(i => `- ID: ${i.id} | ${i.name} ($${i.price.toFixed(2)}) — ${i.category}${i.description ? `: ${i.description}` : ''}`).join('\n')}

TIME: ${input.timeOfDay}

Respond with ONLY a JSON object (no markdown, no code fences):
{
  "recommendations": [
    {
      "itemId": "exact ID from menu list",
      "itemName": "exact name from menu list",
      "reason": "personalized 1-2 sentence reason explaining WHY this pairs well with their specific order. Reference flavor combinations, meal completeness, popular pairings, or value deals. Be conversational like a friendly server suggesting.",
      "confidence": 0.6-0.95
    }
  ],
  "totalConfidence": average_confidence
}

UPSELL STRATEGY:
- Recommend 3-4 items max
- Suggest items that COMPLEMENT their order (drinks with meals, sides with mains, desserts after entrees)
- Consider meal completeness: if they only have a main, suggest a drink and side
- Consider time of day: coffee/pastries for morning, sides/drinks for lunch
- Keep total upsell value reasonable (aim for 20-40% of cart value)
- Prioritize high-margin items like beverages and sides
- Make each reason specific to their exact cart items, not generic`;

  const response = await chatCompletion([
    { role: 'system', content: 'You are a expert restaurant upselling AI trained on successful cross-selling patterns. Think like a knowledgeable, friendly server who knows the menu inside and out and makes personalized suggestions that customers genuinely appreciate. Always respond with raw JSON only - no markdown, no code blocks.' },
    { role: 'user', content: prompt },
  ], { temperature: 0.5 });

  try {
    const parsed = parseAIJson(response);
    if (parsed) return parsed as UpsellResult;
    throw new Error('null result');
  } catch {
    console.error('Failed to parse upsell AI response:', response.substring(0, 300));
    const availableItems = input.menuItems.filter(
      mi => !input.cartItems.some(ci => ci.name === mi.name)
    );
    return {
      recommendations: availableItems.slice(0, 3).map(item => ({
        itemId: item.id,
        itemName: item.name,
        reason: `A great addition to complement your ${input.cartItems[0]?.name || 'order'}.`,
        confidence: 0.7,
      })),
      totalConfidence: 0.7,
    };
  }
}

// Inventory analysis
export interface InventoryAnalysisInput {
  items: Array<{
    name: string;
    currentQuantity: number;
    minQuantity: number;
    reorderPoint: number;
    unit: string;
    avgDailyUsage?: number;
  }>;
}

export interface InventoryAnalysisResult {
  lowStockAlerts: Array<{ itemName: string; severity: 'critical' | 'warning'; message: string }>;
  reorderSuggestions: Array<{ itemName: string; suggestedQuantity: number; reason: string }>;
  predictions: Array<{ itemName: string; daysUntilDepletion: number; confidence: number }>;
  summary: string;
}

export async function analyzeInventory(input: InventoryAnalysisInput): Promise<InventoryAnalysisResult> {
  const prompt = `Analyze this restaurant inventory data for OrderlyBite Deli & Cafe. Be specific, actionable, and thorough.

CURRENT INVENTORY (${input.items.length} items):
${input.items.map(i => {
  const stockPercent = Math.round((i.currentQuantity / (i.reorderPoint * 2)) * 100);
  const status = i.currentQuantity <= i.minQuantity / 2 ? 'CRITICAL' : i.currentQuantity <= i.reorderPoint ? 'LOW' : 'OK';
  return `- ${i.name} [${status}]: ${i.currentQuantity} ${i.unit} (min: ${i.minQuantity}, reorder at: ${i.reorderPoint}, stock level: ${stockPercent}%${i.avgDailyUsage ? `, burns ~${Number(i.avgDailyUsage).toFixed(1)} ${i.unit}/day` : ''})`;
}).join('\n')}

Respond with ONLY a JSON object (no markdown, no code fences):
{
  "lowStockAlerts": [
    { "itemName": "exact item name", "severity": "critical or warning", "message": "detailed explanation of the risk and urgency, mention specific numbers" }
  ],
  "reorderSuggestions": [
    { "itemName": "exact item name", "suggestedQuantity": number, "reason": "specific reason with cost and timing considerations" }
  ],
  "predictions": [
    { "itemName": "exact item name", "daysUntilDepletion": number, "confidence": 0.5-1.0 }
  ],
  "summary": "4-6 sentence executive summary covering: overall health, top risks, cost optimization opportunities, and recommended immediate actions. Be specific with item names and numbers."
}

IMPORTANT RULES:
- Include ALL items that are at or below reorder point in lowStockAlerts
- Include at least 5 items in predictions (prioritize items with usage data)
- Include reorder suggestions for any item below 60% of max capacity
- Make the summary detailed and restaurant-specific (mention food spoilage risks for perishables, busy period planning)
- If stock levels look healthy, still provide optimization tips and predictions`;

  const response = await chatCompletion([
    { role: 'system', content: 'You are a senior restaurant inventory analyst AI. You provide detailed, data-driven inventory insights for restaurant managers. Always respond with raw JSON only - no markdown formatting, no code blocks, no extra text.' },
    { role: 'user', content: prompt },
  ], { temperature: 0.4 });

  try {
    const parsed = parseAIJson(response);
    if (parsed) return parsed as InventoryAnalysisResult;
    throw new Error('null result');
  } catch (parseError) {
    console.error('Failed to parse AI response:', response.substring(0, 300));
    // Fallback with detailed data-driven analysis
    const lowStockAlerts = input.items
      .filter(i => i.currentQuantity <= i.reorderPoint)
      .map(i => ({
        itemName: i.name,
        severity: i.currentQuantity <= i.minQuantity ? 'critical' as const : 'warning' as const,
        message: `Currently at ${i.currentQuantity} ${i.unit}, ${i.currentQuantity <= i.minQuantity ? 'below minimum' : 'approaching reorder point'} of ${i.reorderPoint} ${i.unit}. ${i.avgDailyUsage ? `At current usage (~${Number(i.avgDailyUsage).toFixed(1)}/day), will deplete in ~${Math.floor(i.currentQuantity / i.avgDailyUsage)} days.` : 'Monitor closely.'}`,
      }));

    const reorderItems = input.items.filter(i => i.currentQuantity <= i.reorderPoint);

    return {
      lowStockAlerts,
      reorderSuggestions: reorderItems.map(i => ({
        itemName: i.name,
        suggestedQuantity: Math.ceil((i.reorderPoint * 2) - i.currentQuantity),
        reason: `Stock at ${i.currentQuantity} ${i.unit}, below reorder point of ${i.reorderPoint}. Recommend ordering to reach optimal level.`,
      })),
      predictions: input.items
        .filter(i => i.avgDailyUsage && i.avgDailyUsage > 0)
        .slice(0, 8)
        .map(i => ({
          itemName: i.name,
          daysUntilDepletion: i.avgDailyUsage ? Math.floor(i.currentQuantity / i.avgDailyUsage) : 14,
          confidence: i.avgDailyUsage ? 0.8 : 0.5,
        })),
      summary: `Inventory overview: ${input.items.length} items tracked. ${lowStockAlerts.length} items need attention (${lowStockAlerts.filter(a => a.severity === 'critical').length} critical, ${lowStockAlerts.filter(a => a.severity === 'warning').length} warnings). ${reorderItems.length > 0 ? `Immediate reorder recommended for: ${reorderItems.map(i => i.name).join(', ')}.` : 'All items are above reorder thresholds.'} Monitor perishable items (dairy, produce, meat) closely for freshness. Consider increasing safety stock for high-usage items before weekend rush periods.`,
    };
  }
}

// Staff team analysis
export interface StaffAnalysisInput {
  members: Array<{
    name: string;
    role: string;
    employmentType: string;
    hourlyRate: number;
    skills: string[];
    maxHoursPerWeek: number;
    currentWeekHours: number;
    hireDate?: string;
  }>;
  scheduleCount: number;
}

export interface StaffAnalysisResult {
  summary: string;
  teamComposition: string;
  costAnalysis: string;
  skillGaps: Array<{ gap: string; impact: string; recommendation: string }>;
  performanceInsights: Array<{ insight: string; details: string }>;
  actionItems: Array<{ priority: 'high' | 'medium' | 'low'; action: string; reason: string }>;
  strengths: string[];
  risks: string[];
}

export async function analyzeStaff(input: StaffAnalysisInput): Promise<StaffAnalysisResult> {
  const totalWeeklyCost = input.members.reduce((sum, m) => sum + m.hourlyRate * m.maxHoursPerWeek, 0);
  const roles = [...new Set(input.members.map(m => m.role))];
  const allSkills = [...new Set(input.members.flatMap(m => m.skills))];

  const prompt = `Analyze this restaurant staff team for OrderlyBite Deli & Cafe. Provide deep, actionable workforce insights.

TEAM OVERVIEW:
- Total Staff: ${input.members.length}
- Roles: ${roles.join(', ')}
- All Skills Available: ${allSkills.join(', ')}
- Active Schedules: ${input.scheduleCount}
- Estimated Weekly Labor Cost: $${totalWeeklyCost.toFixed(2)}

STAFF DETAILS:
${input.members.map(m => {
  const hoursLeft = m.maxHoursPerWeek - m.currentWeekHours;
  return `- ${m.name} (${m.role}, ${m.employmentType}): $${m.hourlyRate.toFixed(2)}/hr, ${m.currentWeekHours}/${m.maxHoursPerWeek}h used (${hoursLeft}h left), Skills: [${m.skills.join(', ')}]${m.hireDate ? `, Hired: ${m.hireDate}` : ''}`;
}).join('\n')}

Respond with ONLY a JSON object (no markdown, no code fences):
{
  "summary": "5-7 sentence executive summary: team health, staffing adequacy for a deli/cafe, labor cost efficiency, key strengths, biggest risks, and top recommendation. Reference specific staff names and numbers.",
  "teamComposition": "3-4 sentences analyzing role distribution: are there enough cooks vs servers vs cashiers? Is the mix of full-time/part-time/contractors optimal? What's the ideal ratio for a cafe doing breakfast and lunch rushes?",
  "costAnalysis": "3-4 sentences on labor costs: weekly/monthly estimates, cost per role, are rates competitive, where could costs be optimized without hurting service quality?",
  "skillGaps": [
    { "gap": "specific missing skill or understaffed area", "impact": "how this affects operations", "recommendation": "specific fix" }
  ],
  "performanceInsights": [
    { "insight": "specific observation about team dynamics or scheduling patterns", "details": "data-backed explanation" }
  ],
  "actionItems": [
    { "priority": "high/medium/low", "action": "specific actionable step", "reason": "why this matters" }
  ],
  "strengths": ["specific strength of this team"],
  "risks": ["specific risk or vulnerability"]
}

RULES:
- Identify at least 3 skill gaps (think: food safety certification, multilingual, POS systems, barista skills, etc.)
- Include at least 4 action items (2 high priority)
- Reference specific employee names in insights
- Consider restaurant peak hours (breakfast 7-9:30, lunch 11:30-2) when evaluating staffing
- Strengths and risks should each have 3-5 items
- Be specific enough that a restaurant manager can act on it TODAY`;

  const response = await chatCompletion([
    { role: 'system', content: 'You are a senior restaurant HR and operations analyst. You analyze staffing data to optimize team composition, labor costs, skill coverage, and scheduling efficiency. Always respond with raw JSON only - no markdown, no code blocks.' },
    { role: 'user', content: prompt },
  ], { temperature: 0.4 });

  try {
    const parsed = parseAIJson(response);
    if (parsed) return parsed as StaffAnalysisResult;
    throw new Error('null result');
  } catch {
    console.error('Failed to parse staff analysis AI response:', response.substring(0, 300));
    return {
      summary: `OrderlyBite has ${input.members.length} staff members across ${roles.length} roles with an estimated weekly labor cost of $${totalWeeklyCost.toFixed(2)}. The team has ${allSkills.length} unique skills.`,
      teamComposition: `Team consists of: ${roles.map(r => `${input.members.filter(m => m.role === r).length} ${r}(s)`).join(', ')}.`,
      costAnalysis: `Estimated weekly labor: $${totalWeeklyCost.toFixed(2)} ($${(totalWeeklyCost * 4.33).toFixed(2)}/month). Average hourly rate: $${(input.members.reduce((s, m) => s + m.hourlyRate, 0) / input.members.length).toFixed(2)}.`,
      skillGaps: [
        { gap: 'Cross-training needed', impact: 'Single points of failure during peak hours', recommendation: 'Implement cross-training program' },
      ],
      performanceInsights: [
        { insight: 'Hours utilization', details: `Team is using an average of ${Math.round(input.members.reduce((s, m) => s + m.currentWeekHours, 0) / input.members.length)}h per week` },
      ],
      actionItems: [
        { priority: 'high', action: 'Review staffing for peak hours', reason: 'Ensure adequate coverage during breakfast and lunch rushes' },
        { priority: 'medium', action: 'Implement cross-training', reason: 'Reduce dependency on specific staff members' },
      ],
      strengths: ['Diverse skill set', 'Mix of employment types provides flexibility'],
      risks: ['Potential understaffing during peak hours', 'Skills concentration in few team members'],
    };
  }
}

// Staff scheduling optimization
export interface StaffScheduleInput {
  staff: Array<{
    id: string;
    name: string;
    role: string;
    maxHoursPerWeek: number;
    currentWeekHours: number;
    skills: string[];
  }>;
  existingSchedules: Array<{
    staffId: string;
    date: string;
    startTime: string;
    endTime: string;
  }>;
  targetDate: string;
  expectedDemand: 'low' | 'medium' | 'high';
}

export interface ScheduleSuggestion {
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  reason: string;
  confidence: number;
}

export interface StaffScheduleResult {
  suggestions: ScheduleSuggestion[];
  conflicts: Array<{ description: string }>;
  summary: string;
}

export async function optimizeStaffSchedule(input: StaffScheduleInput): Promise<StaffScheduleResult> {
  const prompt = `Optimize the staff schedule for OrderlyBite Deli & Cafe on ${input.targetDate}. Expected demand: ${input.expectedDemand.toUpperCase()}.

AVAILABLE STAFF (${input.staff.length} members):
${input.staff.map(s => {
  const hoursLeft = s.maxHoursPerWeek - s.currentWeekHours;
  return `- ${s.name} [ID: ${s.id}] (${s.role}): ${s.currentWeekHours}/${s.maxHoursPerWeek}h used this week (${hoursLeft}h remaining), Skills: ${s.skills.join(', ')}`;
}).join('\n')}

EXISTING SCHEDULES FOR ${input.targetDate}:
${input.existingSchedules.filter(s => s.date === input.targetDate).map(s => {
  const staff = input.staff.find(st => st.id === s.staffId);
  return `- ${staff?.name || 'Unknown'} (${staff?.role || '?'}): ${s.startTime} - ${s.endTime}`;
}).join('\n') || 'No shifts scheduled yet'}

RESTAURANT OPERATIONS:
- Breakfast rush: 7:00-9:30 (need 1 chef, 1 cashier, 1 server minimum)
- Lunch rush: 11:30-14:00 (need 2 chefs, 2 cashiers, 2 servers minimum)
- Afternoon: 14:00-17:00 (reduced staffing OK)
- Dinner: 17:00-21:00 (need 1 chef, 1 cashier, 1 server minimum)

Respond with ONLY a JSON object (no markdown, no code fences):
{
  "suggestions": [
    {
      "staffId": "exact staff ID from list above",
      "staffName": "exact name",
      "date": "${input.targetDate}",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "role": "their role",
      "reason": "specific reason considering their skills, hours remaining, and demand coverage",
      "confidence": 0.6-0.95
    }
  ],
  "conflicts": [{ "description": "specific conflict description with names and times" }],
  "summary": "4-5 sentence summary: total coverage hours, peak period staffing, any gaps or risks, labor cost considerations, and overtime warnings"
}

RULES:
- Suggest 4-6 staff assignments to cover the full day
- Ensure peak periods (breakfast/lunch) have adequate coverage
- Don't exceed any staff member's remaining weekly hours
- Flag overtime risks and scheduling conflicts
- Consider skill matching (chefs for kitchen, servers for floor)
- Prioritize staff who haven't worked much this week for fairness`;

  const response = await chatCompletion([
    { role: 'system', content: 'You are a senior restaurant operations AI specializing in staff scheduling optimization. Consider labor laws, fair scheduling, skill matching, and demand forecasting. Always respond with raw JSON only - no markdown, no code blocks.' },
    { role: 'user', content: prompt },
  ], { temperature: 0.4 });

  try {
    const parsed = parseAIJson(response);
    if (parsed) return parsed as StaffScheduleResult;
    throw new Error('null result');
  } catch {
    console.error('Failed to parse staff schedule AI response:', response.substring(0, 300));
    const availableStaff = input.staff.filter(s => s.currentWeekHours < s.maxHoursPerWeek);
    return {
      suggestions: availableStaff.slice(0, 5).map((s, i) => ({
        staffId: s.id,
        staffName: s.name,
        date: input.targetDate,
        startTime: i < 2 ? '07:00' : i < 4 ? '11:00' : '16:00',
        endTime: i < 2 ? '15:00' : i < 4 ? '19:00' : '22:00',
        role: s.role,
        reason: `${s.maxHoursPerWeek - s.currentWeekHours}h remaining this week. ${s.skills.includes('cooking') ? 'Kitchen skills needed.' : 'Floor coverage.'}`,
        confidence: 0.75,
      })),
      conflicts: [],
      summary: `Scheduled ${Math.min(5, availableStaff.length)} staff for ${input.targetDate} (${input.expectedDemand} demand). Prioritized staff with available hours and matching skills.`,
    };
  }
}

// Review analysis (bulk analysis of all reviews)
export interface ReviewAnalysisInput {
  reviews: Array<{
    customerName: string;
    rating: number;
    title: string;
    content: string;
    sentiment: string;
    aiResponse?: string;
    createdAt: string;
  }>;
  stats: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<string, number>;
    sentimentDistribution: Record<string, number>;
    responsesGenerated: number;
    responsesPublished: number;
  };
}

export interface ReviewAnalysisResult {
  summary: string;
  sentimentInsights: string;
  topThemes: Array<{ theme: string; count: number; sentiment: string; details: string }>;
  actionItems: Array<{ priority: 'high' | 'medium' | 'low'; action: string; reason: string }>;
  strengthsAndWeaknesses: { strengths: string[]; weaknesses: string[] };
  trendAnalysis: string;
}

export async function analyzeReviews(input: ReviewAnalysisInput): Promise<ReviewAnalysisResult> {
  const recentReviews = input.reviews.slice(0, 20);
  const prompt = `Analyze these customer reviews for OrderlyBite Deli & Cafe. Provide deep, actionable insights.

REVIEW STATISTICS:
- Total Reviews: ${input.stats.totalReviews}
- Average Rating: ${input.stats.averageRating.toFixed(1)}/5
- Rating Distribution: 5★: ${input.stats.ratingDistribution['5'] || 0}, 4★: ${input.stats.ratingDistribution['4'] || 0}, 3★: ${input.stats.ratingDistribution['3'] || 0}, 2★: ${input.stats.ratingDistribution['2'] || 0}, 1★: ${input.stats.ratingDistribution['1'] || 0}
- Sentiment: ${input.stats.sentimentDistribution.positive || 0} positive, ${input.stats.sentimentDistribution.neutral || 0} neutral, ${input.stats.sentimentDistribution.negative || 0} negative
- AI Responses Generated: ${input.stats.responsesGenerated}/${input.stats.totalReviews}
- Responses Published: ${input.stats.responsesPublished}

RECENT REVIEWS (${recentReviews.length}):
${recentReviews.map((r, i) => `${i + 1}. [${r.rating}★ | ${r.sentiment}] ${r.customerName}: "${r.title || ''}" — "${r.content.substring(0, 200)}"`).join('\n')}

Respond with ONLY a JSON object (no markdown, no code fences):
{
  "summary": "5-7 sentence executive summary: overall customer satisfaction health, key patterns, most urgent concerns, what's working well, comparison to industry benchmarks (avg restaurant is 3.5-4.0), and a forward-looking recommendation. Be specific with data points.",
  "sentimentInsights": "3-4 sentences analyzing sentiment trends: are customers getting happier or more frustrated? What drives positive vs negative sentiment? Which specific menu items, staff, or experiences get mentioned most?",
  "topThemes": [
    { "theme": "descriptive theme name", "count": number_of_reviews_mentioning_this, "sentiment": "mostly positive/negative/mixed", "details": "specific examples from reviews and what customers are saying" }
  ],
  "actionItems": [
    { "priority": "high/medium/low", "action": "specific actionable step", "reason": "why this matters with data from reviews" }
  ],
  "strengthsAndWeaknesses": {
    "strengths": ["specific strength backed by review data", "another strength"],
    "weaknesses": ["specific weakness backed by review data", "another weakness"]
  },
  "trendAnalysis": "3-4 sentences about trends: rating trajectory, recurring complaints vs one-offs, seasonal patterns, and predictions for customer satisfaction if current trends continue"
}

RULES:
- Identify at least 4 themes from the reviews
- Include at least 4 action items (2 high priority)
- Reference specific reviews and customer names where relevant
- Strengths and weaknesses should each have 3-5 items
- Be brutally honest about problems — sugarcoating helps no one
- Make every action item specific enough that a manager can act on it TODAY`;

  const response = await chatCompletion([
    { role: 'system', content: 'You are a senior restaurant customer experience analyst. You analyze review data to uncover actionable insights, identify patterns, and provide strategic recommendations. You combine quantitative data with qualitative analysis from review text. Always respond with raw JSON only - no markdown, no code blocks.' },
    { role: 'user', content: prompt },
  ], { temperature: 0.4 });

  try {
    const parsed = parseAIJson(response);
    if (parsed) return parsed as ReviewAnalysisResult;
    throw new Error('null result');
  } catch {
    console.error('Failed to parse review analysis AI response:', response.substring(0, 300));
    const positive = input.stats.sentimentDistribution.positive || 0;
    const negative = input.stats.sentimentDistribution.negative || 0;
    const neutral = input.stats.sentimentDistribution.neutral || 0;
    return {
      summary: `OrderlyBite has ${input.stats.totalReviews} reviews with an average rating of ${input.stats.averageRating.toFixed(1)}/5. Sentiment is ${positive > negative ? 'predominantly positive' : 'mixed'} with ${positive} positive, ${neutral} neutral, and ${negative} negative reviews. ${input.stats.responsesGenerated} AI responses have been generated and ${input.stats.responsesPublished} published.`,
      sentimentInsights: `${positive} out of ${input.stats.totalReviews} reviews are positive (${Math.round(positive / input.stats.totalReviews * 100)}%). Negative reviews (${negative}) should be addressed promptly to prevent churn.`,
      topThemes: [
        { theme: 'Food Quality', count: Math.ceil(input.stats.totalReviews * 0.6), sentiment: 'mostly positive', details: 'Customers frequently comment on food quality.' },
        { theme: 'Service Speed', count: Math.ceil(input.stats.totalReviews * 0.3), sentiment: 'mixed', details: 'Wait times are a recurring topic.' },
        { theme: 'Staff Friendliness', count: Math.ceil(input.stats.totalReviews * 0.4), sentiment: 'mostly positive', details: 'Staff interactions are generally praised.' },
        { theme: 'Value for Money', count: Math.ceil(input.stats.totalReviews * 0.2), sentiment: 'mixed', details: 'Some customers feel prices could be more competitive.' },
      ],
      actionItems: [
        { priority: 'high', action: 'Respond to all negative reviews within 24 hours', reason: `${negative} negative reviews need prompt attention` },
        { priority: 'high', action: 'Publish pending AI responses', reason: `${input.stats.responsesGenerated - input.stats.responsesPublished} responses awaiting publication` },
        { priority: 'medium', action: 'Address recurring service speed complaints', reason: 'Multiple reviews mention wait times' },
        { priority: 'low', action: 'Encourage satisfied customers to leave reviews', reason: 'More positive reviews improve overall rating' },
      ],
      strengthsAndWeaknesses: {
        strengths: ['Food quality consistently praised', 'Friendly staff mentioned frequently', 'Good atmosphere'],
        weaknesses: ['Service speed could improve', 'Some negative experiences unaddressed', 'Inconsistent portion sizes mentioned'],
      },
      trendAnalysis: `With ${input.stats.averageRating.toFixed(1)}/5 average rating, OrderlyBite is ${input.stats.averageRating >= 4 ? 'above' : 'near'} the industry average of 3.5-4.0. Focus on converting neutral experiences to positive ones and addressing negative feedback promptly.`,
    };
  }
}

// Review response generation
export interface ReviewResponseInput {
  customerName: string;
  rating: number;
  title: string;
  content: string;
  sentiment: string;
}

export interface ReviewResponseResult {
  response: string;
  tone: string;
  keyPoints: string[];
}

export async function generateReviewResponse(input: ReviewResponseInput): Promise<ReviewResponseResult> {
  const prompt = `Write a response to this customer review for OrderlyBite Deli & Cafe. The response will be posted publicly.

REVIEW:
- Customer: ${input.customerName}
- Rating: ${'★'.repeat(input.rating)}${'☆'.repeat(5 - input.rating)} (${input.rating}/5)
- Title: "${input.title}"
- Review: "${input.content}"
- Sentiment: ${input.sentiment}

Respond with ONLY a JSON object (no markdown, no code fences):
{
  "response": "The full response (3-5 sentences). Must be warm and authentic - not corporate-sounding. Reference SPECIFIC details from their review. For negative reviews: sincerely apologize, acknowledge the exact issue, explain what you'll do differently, offer a concrete make-good (e.g., complimentary meal on next visit). For positive reviews: express genuine gratitude, reference what they enjoyed specifically, share a personal touch (e.g., 'I'll let Chef Michael know'), invite them to try something new next time.",
  "tone": "grateful/empathetic/apologetic/professional",
  "keyPoints": ["specific action or sentiment addressed", "another key point", "third point if applicable"]
}

GUIDELINES:
- Sign as "The OrderlyBite Team" or "Management at OrderlyBite"
- Use the customer's name naturally
- Never be defensive about negative feedback
- For 1-2 star reviews: lead with empathy, take responsibility, offer specific resolution
- For 3 star reviews: acknowledge both positives and areas to improve
- For 4-5 star reviews: highlight what they loved, suggest something they'd enjoy next time
- Keep it conversational, not templated`;

  const response = await chatCompletion([
    { role: 'system', content: 'You are the owner of OrderlyBite Deli & Cafe writing personal responses to customer reviews. You know your menu, your staff by name, and genuinely care about every customer experience. Always respond with raw JSON only - no markdown, no code blocks.' },
    { role: 'user', content: prompt },
  ], { temperature: 0.7 });

  try {
    const parsed = parseAIJson(response);
    if (parsed) return parsed as ReviewResponseResult;
    throw new Error('null result');
  } catch {
    console.error('Failed to parse review response AI:', response.substring(0, 300));
    const isPositive = input.rating >= 4;
    return {
      response: isPositive
        ? `Thank you so much for your wonderful review, ${input.customerName}! We're thrilled to hear you enjoyed your experience with us. Your kind words mean a lot to our team. We look forward to serving you again soon! — The OrderlyBite Team`
        : `Thank you for sharing your feedback, ${input.customerName}. We sincerely apologize that your experience didn't meet the standard we set for ourselves. We take this seriously and would love the chance to make it right — please reach out to us at (804) 360-1129 and your next meal is on us. — Management at OrderlyBite`,
      tone: isPositive ? 'grateful' : 'apologetic',
      keyPoints: isPositive
        ? ['Expressed genuine gratitude', 'Acknowledged specific feedback', 'Invited return visit']
        : ['Sincere apology', 'Took responsibility', 'Offered concrete resolution'],
    };
  }
}
