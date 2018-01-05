
import * as RestrictedNumber from 'restricted-number';

import { Character, MaxSizes, AllNormalGearSlots, Allegiance } from './character';
import { Item } from './item';

import { DateTime } from 'luxon';
import { compact, pull, random, isArray, get, find, includes, reject, sample, startsWith, extend, values, isUndefined } from 'lodash';
import { Party } from './party';
import { Quest } from '../../server/base/Quest';

import * as Quests from '../../server/quests';
import { LowCON } from '../../server/effects/LowCON';
import { Dead } from '../../server/effects/Dead';
import { nonenumerable } from 'nonenumerable';
import { CharacterHelper } from '../../server/helpers/character-helper';

import { AllTraits } from '../traits/trait-hash';
import { DeathHelper } from '../../server/helpers/death-helper';
import { PartyHelper } from '../../server/helpers/party-helper';
import { Malnourished } from '../../server/effects/Malnourished';
import { AlchemyContainer } from './container/tradeskills/alchemy';
import { SpellforgingContainer } from './container/tradeskills/spellforging';

export class Player extends Character {
  @nonenumerable
  _id?: any;

  @nonenumerable
  createdAt: number;
  username: string;

  charSlot: number;

  @nonenumerable
  isGM: boolean;

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
  $$flaggedSkills;

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

  private traitPoints;

  @nonenumerable
  private traitPointTimer: number;
  private traitLevels: any;

  @nonenumerable
  private $$lastCommandSent: string;

  private partyPoints: number;
  private partyExp: RestrictedNumber;

  private lastDeathLocation: any;

  public $$hungerTicks: number;
  public $$isAccessingLocker: boolean;

  public tradeSkillContainers: { alchemy?: AlchemyContainer, spellforging?: SpellforgingContainer };

  public daily: any;

  get party(): Party {
    return this.$$room && this.$$room.partyManager ? this.$$room.partyManager.getPartyByName(this.partyName) : null;
  }

  init() {
    this.initBelt();
    this.initSack();
    this.initGear();
    this.initHands();
    this.initTradeskills();
    this.initBuyback();
  }

  initTradeskills() {
    this.tradeSkillContainers = this.tradeSkillContainers || {};
    this.tradeSkillContainers.alchemy = new AlchemyContainer(this.tradeSkillContainers.alchemy);
    this.tradeSkillContainers.spellforging = new SpellforgingContainer(this.tradeSkillContainers.spellforging);
  }

  initBuyback() {
    if(!this.buyback) this.buyback = [];
    this.buyback = this.buyback.map(item => new Item(item));
  }

  initServer() {
    this.initEffects();
    this.recalculateStats();
    this.uuid = this.username;
    this.$$actionQueue = [];
    if(isUndefined(this.$$hungerTicks)) this.$$hungerTicks = 3600 * 6;
    if(!this.traitPoints) this.traitPoints = 0;
    if(!this.partyExp || !this.partyExp.maximum) {
      this.partyPoints = 0;
      this.partyExp = new RestrictedNumber(0, 100, 0);

    } else {
      this.partyExp = new RestrictedNumber(0, this.partyExp.maximum, this.partyExp.__current);
    }
    if(isUndefined(this.daily)) this.daily = {};
    if(isUndefined(this.daily.item)) this.daily.item = {};
    if(isUndefined(this.daily.quest)) this.daily.quest = {};
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

        if(!item) return false;

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
    this.$$flaggedSkills = skills;
  }

  kill(target: Character) {
    this.$$actionQueue = reject(this.$$actionQueue, ({ args }) => includes(args, target.uuid));

    const npcId = (<any>target).npcId;
    if(npcId) {
      this.checkForQuestUpdates({ kill: npcId });

      if(this.party) {
        PartyHelper.shareKillsWithParty(this, { kill: npcId });
      }
    }

    const skillGain = target.skillOnKill;
    this.gainSkillFromKills(skillGain);

  }

  gainSkillFromKills(skillGain: number) {
    if(!this.$$flaggedSkills || !this.$$flaggedSkills.length) return;
    const [primary, secondary] = this.$$flaggedSkills;

    const adjustedSkill = this.$$room.calcAdjustedSkillGain(skillGain);

    if(secondary) {
      this.gainSkill(primary, adjustedSkill * 0.75);
      this.gainSkill(secondary, adjustedSkill * 0.25);
    } else {
      this.gainSkill(primary, adjustedSkill);
    }

    if(this.party) {
      PartyHelper.shareSkillWithParty(this, adjustedSkill);
    }
  }

