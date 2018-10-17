
import { DateTime } from 'luxon';
import { compact, pull, isArray, get, set, find, includes, reject, extend, values, isUndefined, cloneDeep, size } from 'lodash';
import { nonenumerable } from 'nonenumerable';
import { RestrictedNumber } from 'restricted-number';

import { Account } from './account';
import { Character, MaxSizes, AllNormalGearSlots, Allegiance } from './character';
import { Item } from './item';

import { Party } from './party';
import { Quest } from '../../server/base/Quest';

import * as Quests from '../../server/quests';
import * as Effects from '../../server/effects';
import { LowCON } from '../../server/effects/special/LowCON';
import { Dead } from '../../server/effects/special/Dead';
import { CharacterHelper } from '../../server/helpers/character/character-helper';

import { AllTraits } from '../traits/trait-hash';
import { DeathHelper } from '../../server/helpers/character/death-helper';
import { PartyHelper } from '../../server/helpers/party/party-helper';
import { Malnourished } from '../../server/effects/special/Malnourished';
import { AlchemyContainer } from './container/tradeskills/alchemy';
import { SpellforgingContainer } from './container/tradeskills/spellforging';
import { MetalworkingContainer } from './container/tradeskills/metalworking';
import { SkillTree } from './skill-tree';
import { RollerHelper } from '../helpers/roller-helper';
import { Currency } from '../helpers/holiday-helper';

export class Player extends Character {
  @nonenumerable
  _id?: any;

  @nonenumerable
  createdAt: number;
  username: string;

  charSlot: number;

  z: number;

  @nonenumerable
  inGame: boolean;

  buyback: Item[];

  private learnedSpells: any;

  @nonenumerable
  $$doNotSave: boolean;

  @nonenumerable
  $$actionQueue;

  @nonenumerable
  $$lastDesc: string;

  @nonenumerable
  $$lastRegion: string;

  @nonenumerable
  $$swimElement: string;

  @nonenumerable
  $$locker: any;

  @nonenumerable
  $$banks: any;

  bgmSetting: 'town' | 'dungeon' | 'wilderness';

  @nonenumerable
  respawnPoint: { x: number, y: number, map: string };

  partyName: string;

  @nonenumerable
  private activeQuests: any;

  @nonenumerable
  private questProgress: any;

  @nonenumerable
  private permanentQuestCompletion: any;

  @nonenumerable
  private traitLevels: any;

  private partyExp: RestrictedNumber;

  private lastDeathLocation: any;

  public $$hungerTicks: number;
  public $$isAccessingLocker: boolean;
  public $$ready: boolean;

  public tradeSkillContainers: {
    alchemy?: AlchemyContainer,
    spellforging?: SpellforgingContainer,
    metalworking?: MetalworkingContainer
  };

  public daily: { quest: any, item: any };

  @nonenumerable
  private $$skillTree: SkillTree;

  @nonenumerable
  public $$account: Account;

  @nonenumerable
  public $$spawnerSteps: number;

  get party(): Party {
    return this.$$room && this.$$room.partyManager ? this.$$room.partyManager.getPartyByName(this.partyName) : null;
  }

  get skillTree(): SkillTree {
    return this.$$skillTree;
  }

  get allTraitLevels() {
    return cloneDeep(this.traitLevels);
  }

  init() {
    this.loadAccountBonuses();
    this.initBelt();
    this.initSack();
    this.initPouch();
    this.initGear();
    this.initHands();
    this.initTradeskills();
    this.initBuyback();
  }

  private loadAccountBonuses() {
    if(!this.$$room) return;
    this.sack.size = this.sackSize + this.$$room.subscriptionHelper.bonusSackSlots(this);
    this.belt.size = this.beltSize + this.$$room.subscriptionHelper.bonusBeltSlots(this);

    if(this.pouch) {
      this.pouch.size = this.$$room.subscriptionHelper.bonusPouchSlots(this);
    }
  }

