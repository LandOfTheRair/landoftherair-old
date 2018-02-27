
import { get, find, includes } from 'lodash';
import * as stripe from 'stripe';

import { AccountHelper } from './account-helper';
import { Account, SilverPurchase, SubscriptionTier } from '../../shared/models/account';
import { Player } from '../../shared/models/player';
import { Lobby } from '../rooms/Lobby';

const SUBSCRIPTION_TIER_MULTIPLER = 5;
const BASE_ACTION_QUEUE_SIZE = 20;
const ACTION_QUEUE_MULTIPLIER = 2;

const Stripe = stripe(process.env.STRIPE_TOKEN);

class SilverPurchaseItem {
  name: string;
  desc: string;
  icon: string;
  maxPurchases: number;
  key: SilverPurchase;
  cost: number;
  fgColor: string;
  discount?: number;
  postBuy?: (account: Account, lobby?: Lobby) => void;
}

export const SilverBuyTiers = {
  micro: [
    { key: 'micro-sm', price: 499,  silver: 500,  percentOverAverage: 0 },
    { key: 'micro-md', price: 999,  silver: 1100, percentOverAverage: 10 },
    { key: 'micro-lg', price: 1999, silver: 2500, percentOverAverage: 25 }
  ],
  sub: [
    { key: 'sub-1m',   price: 699,  duration: 1,  percentOverAverage: 0 },
    { key: 'sub-3m',   price: 2099, duration: 3,  percentOverAverage: 0 },
    { key: 'sub-12m',  price: 6999, duration: 12, percentOverAverage: 2 }
  ]
};


export const AllSilverPurchases: SilverPurchaseItem[] = [

  // festivals
  {
    name: 'Festival: XP Gain +100%',
    desc: 'Gain +100% XP for 6 hours. Additional purchases increase duration, not bonus.',
    icon: 'two-shadows',
    fgColor: '#0a0',
    maxPurchases: 99999,
    key: 'FestivalXP',
    cost: 100,
    postBuy: (account, lobby: Lobby) => lobby.updateFestivalTime(account, 'xpMult', 6)
  },
  {
    name: 'Festival: Skill Gain +100%',
    desc: 'Gain Skill +100% faster for 6 hours. Additional purchases increase duration, not bonus.',
    icon: 'two-shadows',
    fgColor: '#a00',
    maxPurchases: 99999,
    key: 'FestivalSkill',
    cost: 100,
    postBuy: (account, lobby: Lobby) => lobby.updateFestivalTime(account, 'skillMult', 6)
  },
  {
    name: 'Festival: Gold Gain +100%',
    desc: 'Get +100% more gold per kill for 6 hours. Additional purchases increase duration, not bonus.',
    icon: 'two-shadows',
    fgColor: '#aa0',
    maxPurchases: 99999,
    key: 'FestivalGold',
    cost: 75,
    postBuy: (account, lobby: Lobby) => lobby.updateFestivalTime(account, 'goldMult', 6)
  },
  {
    name: 'Festival: Trait Gain +100%',
    desc: 'Gain Traits +100% faster for 6 hours. Additional purchases increase duration, not bonus.',
    icon: 'two-shadows',
    fgColor: '#0aa',
    maxPurchases: 99999,
    key: 'FestivalTrait',
    cost: 125,
    postBuy: (account, lobby: Lobby) => lobby.updateFestivalTime(account, 'traitGainMult', 6)
  },

  // multi purchases
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

  // one time purchases
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
  },
  {
    name: 'Shared Wardrobes',
    desc: 'An extra 15 storage slots in an account-wide shared wardrobe. Accessible on any character, from any other wardrobe location.',
    icon: 'locked-box',
    fgColor: '#a0a',
    maxPurchases: 1,
    key: 'SharedLockers',
    cost: 2000
  },
  {
    name: 'Demi-Magic Pouch',
    desc: 'A magical, 5-slot pouch carried around simultaneously by all of your characters. It\'s strip-safe too. Weird, right?',
    icon: 'knapsack',
    fgColor: '#a0a',
    maxPurchases: 1,
    key: 'MagicPouch',
    cost: 2000
  }
];

export class SubscriptionHelper {

