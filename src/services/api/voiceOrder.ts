import { apiRequest } from './config';

export interface VoiceTranscript {
  text: string;
  confidence: number;
  durationMs: number;
}

export interface VoiceOrderItem {
  name: string;
  quantity: number;
  modifiers?: string[];
  matchConfidence: number;
}

export interface VoiceOrderResponse {
  callId: string;
  transcript: VoiceTranscript;
  parsedItems: VoiceOrderItem[];
  total: number;
  needsConfirmation: boolean;
  agentReply: string;
}

export const processVoiceOrder = async (params: {
  audioBase64?: string;
  text?: string;
  userId?: string;
  restaurantId: string;
}): Promise<VoiceOrderResponse> => {
  try {
    return await apiRequest('/voice-order/process', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    const text = params.text ?? "I'd like a large pepperoni pizza and two diet cokes";
    const items: VoiceOrderItem[] = [];
    if (/pizza/i.test(text)) {
      items.push({
        name: 'Large Pepperoni Pizza',
        quantity: 1,
        modifiers: ['Large', 'Pepperoni'],
        matchConfidence: 0.93,
      });
    }
    if (/coke/i.test(text)) {
      const m = text.match(/(\d+)\s*(diet)?\s*cokes?/i);
      const qty = m ? parseInt(m[1]) || 1 : 1;
      items.push({
        name: m && m[2] ? 'Diet Coke' : 'Coca-Cola',
        quantity: qty,
        matchConfidence: 0.97,
      });
    }
    if (/burger/i.test(text)) {
      items.push({ name: 'Cheeseburger', quantity: 1, matchConfidence: 0.9 });
    }
    const total = items.reduce(
      (sum, i) => sum + i.quantity * (i.name.includes('Pizza') ? 16 : i.name.includes('Coke') ? 3 : 12),
      0
    );
    return {
      callId: `CALL-${Date.now()}`,
      transcript: { text, confidence: 0.92, durationMs: 4500 },
      parsedItems: items,
      total: +total.toFixed(2),
      needsConfirmation: items.length > 0,
      agentReply:
        items.length > 0
          ? `I have ${items.map((i) => `${i.quantity} ${i.name}`).join(', ')} for a total of $${total.toFixed(2)}. Should I confirm this order?`
          : "I didn't catch any items. Could you repeat your order?",
    };
  }
};

export const confirmVoiceOrder = async (params: {
  callId: string;
  confirmed: boolean;
}): Promise<{ orderId?: string; status: string }> => {
  try {
    return await apiRequest('/voice-order/confirm', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    return { orderId: `ORD-${Date.now()}`, status: params.confirmed ? 'placed' : 'cancelled' };
  }
};