  initTradeskills() {
    this.tradeSkillContainers = this.tradeSkillContainers || {};
    this.tradeSkillContainers.alchemy = new AlchemyContainer(this.tradeSkillContainers.alchemy);
    this.tradeSkillContainers.spellforging = new SpellforgingContainer(this.tradeSkillContainers.spellforging);
    this.tradeSkillContainers.metalworking = new MetalworkingContainer(this.tradeSkillContainers.metalworking);
  }

  initBuyback() {
    if(!this.buyback) this.buyback = [];
    this.buyback = this.buyback.map(item => new Item(item));
  }

  async initServer() {
    this.initEffects();
    this.uuid = this.username;
    this.$$actionQueue = [];
    this.$$messageQueue = [];
    if(isUndefined(this.$$hungerTicks)) {
      const nourished = this.hasEffect('Nourishment');
      this.$$hungerTicks = (nourished ? nourished.duration : 0) + 3600 * 6;
    }
    if(isUndefined(this.daily)) this.daily = { quest: {}, item: {} };
    if(isUndefined(this.daily.item)) this.daily.item = {};
    if(isUndefined(this.daily.quest)) this.daily.quest = {};

    if(isUndefined(this.currency)) this.currency = { gold: 0 };

    if((<any>this).gold && !this.currency.gold) {
      this.currency.gold = (<any>this).gold;
      delete (<any>this).gold;
    }

    this.$$skillTree = await this.$$room.skillTreeHelper.loadSkillTree(this);

    delete (<any>this).additionalStats;

    // if you haven't bought any nodes, reset all the irrelevant details
    if(size(this.$$skillTree.nodesClaimed) === 0) {
      delete (<any>this).traitPoints;
      delete (<any>this).partyPoints;
      delete (<any>this).traitPointTimer;
      this.learnedSpells = {};
      this.traitLevels = {};
      this.$$room.savePlayer(this);
    }

    if(!this.partyExp || !this.partyExp.maximum) {
      this.partyExp = new RestrictedNumber(0, 100, 0);

    } else {
      this.partyExp = new RestrictedNumber(0, this.partyExp.maximum, this.partyExp.__current);
    }

    this.recalculateStats();
  }

  saveSkillTree(): void {
    this.$$room.skillTreeHelper.saveSkillTree(this);
  }

  unlearnSpell(skillName): void {
    delete this.learnedSpells[skillName.toLowerCase()];
  }

  unlearnAll(): void {
    Object.keys(this.learnedSpells).forEach(spell => {
      if(this.learnedSpells[spell] === -1) return;
      delete this.learnedSpells[spell];
    });
  }

  learnSpell(skillName, conditional = false): boolean {
    this.learnedSpells = this.learnedSpells || {};
    const storeName = skillName.toLowerCase();
    if(this.learnedSpells[storeName] > 0) return false;
    if(conditional && !this.learnedSpells[storeName]) {
      this.sendClientMessage(`Your item has bestowed the ability to cast ${skillName}!`);
    }
    this.learnedSpells[storeName] = conditional ? -1 : 1;
    return true;
  }

  hasLearned(skillName) {
    if(this.learnedSpells) {
      const isLearned = this.learnedSpells[skillName.toLowerCase()];
      if(isLearned > 0) return true;

      if(isLearned < 0) {
        const slot = find(AllNormalGearSlots, itemSlot => {
          const checkItem = get(this, itemSlot);
          if(!checkItem || !checkItem.effect) return false;
          return checkItem.effect.name.toLowerCase() === skillName.toLowerCase();
        });

        if(!slot) return false;

        const item = get(this, slot);

        if(!item || item.itemClass === 'Trap') return false;

        if(item.castAndTryBreak()) {
          this.sendClientMessage('Your item has fizzled and turned to dust.');

          if(slot === 'leftHand') this.setLeftHand(null);
          else if(slot === 'rightHand') this.setRightHand(null);
          else this.unequip(slot.split('.')[1]);

        }

        return item;
      }
    }
    return false;
  }

