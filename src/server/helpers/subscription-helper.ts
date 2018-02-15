
import { get, find } from 'lodash';

import { AccountHelper } from './account-helper';
import { Account, SilverPurchase, SubscriptionTier } from '../../shared/models/account';
import { Player } from '../../shared/models/player';

const SUBSCRIPTION_TIER_MULTIPLER = 5;
const BASE_ACTION_QUEUE_SIZE = 20;
const ACTION_QUEUE_MULTIPLIER = 2;

class SilverPurchaseItem {
  name: string;
  desc: string;
  icon: string;
  maxPurchases: number;
  key: SilverPurchase;
  cost: number;
  fgColor: string;
  discount?: number;
  postBuy?: (account: Account) => void;
}

export const AllSilverPurchases: SilverPurchaseItem[] = [
  {
    name: 'Bigger Potion Stacks',
    desc: 'Increase your Alchemist potion max by 5.',
    icon: 'potion-ball',
    fgColor: '#00a',
    maxPurchases: 5,
    key: 'MorePotions',
    cost: 300
  },
  {
    name: 'More Characters',
    desc: 'Add another character slot to your account. Perfect for hording items.',
    icon: 'ages',
    fgColor: '#000',
    maxPurchases: 6,
    key: 'MoreCharacters',
    cost: 1000,
    postBuy: (account: Account) => account.maxCharacters++
  },
  {
    name: 'Bigger Sack',
    desc: 'Add 5 slots to your sack (for all characters). Got space?',
    icon: 'swap-bag',
    fgColor: '#060',
    maxPurchases: 1,
    key: 'BiggerSack',
    cost: 1500
  },
  {
    name: 'Bigger Belt',
    desc: 'Add 5 slots to your belt (for all characters). Weapon-holics rejoice.',
    icon: 'battle-gear',
    fgColor: '#a00',
    maxPurchases: 1,
    key: 'BiggerBelt',
    cost: 1500
  }
];

export class SubscriptionHelper {

  // account management
  public static async subscribe(account: Account): Promise<Account> {
    account.subscriptionTier = SubscriptionTier.BASIC_SUBSCRIPTION;
    await AccountHelper.saveAccount(account);
    return account;
  }

  public static async unsubscribe(account: Account): Promise<Account> {
    account.subscriptionTier = SubscriptionTier.NO_SUBSCRIPTION;
    await AccountHelper.saveAccount(account);
    return account;
  }

  public static async startTrial(account: Account, expirationDays = 30): Promise<Account> {
    const date = new Date();
    date.setDate(date.getDate() + expirationDays);
    account.trialEnds = date.getTime();
    account.hasDoneTrial = true;
    account.subscriptionTier = SubscriptionTier.TRIAL_SUBSCRIPTION;
    await AccountHelper.saveAccount(account);
    return account;
  }

  public static async giveSilver(account: Account, silver = 0): Promise<Account> {
    account.silver = Math.max(0, (account.silver || 0) + silver);
    await AccountHelper.saveAccount(account);
    return account;
  }

  public static async purchaseWithSilver(account: Account, purchase: SilverPurchase): Promise<boolean> {
    const purchaseItem = find(AllSilverPurchases, { key: purchase });
    const curPurchaseTier = this.getSilverPurchase(account, purchase);

    if(!purchaseItem) return false;
    if(curPurchaseTier >= purchaseItem.maxPurchases) return false;
    if(account.silver < purchaseItem.cost) return false;
    if(account.inGame >= 0) return false;

    account.silver -= purchaseItem.cost;
    account.silverPurchases[purchase] = account.silverPurchases[purchase] || 0;
    account.silverPurchases[purchase]++;

    if(purchaseItem.postBuy) purchaseItem.postBuy(account);

    await AccountHelper.saveAccount(account);
    return true;
  }

  public static async checkAccountForExpiration(account: Account): Promise<Account> {
    const now = Date.now();
    if(now >= account.trialEnds) account.subscriptionTier = SubscriptionTier.NO_SUBSCRIPTION;
    await AccountHelper.saveAccount(account);
    return account;
  }

  // checker functions
  public static isGM(player: Player): boolean {
    return player.$$account.isGM;
  }

  public static isSubscribed(player: Player): boolean {
    return this.subscriptionTier(player) > 0;
  }

  // silver related functions
  private static getSilverPurchase(account: Account, purchase: SilverPurchase): number {
    return get(account, `silverPurchases.${purchase}`, 0);
  }

  // the max tier is 10
  private static subscriptionTier(player: Player): number {
    if(this.isGM(player)) return 10;
    return player.$$account.subscriptionTier;
  }

  // the max tier is 10
  private static subscriptionTierMultiplier(player: Player): number {
    const tier = Math.min(10, this.subscriptionTier(player));
    return (tier * SUBSCRIPTION_TIER_MULTIPLER) / 100;
  }

  // SUBSCRIBER BENEFIT: +(TIER * 5)% XP
  public static modifyXPGainForSubscription(player: Player, xp: number): number {
    if(xp < 0) return xp;

    return Math.max(1, Math.floor(xp + (xp * this.subscriptionTierMultiplier(player))));
  }

  // SUBSCRIBER BENEFIT: +(TIER * 5)% SKILL
  public static modifySkillGainForSubscription(player: Player, skill: number): number {
    if(skill < 0) return skill;

    return Math.max(1, Math.floor(skill + (skill * this.subscriptionTierMultiplier(player))));
  }

  // SUBSCRIBER BENEFIT: GAIN TRAITS (TIER * 5)% FASTER
  public static modifyTraitPointTimerForSubscription(player: Player, timer: number): number {
    return Math.floor(timer - (timer * this.subscriptionTierMultiplier(player)));
  }

  // SUBSCRIBER BENEFIT: +(TIER * 5)% PARTY XP
  public static modifyPartyXPGainForSubscription(player: Player, xp: number): number {
    if(xp < 0) return xp;

    return Math.max(1, Math.floor(xp + (xp * this.subscriptionTierMultiplier(player))));
  }

  // SUBSCRIBER BENEFIT: +(TIER * 2) ACTION QUEUE ITEMS
  public static calcActionQueueSize(player: Player): number {
    return BASE_ACTION_QUEUE_SIZE + (this.subscriptionTier(player) * ACTION_QUEUE_MULTIPLIER);
  }

  // SUBSCRIBER BENEFIT: +(TIER) POTION OZ
  public static calcPotionMaxSize(player: Player, basePotionSize: number): number {
    return basePotionSize + this.subscriptionTier(player) + (this.getSilverPurchase(player.$$account, 'MorePotions') * 5);
  }

  // SUBSCRIBER BENEFIT: +(TIER * 1000) POTION OZ
  public static calcMaxSmithRepair(player: Player, baseSmithRepair: number): number {
    return baseSmithRepair + (this.subscriptionTier(player) * 1000);
  }

  // SUBSCRIBER BENEFIT: -(TIER * 5)% HP/MP DOC COST
  public static modifyDocPrice(player: Player, basePrice: number): number {
    return Math.max(1, Math.floor(basePrice - (basePrice * this.subscriptionTierMultiplier(player))));
  }

  public static bonusSackSlots(player: Player): number {
    return this.getSilverPurchase(player.$$account, 'BiggerSack') * 5;
  }

  public static bonusBeltSlots(player: Player): number {
    return this.getSilverPurchase(player.$$account, 'BiggerBelt') * 5;
  }

}
