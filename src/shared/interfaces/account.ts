export type Status = 'Available' | 'AFK';

export enum SubscriptionTier {
  NO_SUBSCRIPTION = 0,
  TRIAL_SUBSCRIPTION = 1,
  BASIC_SUBSCRIPTION = 5
}

export type SilverPurchase =
  'MorePotions' | 'MoreCharacters' | 'MoreMarketboard'
  | 'BiggerBelt' | 'BiggerSack' | 'ExpandedStorage'
  | 'SharedLockers' | 'MagicPouch'
  | 'FestivalXP' | 'FestivalAXP' | 'FestivalSkill' | 'FestivalGold' | 'FestivalTrait' | 'FestivalItemFind'
  | 'CosmeticInversify' | 'CosmeticAncientify' | 'CosmeticEtherPulse' | 'CosmeticGhostEther';

export interface IAccount {
  _id?: any;

  colyseusId?: string;

  createdAt: number;
  userId: string;
  email: string;
  emailVerified: boolean;

  username: string;
  isTester: boolean;
  isGM: boolean;
  isMuted: boolean;

  spamMessages: number;
  lastMessage: number;

  inGame: number;
  status: Status;

  characterNames: string[];
  maxCharacters: number;

  subscriptionTier: SubscriptionTier;
  trialEnds: number;
  hasDoneTrial: boolean;
  silver: number;

  silverPurchases: { [key: string]: number };

  discordTag: string;
  discordOnline: boolean;

  toSaveObject(): any;
}