  flagSkill(skills) {
    if(!isArray(skills)) skills = [skills];
    this.$$flaggedSkills = compact(skills);
  }

  public youDontSeeThatPerson(uuid: string): void {
    super.youDontSeeThatPerson(uuid);
    this.clearActionQueueOf(uuid);
  }

  private clearActionQueueOf(uuid: string): void {
    this.$$actionQueue = reject(this.$$actionQueue, ({ args }) => includes(args, uuid));
  }

  kill(target: Character, opts: { isPetKill: boolean } = { isPetKill: false }) {
    this.clearActionQueueOf(target.uuid);

    const npcId = (<any>target).npcId;
    if(npcId) {
      this.checkForQuestUpdates({ kill: npcId });

      if(this.party) {
        PartyHelper.shareKillsWithParty(this, { kill: npcId });
      }
    }

    if(!opts.isPetKill) {
      const skillGain = target.skillOnKill;
      this.gainSkillFromKills(skillGain);
    }

  }

  gainSkillFromKills(skillGain: number) {
    const adjustedSkill = this.$$room.calcAdjustedSkillGain(skillGain);
    if(isNaN(adjustedSkill) || adjustedSkill <= 0) return;

    this.gainCurrentSkills(adjustedSkill);

    if(this.party) {
      PartyHelper.shareSkillWithParty(this, adjustedSkill);
    }
  }

  gainExpFromKills(xpGain: number) {
    super.gainExpFromKills(xpGain);

    if(this.party) {
      const numMembersSharedWith = PartyHelper.shareExpWithParty(this, xpGain);

      if(numMembersSharedWith > 0) {
        this.gainPartyExp(xpGain);
      }
    }
  }

  changeRep(allegiance: Allegiance, delta: number, noPartyShare: boolean = false) {
    super.changeRep(allegiance, delta);

    if(!noPartyShare && this.party) {
      PartyHelper.shareRepWithParty(this, allegiance, delta);
    }
  }

  private gainPartyExp(baseExp: number) {
    if(!this.party.canGainPartyPoints) return;

    const basePartyExpGain = Math.floor(baseExp / this.party.members.length + 1);
    const roomModifiedPartyExpGain = this.$$room.calcAdjustedPartyXPGain(basePartyExpGain);
    const modifiedPartyExpGain = this.$$room.subscriptionHelper.modifyPartyXPGainForSubscription(this, roomModifiedPartyExpGain);
    this.partyExp.add(modifiedPartyExpGain);

    this.checkToGainPartyPoints();
  }

  private checkToGainPartyPoints() {
    if(!this.$$skillTree.canGainPartyPoints || !this.partyExp.atMaximum()) return;

    this.$$skillTree.gainPartyPoints(1);
    this.partyExp.toMinimum();

    const prevMax = this.partyExp.maximum;
    this.partyExp.maximum = Math.floor(100 + (prevMax * 1.0025));
  }

  isPlayer() {
    return true;
  }