  gainExpFromKills(xpGain: number) {
    super.gainExpFromKills(xpGain);

    if(this.party) {
      PartyHelper.shareExpWithParty(this, xpGain);

      this.gainPartyExp(xpGain);
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

    this.partyExp.add(Math.floor(baseExp / this.party.members.length + 1));

    this.checkToGainPartyPoints();
  }

  private checkToGainPartyPoints() {
    if(this.partyPoints >= 100 || !this.partyExp.atMaximum()) return;

    this.partyPoints = this.partyPoints || 0;
    this.partyPoints++;
    this.partyExp.toMinimum();

    const prevMax = this.partyExp.maximum;
    this.partyExp.maximum = Math.floor(100 + (prevMax * 1.0025));
  }

  public hasPartyPoints(pp = 0): boolean {
    return this.partyPoints >= pp;
  }

  public losePartyPoints(pp = 0): void {
    this.partyPoints -= pp;
    if(this.partyPoints < 0 || isNaN(this.partyPoints)) this.partyPoints = 0;
  }

  isPlayer() {
    return true;
  }

  async die(killer) {
    super.die(killer);

    this.lastDeathLocation = { x: this.x, y: this.y };

    // 5 minutes to restore
    this.$$deathTicks = 60 * 5;
    this.combatTicks = 0;

    const dead = new Dead({});
    dead.cast(this, this);
    dead.duration = this.$$deathTicks;

    this.$$actionQueue = [];

    await DeathHelper.createCorpse(this, [], this.getBaseSprite() + 4);

    const myCon = this.getBaseStat('con');
    const myLuk = this.getTotalStat('luk');

    if(myCon > 3) this.loseBaseStat('con', -1);

    if(this.getBaseStat('con') <= 3) {
      const lowCon = new LowCON({});
      lowCon.cast(this, this);
    }

    if(myCon === 3) {
      if(this.stats.hp > 10 && random(1, 5) === 1) {
        this.loseBaseStat('hp', -2);
      }

      if(random(1, myLuk / 5) === 1) this.loseBaseStat('con', -1);
    }

    if(myCon === 2) {
      if(this.stats.hp > 10) this.loseBaseStat('hp', -2);
      if(random(1, myLuk) === 1) this.loseBaseStat('con', -1);
    }

    if(myCon === 1) {
      if(this.stats.hp > 10) this.loseBaseStat('hp', -2);
    }

    if(killer && !killer.isPlayer()) {

      if(random(1, 100) > this.getTraitLevelAndUsageModifier('DeathGrip')) {
        CharacterHelper.dropHands(this);
      }

      if(myCon === 3) {
        if(random(1, myLuk) === 1) CharacterHelper.strip(this, this);
      }

      if(myCon === 2) {
        if(random(1, myLuk / 5) === 1) CharacterHelper.strip(this, this);
      }

      if(myCon === 1) {
        if(random(1, 2) === 1) CharacterHelper.strip(this, this);
      }
    }
  }

  revive() {
    if(!this.isDead()) return;

    if(this.$$corpseRef) {
      this.$$room.removeCorpse(this.$$corpseRef);
      this.$$corpseRef = null;
    }
    this.dir = 'S';
  }

  restore(force = false) {
    if(!this.isDead()) return;

    if(this.$$corpseRef) {
      this.$$room.removeCorpse(this.$$corpseRef);
      this.$$corpseRef = null;
    }

    if(force) {
      this.sendClientMessage('You feel a churning sensation.');
      if(this.stats.str > 5 && random(1, 5) === 1) this.stats.str--;
      if(this.stats.agi > 5 && random(1, 5) === 1) this.stats.agi--;
    }

    this.tryToCastEquippedEffects();

    this.hp.set(1);
    this.dir = 'S';
    this.teleportToRespawnPoint();
  }

  teleportToRespawnPoint() {
    this.$$room.teleport(this, { newMap: this.respawnPoint.map, x: this.respawnPoint.x, y: this.respawnPoint.y, zChange: 0 });
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
    }

    if(item.effect && item.effect.uses) {
      this.learnSpell(item.effect.name, true);
    }
  }

  sellValue(item) {
    // every cha after 10 increases the sale value by ~2%
    const valueMod = 10 - ((this.getTotalStat('cha') - 10) / 5);
    return Math.max(1, Math.floor(item.value / valueMod));
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
    return item;
  }

  sellItem(item: Item): number {
    const value = this.sellValue(item);
    this.gainGold(value);
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
    this.$$actionQueue.push({ command, args });
    if(this.$$actionQueue.length > 20) this.$$actionQueue.length = 20;
  }

  tick() {
    super.tick();

    this.$$room.partyManager.updateMember(this);

    if(this.isInCombat) this.combatTicks--;

    this.$$hungerTicks--;

    if(this.$$hungerTicks <= 0 && !this.hasEffect('Malnourished')) {
      const malnourished = new Malnourished({});
      malnourished.cast(this, this);
    }

    if(!this.$$actionQueue || this.isUnableToAct()) return;
    const nextAction = this.$$actionQueue.shift();
    if(nextAction) {
      this.$$room.executeCommand(this, nextAction.command, nextAction.args);
    }
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
    return this.activeQuests ? this.activeQuests[quest.name] : false;
  }

  hasPermanentCompletionFor(questName: string): boolean {
    return this.permanentQuestCompletion ? this.permanentQuestCompletion[questName] : false;
  }

