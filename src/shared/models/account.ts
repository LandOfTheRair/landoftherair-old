
import { nonenumerable } from 'nonenumerable';
import { extend } from 'lodash';

export type Status = 'Available' | 'AFK';

export enum SubscriptionTier {
  NO_SUBSCRIPTION = 0,
  TRIAL_SUBSCRIPTION = 1,
  BASIC_SUBSCRIPTION = 5
}

export class Account {
  @nonenumerable
  _id?: any;

  colyseusId?: string;

  createdAt: number;

  userId: string;

  characterNames: string[] = [];

  maxCharacters = 4;

  username: string;
  isGM = false;
  inGame = -1;
  status: Status = 'Available';
  subscriptionTier: SubscriptionTier = SubscriptionTier.NO_SUBSCRIPTION;
  trialEnds: number;
  hasDoneTrial: boolean;

  constructor(opts) {
    extend(this, opts);
  }
}