  public static async buyWithStripe(account: Account, purchaseInfo) {
    if(!process.env.STRIPE_TOKEN) throw new Error('Stripe is not configured');

    if(!purchaseInfo) return;
    const { token, item } = purchaseInfo;

    if(!item || !token) throw new Error('No item or no valid token');

    // subscription
    if(includes(item.key, 'sub')) {
      const purchaseItem = find(SilverBuyTiers.sub, { key: item.key });
      if(!purchaseItem) throw new Error('Invalid purchase item');

      // monthly
      try {
        const customer = await Stripe.customers.create({
          email: account.email
        });

        const source = await Stripe.customers.createSource(customer.id, {
          source: token.id
        });

        await Stripe.charges.create({
          amount: purchaseItem.price,
          currency: 'usd',
          customer: source.customer
        });

        await this.subscribe(account, purchaseItem.duration);
      } catch(e) {
        throw e;
      }

    // microtransaction
    } else {
      const purchaseItem = find(SilverBuyTiers.micro, { key: item.key });
      if(!purchaseItem) throw new Error('Invalid purchase item');

      try {
        const customer = await Stripe.customers.create({
          email: account.email
        });

        const source = await Stripe.customers.createSource(customer.id, {
          source: token.id
        });

        await Stripe.charges.create({
          amount: purchaseItem.price,
          currency: 'usd',
          customer: source.customer
        });

        await this.giveSilver(account, purchaseItem.silver);
      } catch(e) {
        throw e;
      }
    }
  }

  // account management
  public static async subscribe(account: Account, months: number): Promise<Account> {
    await this.startTrial(account, months * 30, SubscriptionTier.BASIC_SUBSCRIPTION);
    await this.giveSilver(account, months * 500);
    return account;
  }

  public static async unsubscribe(account: Account): Promise<Account> {
    account.subscriptionTier = SubscriptionTier.NO_SUBSCRIPTION;
    await AccountHelper.saveAccount(account);
    return account;
  }

  public static async startTrial(account: Account, expirationDays = 30, tier = SubscriptionTier.TRIAL_SUBSCRIPTION): Promise<Account> {
    const date = new Date();
    date.setDate(date.getDate() + expirationDays);
    account.trialEnds = date.getTime();
    account.hasDoneTrial = tier <= 1;
    account.subscriptionTier = tier;
    await AccountHelper.saveAccount(account);
    return account;
  }

  public static async giveSilver(account: Account, silver = 0): Promise<Account> {
    account.silver = Math.max(0, (account.silver || 0) + silver);
    await AccountHelper.saveAccount(account);
    return account;
  }

  public static async purchaseWithSilver(account: Account, purchase: SilverPurchase, lobbyInstance: Lobby): Promise<boolean> {
    const purchaseItem = find(AllSilverPurchases, { key: purchase });
    const curPurchaseTier = this.getSilverPurchase(account, purchase);

    if(!purchaseItem) return false;
    if(curPurchaseTier >= purchaseItem.maxPurchases) return false;
    if(account.silver < purchaseItem.cost) return false;
    if(account.inGame >= 0) return false;

    account.silver -= purchaseItem.cost;
    account.silverPurchases[purchase] = account.silverPurchases[purchase] || 0;
    account.silverPurchases[purchase]++;

    if(purchaseItem.postBuy) purchaseItem.postBuy(account, lobbyInstance);

    await AccountHelper.saveAccount(account);
    return true;
  }

  public static async checkAccountForExpiration(account: Account): Promise<Account> {
    const now = Date.now();
    if(now >= account.trialEnds) {
      account.subscriptionTier = SubscriptionTier.NO_SUBSCRIPTION;
      account.trialEnds = 0;
    }
    await AccountHelper.saveAccount(account);
    return account;
  }

  // checker functions
  public static isGM(player: Player): boolean {
    return player.$$account.isGM;
  }

  public static isTester(player: Player): boolean {
    return player.$$account.isTester;
  }

  public static isSubscribed(player: Player): boolean {
    return this.subscriptionTier(player) > 0;
  }

  // silver related functions
  public static getSilverPurchase(account: Account, purchase: SilverPurchase): number {
    return get(account, `silverPurchases.${purchase}`, 0);
  }

  // the max tier is 10
  private static subscriptionTier(player: Player): number {
    if(this.isGM(player)) return 10;
    if(this.isTester(player)) return 1;
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

  public static bonusPouchSlots(player: Player): number {
    return this.getSilverPurchase(player.$$account, 'MagicPouch') * 5;
  }

}
