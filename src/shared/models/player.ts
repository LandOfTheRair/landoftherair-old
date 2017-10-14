
import { Character, MaxSizes, AllNormalGearSlots } from './character';
import { Item } from './item';

import { compact, pull, random, isArray, get, find, includes, reject } from 'lodash';
import { Party } from './party';
import { Quest } from '../../server/base/Quest';

import * as Quests from '../../server/quests';

export class Player extends Character {
  _id?: any;

  createdAt: number;
  username: string;
  charSlot: number;
  isGM: boolean;

  inGame: boolean;

  buyback: Item[];

  private learnedSpells: any;

  banks: any;

  $$doNotSave: boolean;
  $$actionQueue;
  $$flaggedSkills;
  $$lastDesc: string;
  $$lastRegion: string;
  $$swimElement: string;

  bgmSetting: 'town' | 'dungeon' | 'wilderness';

  respawnPoint: { x: number, y: number, map: string };

  partyName: string;

  private activeQuests: any = {};
  private questProgress: any = {};
  private permanentQuestCompletion: any = {};

  get party(): Party {
    return this.$$room ? this.$$room.partyManager.getPartyByName(this.partyName) : null;
  }

  init() {
    this.initBelt();
    this.initSack();
    this.initGear();
    this.initHands();
    this.initBuyback();
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

    if((<any>target).npcId) {
      this.checkForQuestUpdates({ kill: (<any>target).npcId });
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
      this.$$room.shareSkillWithParty(this, adjustedSkill);
    }
  }

  gainExpFromKills(xpGain: number) {
    super.gainExpFromKills(xpGain);

    if(this.party) {
      this.$$room.shareExpWithParty(this, xpGain);
    }
  }

  isPlayer() {
    return true;
  }

  die(killer) {
    super.die(killer);

    // 5 minutes to restore
    this.$$deathTicks = 360 * 5;
    this.combatTicks = 0;

    if(killer) {
      const myCon = this.getTotalStat('con');
      const myLuk = this.getTotalStat('luk');

      if(!(killer instanceof Player)) {
        this.dropHands();
      }

      if(myCon > 3) this.stats.con--;

      if(myCon === 3) {
        if(this.stats.hp > 10 && random(1, 5) === 1) {
          this.stats.hp -= 2;
        }

        if(random(1, myLuk) === 1) this.strip(this);

        if(random(1, myLuk / 5) === 1) this.stats.con--;
      }

      if(myCon === 2) {
        if(this.stats.hp > 10) this.stats.hp -= 2;
        if(random(1, myLuk / 5) === 1) this.strip(this);
        if(random(1, myLuk) === 1) this.stats.con--;
      }

      if(myCon === 1) {
        if(this.stats.hp > 10) this.stats.hp -= 2;
        if(random(1, 2) === 1) this.strip(this);
      }
    }
  }

  restore(force = false) {
    if(force) {
      this.sendClientMessage('You feel a churning sensation.');
      if(this.stats.str > 5 && random(1, 5) === 1) this.stats.str--;
      if(this.stats.agi > 5 && random(1, 5) === 1) this.stats.agi--;
    }

    this.hp.set(1);
    this.dir = 'S';
    this.teleportToRespawnPoint();
  }

  teleportToRespawnPoint() {
    this.$$room.teleport(this, { newMap: this.respawnPoint.map, x: this.respawnPoint.x, y: this.respawnPoint.y });
  }

  getSprite() {
    return 725;
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

  addBankMoney(region: string, amount: number) {
    amount = Math.round(+amount);
    if(isNaN(amount)) return false;

    if(amount < 0) return false;
    if(amount > this.gold) amount = this.gold;

    this.banks = this.banks || {};
    this.banks[region] = this.banks[region] || 0;
    this.banks[region] += amount;

    this.loseGold(amount);
    return amount;
  }

  loseBankMoney(region, amount) {
    amount = Math.round(+amount);
    if(isNaN(amount)) return false;
    if(amount < 0) return false;
    this.banks = this.banks || {};
    this.banks[region] = this.banks[region] || 0;

    if(amount > this.banks[region]) amount = this.banks[region];

    this.banks[region] -= amount;
    this.gainGold(amount);
    return amount;
  }

  sendClientMessage(message): void {
    this.$$room.sendPlayerLogMessage(this, message);
  }

  receiveMessage(from: Character, message) {
    this.sendClientMessage({ name: `[private] ${from.name}`, message });
  }

  queueAction({ command, args }) {
    this.$$actionQueue.push({ command, args });
    if(this.$$actionQueue.length > 20) this.$$actionQueue.length = 20;
  }

  tick() {
    super.tick();

    this.$$room.partyManager.updateMember(this);

    if(this.isInCombat) this.combatTicks--;

    if(!this.$$actionQueue) return;
    const nextAction = this.$$actionQueue.shift();
    if(nextAction) {
      this.$$room.executeCommand(this, nextAction.command, nextAction.args);
    }
  }

  addAgro(char: Character, value) {
    if(!char || (char.$$ai && char.$$ai.tick)) return;
    super.addAgro(char, value);
  }

  hasHeldItem(item: string, hand: 'left'|'right' = 'right'): boolean {
    const ref = this[`${hand}Hand`];
    return (ref && ref.name === item && ref.isOwnedBy(this));
  }

  hasHeldItems(item1: string, item2: string): boolean {
    return (this.hasHeldItem(item1, 'right') && this.hasHeldItem(item2, 'left'))
        || (this.hasHeldItem(item2, 'right') && this.hasHeldItem(item1, 'left'));
  }

  startQuest(quest: Quest) {

    // can't start a quest you're already on or have completed
    if(this.hasQuest(quest) || this.hasPermanentCompletionFor(quest.name)) return;
    this.activeQuests[quest.name] = true;
    this.setQuestData(quest, quest.initialData);
  }

  hasQuest(quest: Quest) {
    return this.activeQuests[quest.name];
  }

  hasPermanentCompletionFor(questName: string) {
    return this.permanentQuestCompletion[questName];
  }

  setQuestData(quest: Quest, data: any) {
    this.questProgress[quest.name] = data;
  }

  getQuestData(quest: Quest) {
    return this.questProgress[quest.name];
  }

  checkForQuestUpdates(questOpts = { kill: '' }) {

    if(questOpts.kill) {
      Object.keys(this.activeQuests).forEach(quest => {
        const realQuest = Quests[quest];

        const { type } = realQuest.requirements;
        if(type !== 'kill') return;

        if(realQuest.canUpdateProgress(this, questOpts)) {
          realQuest.updateProgress(this, questOpts);
        }
      });
    }

  }

  permanentlyCompleteQuest(questName: string) {
    this.permanentQuestCompletion[questName] = true;
  }

  completeQuest(quest: Quest) {
    if(!quest.isRepeatable) {
      this.permanentlyCompleteQuest(quest.name);
    }
    delete this.questProgress[quest.name];
    delete this.activeQuests[quest.name];
  }

}
