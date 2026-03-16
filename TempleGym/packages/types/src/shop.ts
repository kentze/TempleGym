export type RedemptionStatus = 'PENDING' | 'FULFILLED' | 'CANCELLED';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  pointCost: number;
  emoji: string;
  sizes: string[];
  stock: number;
  isActive: boolean;
}

export interface RedeemBody {
  shopItemId: string;
  size?: string;
}

export interface Redemption {
  id: string;
  shopItemId: string;
  shopItem: ShopItem;
  size: string | null;
  pointsSpent: number;
  status: RedemptionStatus;
  createdAt: string;
}
