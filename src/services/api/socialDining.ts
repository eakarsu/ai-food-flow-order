import { apiRequest } from './config';

export interface GroupMember {
  userId: string;
  name: string;
  email?: string;
  amountOwed?: number;
  hasPaid?: boolean;
}

export interface GroupOrder {
  id: string;
  hostId: string;
  restaurantId: string;
  members: GroupMember[];
  items: Array<{ name: string; price: number; addedBy: string }>;
  splitMethod: 'equal' | 'by_item' | 'custom';
  total: number;
  createdAt: string;
  status: 'open' | 'locked' | 'paid';
  inviteCode: string;
}

export const createGroupOrder = async (params: {
  restaurantId: string;
  hostId: string;
  hostName: string;
}): Promise<GroupOrder> => {
  try {
    return await apiRequest('/group-order', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    return {
      id: `GRP-${Date.now()}`,
      hostId: params.hostId,
      restaurantId: params.restaurantId,
      members: [{ userId: params.hostId, name: params.hostName }],
      items: [],
      splitMethod: 'equal',
      total: 0,
      createdAt: new Date().toISOString(),
      status: 'open',
      inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
    };
  }
};

export const joinGroupOrder = async (params: {
  inviteCode: string;
  userId: string;
  userName: string;
}): Promise<GroupOrder | null> => {
  try {
    return await apiRequest('/group-order/join', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    return null;
  }
};

export const getGroupRecommendations = async (params: {
  groupOrderId: string;
  preferences?: string[];
}): Promise<{ items: Array<{ name: string; price: number; reason: string }> }> => {
  try {
    return await apiRequest(`/group-order/${params.groupOrderId}/recommendations`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    return {
      items: [
        { name: 'Family Pizza Platter', price: 32, reason: 'Crowd-pleaser for groups of 4+' },
        { name: 'Mixed Tapas Sampler', price: 24, reason: 'Variety for diverse preferences' },
        { name: 'Shareable Dessert Trio', price: 18, reason: 'Perfect group ending' },
      ],
    };
  }
};

export const splitGroupBill = async (
  group: GroupOrder,
  method: 'equal' | 'by_item'
): Promise<GroupMember[]> => {
  if (method === 'equal') {
    const per = group.members.length > 0 ? +(group.total / group.members.length).toFixed(2) : 0;
    return group.members.map((m) => ({ ...m, amountOwed: per }));
  }
  const totals: Record<string, number> = {};
  group.items.forEach((it) => {
    totals[it.addedBy] = (totals[it.addedBy] ?? 0) + it.price;
  });
  return group.members.map((m) => ({ ...m, amountOwed: +(totals[m.userId] ?? 0).toFixed(2) }));
};
