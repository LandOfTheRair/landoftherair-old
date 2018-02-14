
import { AccountHelper } from './account-helper';
import { Account, SubscriptionTier } from '../../shared/models/account';
import { Player } from '../../shared/models/player';

const SUBSCRIPTION_TIER_MULTIPLER = 5;
const BASE_ACTION_QUEUE_SIZE = 20;
const ACTION_QUEUE_MULTIPLIER = 2;

export class SubscriptionHelper {

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

  public static async checkAccountForExpiration(account: Account): Promise<Account> {
    const now = Date.now();
    if(now >= account.trialEnds) account.subscriptionTier = SubscriptionTier.NO_SUBSCRIPTION;
    await AccountHelper.saveAccount(account);
    return account;
  }

  public static isGM(player: Player): boolean {
    return player.$$account.isGM;
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

  public static isSubscribed(player: Player): boolean {
    return this.subscriptionTier(player) > 0;
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
    return basePotionSize + this.subscriptionTier(player);
  }

  // SUBSCRIBER BENEFIT: +(TIER * 1000) POTION OZ
  public static calcMaxSmithRepair(player: Player, baseSmithRepair: number): number {
    return baseSmithRepair + (this.subscriptionTier(player) * 1000);
  }

  // SUBSCRIBER BENEFIT: -(TIER * 5)% HP/MP DOC COST
  public static modifyDocPrice(player: Player, basePrice: number): number {
    return Math.max(1, Math.floor(basePrice - (basePrice * this.subscriptionTierMultiplier(player))));
  }

}