  async die(killer) {
    if(this.hasEffect('Dead')) return;

    const hasSecondWind = this.hasEffect('Secondwind');

    super.die(killer);

    // if a room would kick you out of the map on death, save the ground now just in case
    if(this.$$room.exitPoint) {
      this.$$room.saveGround();
    }

    this.lastDeathLocation = { x: this.x, y: this.y };

    // 5 minutes to restore
    this.$$deathTicks = 60 * 5;
    this.combatTicks = 0;

    const dead = new Dead({});
    dead.cast(this, this);
    dead.duration = this.$$deathTicks;

    this.$$actionQueue = [];

    if(killer && !(<any>killer).$$shouldEatTier) {
      await DeathHelper.createCorpse(this, [], this.getBaseSprite() + 4);
    }

    const myCon = this.getBaseStat('con');
    const myLuk = this.getTotalStat('luk');

    if(myCon > 3) this.loseBaseStat('con', 1);

    if(this.getBaseStat('con') <= 3) {
      const lowCon = new LowCON({});
      lowCon.cast(this, this);
    }

    if(myCon === 3) {
      if(this.stats.hp > 10 && RollerHelper.OneInX(5)) {
        this.loseBaseStat('hp', 2);
      }

      if(RollerHelper.OneInX(myLuk / 5)) this.loseBaseStat('con', 1);
    }

    if(myCon === 2) {
      if(this.stats.hp > 10) this.loseBaseStat('hp', 2);
      if(RollerHelper.OneInX(myLuk)) this.loseBaseStat('con', 1);
    }

    if(myCon === 1) {
      if(this.stats.hp > 10) this.loseBaseStat('hp', 2);
    }

    if(killer && !killer.isPlayer()) {

      if(!RollerHelper.XInOneHundred(this.getTraitLevelAndUsageModifier('DeathGrip')) && !hasSecondWind) {
        CharacterHelper.dropHands(this);
      }

      if(myCon === 3) {
        if(RollerHelper.OneInX(myLuk)) CharacterHelper.strip(this, this);
      }

      if(myCon === 2) {
        if(RollerHelper.OneInX(myLuk / 5)) CharacterHelper.strip(this, this);
      }

      if(myCon === 1) {
        if(RollerHelper.OneInX(2)) CharacterHelper.strip(this, this);
      }
    }
  }

  private reviveHandler() {

    if(this.$$corpseRef) {
      this.$$room.removeCorpse(this.$$corpseRef);
      this.$$corpseRef = null;
    }

    this.dir = 'S';

    this.tryToCastEquippedEffects();
  }

  revive() {
    if(!this.isDead()) return;

    this.reviveHandler();
  }

  async restore(force = false) {
    if(!this.isDead()) return;

    if(force) {
      this.sendClientMessage('You feel a churning sensation.');
      if(this.stats.str > 5 && RollerHelper.OneInX(5)) this.stats.str--;
      if(this.stats.agi > 5 && RollerHelper.OneInX(5)) this.stats.agi--;
    }

    this.reviveHandler();
    await this.teleportToRespawnPoint();
    this.hp.set(1);
  }

  teleportToRespawnPoint() {
    return this.$$room.teleport(this, { newMap: this.respawnPoint.map, x: this.respawnPoint.x, y: this.respawnPoint.y, zChange: 0 });
  }

  getBaseSprite() {
    let choices: any = { Male: 725, Female: 675 };

    switch(this.allegiance) {
      case 'None':          { choices = { Male: 725, Female: 675 }; break; }
      case 'Townsfolk':     { choices = { Male: 725, Female: 675 }; break; }

      case 'Wilderness':    { choices = { Male: 730, Female: 680 }; break; }
      case 'Royalty':       { choices = { Male: 735, Female: 685 }; break; }
      case 'Adventurers':   { choices = { Male: 740, Female: 690 }; break; }
      case 'Underground':   { choices = { Male: 745, Female: 695 }; break; }
      case 'Pirates':       { choices = { Male: 750, Female: 700 }; break; }
    }

    return choices[this.sex];
  }

  itemCheck(item) {
    super.itemCheck(item);
    if(!item) return;

    if(item.itemClass === 'Corpse') {
      item.$heldBy = this.username;

      // find the corpses owner and give it 600 death ticks if a player picks it up
      this.$$room.state.getAllInRangeRaw(this, 0).forEach(creature => {
        if(creature.$$corpseRef !== item) return;
        creature.$$deathTicks = 600;
      });
    }

    if(item.effect && item.effect.uses && item.itemClass !== 'Trap') {
      this.learnSpell(item.effect.name, true);
    }
  }

  buybackSize() {
    return MaxSizes.Buyback;
  }