  setQuestData(quest: Quest, data: any) {
    if(!this.questProgress) this.questProgress = {};
    this.questProgress[quest.name] = data;
  }

  getQuestData(quest: Quest) {
    return this.questProgress ? this.questProgress[quest.name] : null;
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

  public canGainTraitPoints(): boolean {
    return this.traitPoints < 100;
  }

  public gainTraitPoints(tp = 0, overMax = false): void {
    if(!this.traitPoints) this.traitPoints = 0;

    if(!overMax && !this.canGainTraitPoints()) return;

    this.traitPoints += tp;
    if(this.traitPoints < 0 || isNaN(this.traitPoints)) this.traitPoints = 0;
  }

  public hasTraitPoints(tp = 0): boolean {
    return this.traitPoints >= tp;
  }

  public loseTraitPoints(tp = 1): void {
    this.traitPoints -= tp;
    if(this.traitPoints < 0 || isNaN(this.traitPoints)) this.traitPoints = 0;
  }

  public increaseTraitLevel(trait: string, reqBaseClass?: string, extra = {}): void {
    this.traitLevels = this.traitLevels || {};
    this.traitLevels[trait] = this.traitLevels[trait] || { level: 0, active: true };
    this.traitLevels[trait].reqBaseClass = reqBaseClass;
    extend(this.traitLevels[trait], extra);
    this.traitLevels[trait].level++;
  }

  private get traitableGear(): Item[] {
    const baseValue = values(this.gear);
    if(this.leftHand && this.canGetBonusFromItemInHand(this.leftHand)) baseValue.push(this.leftHand);
    if(this.rightHand && this.canGetBonusFromItemInHand(this.rightHand)) baseValue.push(this.rightHand);
    return compact(baseValue);
  }

  public getBaseTraitLevel(trait: string): number {
    if(!this.traitLevels || !this.isTraitActive(trait) || !this.isTraitInEffect(trait)) return 0;
    return this.traitLevels[trait] ? this.traitLevels[trait].level : 0;
  }

  public getTraitLevel(trait: string): number {
    if(!this.traitLevels || !this.isTraitActive(trait) || !this.isTraitInEffect(trait)) return 0;
    const baseValue = this.traitableGear.reduce((prev, cur) => prev + (cur.trait && cur.trait.name === trait ? cur.trait.level : 0), 0);
    return baseValue + this.getBaseTraitLevel(trait);
  }

  public isTraitInEffect(trait: string): boolean {
    if(!this.traitLevels) return false;

    const traitRef = this.traitLevels[trait];
    if(!traitRef) return false;

    // check if is active, defaults to true
    const { category, name } = traitRef;
    if(!category || !name) return true;

    return AllTraits[category][name].currentlyInEffect(this);
  }

  public isTraitActive(trait: string): boolean {

    // haven't bought any traits, so no.
    if(!this.traitLevels) return false;

    const traitRef = this.traitLevels[trait];
    if(!traitRef) return false;

    // if my class doesn't match the trait name, the answer is no
    if(traitRef.reqBaseClass && this.baseClass !== traitRef.reqBaseClass) return false;

    // if it's active, yes
    return traitRef ? traitRef.active : false;
  }

  public manageTraitPointPotentialGain(command: string): void {
    if(startsWith(command, '~')) return;

    if(!this.traitPointTimer || this.traitPointTimer <= 0) {
      this.traitPointTimer = this.$$room.calcAdjustedTraitTimer(random(200, 300));
    }

    let timerReduction = 1;
    if(this.$$lastCommandSent === command) timerReduction = 0.3;

    this.traitPointTimer -= this.$$room.calcAdjustedTraitGain(timerReduction);

    if(this.traitPointTimer <= 0 && this.canGainTraitPoints()) {
      this.gainTraitPointWithMessage();
    }
  }

  private gainTraitPointWithMessage() {
    const messages = [
      'You made an interesting observation.',
      'You had a moment of self-realization.',
      'You are suddenly more aware of your actions.'
    ];

    this.sendClientMessage(sample(messages));
    this.gainTraitPoints(1);
  }

  takeSequenceOfSteps(steps, isChasing, recalculateFOV) {
    super.takeSequenceOfSteps(steps, isChasing, recalculateFOV);
    this.$$locker = null;
  }

  private canDailyActivate(checkTimestamp: number) {
    let theoreticalResetTime = DateTime.fromObject({ zone: 'utc', hour: 12 });
    if(+theoreticalResetTime < DateTime.fromObject({ zone: 'utc' })) {
      theoreticalResetTime = theoreticalResetTime.plus({ days: 1 });
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
    return this.canDailyActivate(this.daily.quest[key] || 0);
  }

  public completeDailyQuest(key: string): void {
    this.daily.quest[key] = Date.now();
  }

  public buyDailyItem(item: Item) {
    this.daily.item[item.uuid] = Date.now();
  }

}
