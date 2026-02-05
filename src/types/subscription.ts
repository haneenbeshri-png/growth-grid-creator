export type PlanStatus = 'active' | 'hidden' | 'draft' | 'archived';
export type BillingInterval = 'monthly' | 'quarterly' | 'annually';
export type DiscountType = 'percentage' | 'fixed';
export type CouponDuration = 'one-time' | 'repeating' | 'forever';
export type CouponStatus = 'active' | 'disabled' | 'expired';
export type AddOnBillingType = 'monthly' | 'annual' | 'one-time';
export type AddOnEffect = 'branch_count' | 'staff_count' | 'sms_credits' | 'unlock_feature';

export interface Plan {
  id: string;
  power: number;
  displayNameAr: string;
  displayNameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  code: string;
  price: number;
  billingInterval: BillingInterval;
  trialDays: number;
  isTaxable: boolean;
  status: PlanStatus;
  activeSubscribers: number;
  features: string[];
  maxBranches: number | 'custom';
  maxServiceProviders: number | 'custom';
  freeSmsCredits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddOn {
  id: string;
  name: string;
  icon: string;
  billingType: AddOnBillingType;
  price: number;
  effect: AddOnEffect;
  quantity: number;
  featureToUnlock?: string;
  availableForAll: boolean;
  applicablePlans: string[];
  status: 'active' | 'archived';
  createdAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  internalName: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  duration: CouponDuration;
  repeatCount?: number;
  applicablePlans: string[] | 'all';
  expiryDate: Date;
  maxRedemptions: number;
  maxRedemptionsPerUser: number;
  usageCount: number;
  revenueImpact: number;
  status: CouponStatus;
  createdAt: Date;
}

export interface Feature {
  id: string;
  nameAr: string;
  nameEn: string;
  description: string;
}