  fixBuyback() {
    this.buyback = compact(this.buyback);
  }

  buyItemBack(slot) {
    const item = this.buyback[slot];
    pull(this.buyback, item);
    this.fixBuyback();
    this.spendGold(item._buybackValue, `Buyback:${item.name}`);
    return item;
  }

  sellItem(item: Item): number {
    const value = this.sellValue(item);
    this.earnGold(value, `Sell:${item.name}`);
    item._buybackValue = value;

    this.buyback.push(item);

    if(this.buyback.length > this.buybackSize()) this.buyback.shift();

    return value;
  }

  sendQuestMessage(quest: Quest, message: string): void {
    this.sendClientMessage(`Quest >>> ${message}`);
  }

  receiveMessage(from: Character, message) {
    from.sendClientMessage({ name: `[>>> private: ${this.name}]`, message });
    this.sendClientMessage({ name: `[<<< private: ${from.name}]`, message });
  }

  queueAction({ command, args }) {
    if(!this.$$actionQueue) this.$$actionQueue = [];
    this.$$actionQueue.push({ command, args });
    const aqSize = this.$$room.subscriptionHelper.calcActionQueueSize(this);
    if(this.$$actionQueue.length > aqSize) this.$$actionQueue.length = aqSize;
  }

  tick() {
    super.tick();

    if(this.$$room.state.checkIfActualWall(this.x, this.y) && !this.$$room.subscriptionHelper.isGM(this)) {
      this.sendClientMessage('You are probably somewhere you shouldn\'t be. You will be teleported to the respawn point.');
      this.teleportToRespawnPoint();
    }

    if(this.$$room.partyManager && this.partyName) {
      this.$$room.partyManager.updateMember(this);
      this.tryToCastPartyEffects();
    }

    if(this.isInCombat) this.combatTicks--;

    this.$$hungerTicks--;

    if(this.$$hungerTicks <= 0 && !this.hasEffect('Malnourished')) {
      const malnourished = new Malnourished({});
      malnourished.cast(this, this);
    }

    if(!this.$$actionQueue || this.isUnableToAct()) {
      this.sendClientMessageBatch();
      return;
    }

    const actions = this.getTotalStat('actionSpeed');
    for(let i = 0; i < actions; i++) {
      const nextAction = this.$$actionQueue.shift();
      if(nextAction) {
        this.$$room.executeCommand(this, nextAction.command, nextAction.args);
      }
    }

    this.sendClientMessageBatch();
  }

  private tryToCastPartyEffects(): void {
    const party = this.party;
    if(!party || !party.canApplyPartyAbilities) return;

    const classMap = {
      Warrior: 'PartyDefense',
      Healer: 'PartyHealthRegeneration',
      Thief: 'PartyOffense',
      Mage: 'PartyManaRegeneration'
    };

    const effect = classMap[this.baseClass];
    if(!effect) return;

    if(this.hasEffect(effect)) return;

    const level = this.getTraitLevelAndUsageModifier(effect);
    if(level === 0) return;

    const partyEffect = new Effects[effect]({ potency: level });
    partyEffect.cast(this, this);
  }

  addAgro(char: Character, value) {
    if(!char || (char.$$ai && char.$$ai.tick)) return;
    super.addAgro(char, value);
  }

  startQuest(quest) {

    // can't start a quest you're already on or have completed
    if(this.hasQuest(quest) || (!quest.isRepeatable && this.hasPermanentCompletionFor(quest.name))) return;
    this.activeQuests = this.activeQuests || {};
    this.activeQuests[quest.name] = true;
    this.setQuestData(quest, quest.initialData);
  }

  hasQuest(quest: Quest): boolean {
    return this.hasQuestName(quest.name);
  }

  hasQuestName(questName: string): boolean {
    return get(this.activeQuests, questName, false);
  }

