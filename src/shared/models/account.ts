
import { nonenumerable } from 'nonenumerable';
import { merge } from 'lodash';

export type Status = 'Available' | 'AFK';

export enum SubscriptionTier {
  NO_SUBSCRIPTION = 0,
  TRIAL_SUBSCRIPTION = 1,
  BASIC_SUBSCRIPTION = 5
}

export type SilverPurchase = 'MorePotions' | 'MoreCharacters';

export class Account {
  @nonenumerable
  _id?: any;

  // internal stuff
  colyseusId?: string;
  createdAt: number;
  userId: string;

  // lobby display stuff
  username: string;
  isGM = false;
  inGame = -1;
  status: Status = 'Available';

  characterNames: string[] = [];

  maxCharacters = 4;

  // subscription
  subscriptionTier: SubscriptionTier = SubscriptionTier.NO_SUBSCRIPTION;
  trialEnds: number;
  hasDoneTrial: boolean;

  silver: number;
  lastInGameSilverGrab: number = 0;
  silverPurchases: { [key: string]: number } = {
    MorePotions: 0,
    MoreCharacters: 0
  };

  constructor(opts) {
    merge(this, opts);
  }
}
