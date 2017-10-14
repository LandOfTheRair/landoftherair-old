"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const character_1 = require("./character");
const item_1 = require("./item");
const lodash_1 = require("lodash");
const Quests = require("../server/quests");
class Player extends character_1.Character {
    constructor() {
        super(...arguments);
        this.activeQuests = {};
        this.questProgress = {};
        this.permanentQuestCompletion = {};
    }
    get party() {
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
        if (!this.buyback)
            this.buyback = [];
        this.buyback = this.buyback.map(item => new item_1.Item(item));
    }
    initServer() {
        this.initEffects();
        this.recalculateStats();
        this.uuid = this.username;
        this.$$actionQueue = [];
    }
    learnSpell(skillName, conditional = false) {
        this.learnedSpells = this.learnedSpells || {};
        const storeName = skillName.toLowerCase();
        if (this.learnedSpells[storeName] > 0)
            return false;
        if (conditional && !this.learnedSpells[storeName]) {
            this.sendClientMessage(`Your item has bestowed the ability to cast ${skillName}!`);
        }
        this.learnedSpells[storeName] = conditional ? -1 : 1;
        return true;
    }
    hasLearned(skillName) {
        if (this.learnedSpells) {
            const isLearned = this.learnedSpells[skillName.toLowerCase()];
            if (isLearned > 0)
                return true;
            if (isLearned < 0) {
                const slot = lodash_1.find(character_1.AllNormalGearSlots, itemSlot => {
                    const checkItem = lodash_1.get(this, itemSlot);
                    if (!checkItem || !checkItem.effect)
                        return false;
                    return checkItem.effect.name.toLowerCase() === skillName.toLowerCase();
                });
                if (!slot)
                    return false;
                const item = lodash_1.get(this, slot);
                if (!item)
                    return false;
                if (item.castAndTryBreak()) {
                    this.sendClientMessage('Your item has fizzled and turned to dust.');
                    if (slot === 'leftHand')
                        this.setLeftHand(null);
                    else if (slot === 'rightHand')
                        this.setRightHand(null);
                    else
                        this.unequip(slot.split('.')[1]);
                }
                return item;
            }
        }
        return false;
    }
    flagSkill(skills) {
        if (!lodash_1.isArray(skills))
            skills = [skills];
        this.$$flaggedSkills = skills;
    }
    kill(target) {
        this.$$actionQueue = lodash_1.reject(this.$$actionQueue, ({ args }) => lodash_1.includes(args, target.uuid));
        if (target.npcId) {
            this.checkForQuestUpdates({ kill: target.npcId });
        }
        const skillGain = target.skillOnKill;
        this.gainSkillFromKills(skillGain);
    }
    gainSkillFromKills(skillGain) {
        if (!this.$$flaggedSkills || !this.$$flaggedSkills.length)
            return;
        const [primary, secondary] = this.$$flaggedSkills;
        if (secondary) {
            this.gainSkill(primary, skillGain * 0.75);
            this.gainSkill(secondary, skillGain * 0.25);
        }
        else {
            this.gainSkill(primary, skillGain);
        }
        if (this.party) {
            this.$$room.shareSkillWithParty(this, skillGain);
        }
    }
    gainExpFromKills(xpGain) {
        super.gainExpFromKills(xpGain);
        if (this.party) {
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
        if (killer) {
            const myCon = this.getTotalStat('con');
            const myLuk = this.getTotalStat('luk');
            if (!(killer instanceof Player)) {
                this.dropHands();
            }
            if (myCon > 3)
                this.stats.con--;
            if (myCon === 3) {
                if (this.stats.hp > 10 && lodash_1.random(1, 5) === 1) {
                    this.stats.hp -= 2;
                }
                if (lodash_1.random(1, myLuk) === 1)
                    this.strip(this);
                if (lodash_1.random(1, myLuk / 5) === 1)
                    this.stats.con--;
            }
            if (myCon === 2) {
                if (this.stats.hp > 10)
                    this.stats.hp -= 2;
                if (lodash_1.random(1, myLuk / 5) === 1)
                    this.strip(this);
                if (lodash_1.random(1, myLuk) === 1)
                    this.stats.con--;
            }
            if (myCon === 1) {
                if (this.stats.hp > 10)
                    this.stats.hp -= 2;
                if (lodash_1.random(1, 2) === 1)
                    this.strip(this);
            }
        }
    }
    restore(force = false) {
        if (force) {
            this.sendClientMessage('You feel a churning sensation.');
            if (this.stats.str > 5 && lodash_1.random(1, 5) === 1)
                this.stats.str--;
            if (this.stats.agi > 5 && lodash_1.random(1, 5) === 1)
                this.stats.agi--;
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
        if (!item)
            return;
        if (item.itemClass === 'Corpse') {
            item.$heldBy = this.username;
        }
        if (item.effect && item.effect.uses) {
            this.learnSpell(item.effect.name, true);
        }
    }
    sellValue(item) {
        // every cha after 10 increases the sale value by ~2%
        const valueMod = 10 - ((this.getTotalStat('cha') - 10) / 5);
        return Math.max(1, Math.floor(item.value / valueMod));
    }
    buybackSize() {
        return character_1.MaxSizes.Buyback;
    }
    fixBuyback() {
        this.buyback = lodash_1.compact(this.buyback);
    }
    buyItemBack(slot) {
        const item = this.buyback[slot];
        lodash_1.pull(this.buyback, item);
        this.fixBuyback();
        return item;
    }
    sellItem(item) {
        const value = this.sellValue(item);
        this.gainGold(value);
        item._buybackValue = value;
        this.buyback.push(item);
        if (this.buyback.length > this.buybackSize())
            this.buyback.shift();
        return value;
    }
    addBankMoney(region, amount) {
        amount = Math.round(+amount);
        if (isNaN(amount))
            return false;
        if (amount < 0)
            return false;
        if (amount > this.gold)
            amount = this.gold;
        this.banks = this.banks || {};
        this.banks[region] = this.banks[region] || 0;
        this.banks[region] += amount;
        this.loseGold(amount);
        return amount;
    }
    loseBankMoney(region, amount) {
        amount = Math.round(+amount);
        if (isNaN(amount))
            return false;
        if (amount < 0)
            return false;
        this.banks = this.banks || {};
        this.banks[region] = this.banks[region] || 0;
        if (amount > this.banks[region])
            amount = this.banks[region];
        this.banks[region] -= amount;
        this.gainGold(amount);
        return amount;
    }
    sendClientMessage(message) {
        this.$$room.sendPlayerLogMessage(this, message);
    }
    receiveMessage(from, message) {
        this.sendClientMessage({ name: `[private] ${from.name}`, message });
    }
    queueAction({ command, args }) {
        this.$$actionQueue.push({ command, args });
        if (this.$$actionQueue.length > 20)
            this.$$actionQueue.length = 20;
    }
    tick() {
        super.tick();
        this.$$room.partyManager.updateMember(this);
        if (this.isInCombat)
            this.combatTicks--;
        if (!this.$$actionQueue)
            return;
        const nextAction = this.$$actionQueue.shift();
        if (nextAction) {
            this.$$room.executeCommand(this, nextAction.command, nextAction.args);
        }
    }
    addAgro(char, value) {
        if (!char || (char.$$ai && char.$$ai.tick))
            return;
        super.addAgro(char, value);
    }
    hasHeldItem(item, hand = 'right') {
        const ref = this[`${hand}Hand`];
        return (ref && ref.name === item && ref.isOwnedBy(this));
    }
    hasHeldItems(item1, item2) {
        return (this.hasHeldItem(item1, 'right') && this.hasHeldItem(item2, 'left'))
            || (this.hasHeldItem(item2, 'right') && this.hasHeldItem(item1, 'left'));
    }
    startQuest(quest) {
        // can't start a quest you're already on or have completed
        if (this.hasQuest(quest) || this.hasPermanentCompletionFor(quest.name))
            return;
        this.activeQuests[quest.name] = true;
        this.setQuestData(quest, quest.initialData);
    }
    hasQuest(quest) {
        return this.activeQuests[quest.name];
    }
    hasPermanentCompletionFor(questName) {
        return this.permanentQuestCompletion[questName];
    }
    setQuestData(quest, data) {
        this.questProgress[quest.name] = data;
    }
    getQuestData(quest) {
        return this.questProgress[quest.name];
    }
    checkForQuestUpdates(questOpts = { kill: '' }) {
        if (questOpts.kill) {
            Object.keys(this.activeQuests).forEach(quest => {
                const realQuest = Quests[quest];
                const { type } = realQuest.requirements;
                if (type !== 'kill')
                    return;
                if (realQuest.canUpdateProgress(this, questOpts)) {
                    realQuest.updateProgress(this, questOpts);
                }
            });
        }
    }
    permanentlyCompleteQuest(questName) {
        this.permanentQuestCompletion[questName] = true;
    }
    completeQuest(quest) {
        if (!quest.isRepeatable) {
            this.permanentlyCompleteQuest(quest.name);
        }
        delete this.questProgress[quest.name];
        delete this.activeQuests[quest.name];
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map