  hasPermanentCompletionFor(questName: string): boolean {
    return get(this.permanentQuestCompletion, questName, false);
  }

  setQuestData(quest: Quest, data: any) {
    if(!this.questProgress) this.questProgress = {};
    this.questProgress[quest.name] = data;
  }

  getQuestData(quest: Quest) {
    if(!this.questProgress || !this.hasQuest(quest)) return {};
    return this.questProgress[quest.name] || {};
  }

  cancelNonPermanentQuest(quest: Quest) {
    if(!this.questProgress || !this.hasQuest(quest)) return;
    delete this.questProgress[quest.name];
    delete this.activeQuests[quest.name];
  }

  checkForQuestUpdates(questOpts = { kill: '' }) {

    if(questOpts.kill) {
      Object.keys(this.activeQuests || {}).forEach(quest => {
        const realQuest = Quests[quest];
        if(!realQuest) return;

        const { type } = realQuest.requirements;
        if(type !== 'kill') return;

        if(realQuest.canUpdateProgress(this, questOpts)) {
          realQuest.updateProgress(this, questOpts);
        }
      });
    }

  }

  permanentlyCompleteQuest(questName: string) {
    this.permanentQuestCompletion = this.permanentQuestCompletion || {};
    this.permanentQuestCompletion[questName] = true;
  }

  completeQuest(quest: Quest) {
    const data = this.getQuestData(quest);
    if(!data.isRepeatable) {
      this.permanentlyCompleteQuest(quest.name);
    }
    this.removeQuest(quest);
  }

  removeQuest(quest: Quest) {
    delete this.questProgress[quest.name];
    delete this.activeQuests[quest.name];
  }

  canTakeItem(item: Item): boolean {
    if(!item.requirements) return true;
    if(!item.requirements.quest) return true;

    return this.hasQuestName(item.requirements.quest);
  }

  public decreaseTraitLevel(trait: string, levelsLost: number) {
    this.traitLevels[trait].level -= levelsLost;
    if(this.traitLevels[trait].level <= 0) this.traitLevels[trait].level = 0;
    this.recalculateStats();
  }

  public increaseTraitLevel(trait: string, levelsGained: number, reqBaseClass?: string, extra = {}): void {
    this.traitLevels = this.traitLevels || {};
    this.traitLevels[trait] = this.traitLevels[trait] || { level: 0, gearBoost: 0 };
    extend(this.traitLevels[trait], extra);
    this.traitLevels[trait].level = this.traitLevels[trait].level || 0;
    this.traitLevels[trait].level += levelsGained;
    this.recalculateStats();
  }

  public recalculateStats() {

    // calculate trait bonuses
    if(this.traitLevels) {
      Object.keys(this.traitLevels).forEach(traitName => {
        set(this.traitLevels, [traitName, 'gearBoost'], 0);
      });

      this.traitableGear.forEach(item => {
        const traitInfo = get(item, 'trait', { name: '', level: 0 });

        let level = traitInfo.level;

        if(level === 0 || !traitInfo.name) return;

        const curLevel = get(this.traitLevels, [traitInfo.name, 'gearBoost'], 0);

        const canMirrorProc = get(this, 'gear.Hands') === item || get(this, 'gear.Feet') === item;
        if(this.getTraitLevel('MirroredEnchantments') && canMirrorProc) {
          level *= 2;
        }
        set(this.traitLevels, [traitInfo.name, 'gearBoost'], curLevel + level);
      });
    }

    // recalculate everything else
    super.recalculateStats();
  }

  private get traitableGear(): Item[] {
    const baseValue = values(this.gear);
    if(this.leftHand && this.canGetBonusFromItemInHand(this.leftHand)) baseValue.push(this.leftHand);
    if(this.rightHand && this.canGetBonusFromItemInHand(this.rightHand)) baseValue.push(this.rightHand);
    return compact(baseValue);
  }

  public getBaseTraitLevel(trait: string): number {
    if(!this.traitLevels || !this.isTraitActive(trait) || !this.isTraitInEffect(trait)) return 0;
    return get(this.traitLevels, [trait, 'level'], 0);
  }

  public getTraitLevel(trait: string): number {
    if(!this.traitLevels || !this.isTraitActive(trait) || !this.isTraitInEffect(trait)) return 0;
    const baseValue = get(this.traitLevels, [trait, 'gearBoost'], 0);
    return Math.min(5, baseValue) + this.getBaseTraitLevel(trait);
  }

  public isTraitInEffect(trait: string): boolean {
    if(!this.traitLevels) return false;

    const traitObj = AllTraits.Common[trait] || AllTraits.Free[trait] || AllTraits[this.baseClass][trait];
    if(!traitObj) return false;
    if(traitObj.isFree) return traitObj.currentlyInEffect(this);

    const traitRef = this.traitLevels[trait];
    if(!traitRef) return false;

    return traitObj.currentlyInEffect(this);
  }

  public isTraitActive(trait: string): boolean {

    // haven't bought any traits, so no.
    if(!this.traitLevels) return false;

    const traitRef = this.traitLevels[trait];
    return !!traitRef;
  }

  takeSequenceOfSteps(steps, isChasing, recalculateFOV) {
    this.$$locker = null;
    return super.takeSequenceOfSteps(steps, isChasing, recalculateFOV);
  }

  private canDailyActivate(checkTimestamp: number): boolean {
    let theoreticalResetTime = DateTime.fromObject({ zone: 'utc', hour: 12 });
    if(+theoreticalResetTime > +DateTime.fromObject({ zone: 'utc' })) {
      theoreticalResetTime = theoreticalResetTime.minus({ days: 1 });
    }

    return checkTimestamp < +theoreticalResetTime;
  }

  public canBuyDailyItem(item: Item): boolean {
    if(!item.daily) throw new Error('Attempting to buy item as a daily item ' + JSON.stringify(item));

    if(!this.daily.item[item.uuid]) return true;
    if(this.canDailyActivate(this.daily.item[item.uuid])) return true;

    return false;
  }

  public canDoDailyQuest(key: string): boolean {
    return !this.daily.quest[key] || this.canDailyActivate(this.daily.quest[key]);
  }

  public completeDailyQuest(key: string): void {
    this.daily.quest[key] = +DateTime.fromObject({ zone: 'utc' });
  }

  public buyDailyItem(item: Item) {
    this.daily.item[item.uuid] = +DateTime.fromObject({ zone: 'utc' });
  }

  gainExp(xpGain: number) {
    super.gainExp(this.$$room.subscriptionHelper.modifyXPGainForSubscription(this, xpGain));
  }

  _gainSkill(type, skillGained) {
    let val = skillGained;

    // fix for character creation
    if(this.$$room) {
      val = this.$$room.subscriptionHelper.modifySkillGainForSubscription(this, skillGained);
    }

    const curLevel = this.calcSkillLevel(type);
    super._gainSkill(type, val);
    const newLevel = this.calcSkillLevel(type);

    if(this.$$room && curLevel !== newLevel) {
      if(newLevel > curLevel) {
        this.sendClientMessage(`You have become more proficient in your ${type.toUpperCase()} skill!`);
      } else {
        this.sendClientMessage(`You have lost proficiency in your ${type.toUpperCase()} skill!`);
      }
    }
  }

  spendCurrency(currency: Currency, amt: number, on?: string) {
    super.spendCurrency(currency, amt, on);

    if(on) {
      this.$$room.analyticsHelper.trackCurrencySink('Sink', this, currency, amt, on);
    }
  }

  earnCurrency(currency: Currency, amt: number, reason?: string) {
    super.earnCurrency(currency, amt, reason);

    if(reason) {
      this.$$room.analyticsHelper.trackCurrencySink('Source', this, currency, amt, reason);
    }
  }

}
