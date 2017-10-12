"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const item_1 = require("./item");
const RestrictedNumber = require("restricted-number");
const signals_js_1 = require("signals.js");
const maplayer_1 = require("./maplayer");
const hide_reductions_1 = require("../server/helpers/hide-reductions");
const Classes = require("../server/classes");
const Effects = require("../server/effects");
const sack_1 = require("./container/sack");
const belt_1 = require("./container/belt");
exports.SkillClassNames = {
    Mace: 'Mace',
    Axe: 'Axe',
    Dagger: 'Dagger',
    OneHanded: 'Onehanded',
    TwoHanded: 'Twohanded',
    Shortsword: 'Shortsword',
    Polearm: 'Polearm',
    Ranged: 'Ranged',
    Martial: 'Martial',
    Staff: 'Staff',
    Throwing: 'Throwing',
    Thievery: 'Thievery',
    Wand: 'Wand',
    Conjuration: 'Conjuration',
    Restoration: 'Restoration'
};
class Skills {
    constructor() {
        this.mace = 0;
        this.axe = 0;
        this.dagger = 0;
        this.onehanded = 0;
        this.twohanded = 0;
        this.shortsword = 0;
        this.polearm = 0;
        this.ranged = 0;
        this.martial = 0;
        this.staff = 0;
        this.throwing = 0;
        this.thievery = 0;
        this.wand = 0;
        this.conjuration = 0;
        this.restoration = 0;
    }
}
exports.Skills = Skills;
class Stats {
    constructor() {
        this.str = 0;
        this.dex = 0;
        this.agi = 0;
        this.int = 0;
        this.wis = 0;
        this.wil = 0;
        this.luk = 0;
        this.cha = 0;
        this.con = 0;
        this.move = 3;
        this.hpregen = 1;
        this.mpregen = 1;
        this.hp = 100;
        this.mp = 0;
        this.armorClass = 0;
        this.accuracy = 0;
        this.offense = 0;
        this.defense = 0;
        this.stealth = 0;
        this.perception = 0;
        this.magicalResist = 0;
        this.physicalResist = 0;
        this.necroticResist = 0;
        this.energyResist = 0;
        this.waterResist = 0;
        this.fireResist = 0;
        this.iceResist = 0;
    }
}
exports.Stats = Stats;
exports.MaxSizes = {
    Belt: 5,
    Sack: 25,
    Buyback: 5
};
exports.AllNormalGearSlots = [
    'rightHand', 'leftHand', 'gear.Armor', 'gear.Robe1', 'gear.Robe2', 'gear.Ring1', 'gear.Ring2',
    'gear.Head', 'gear.Neck', 'gear.Waist', 'gear.Wrists', 'gear.Hands', 'gear.Feet', 'gear.Ear'
];
class Character {
    constructor(opts) {
        this.agro = {};
        this.hp = new RestrictedNumber(0, 100, 100);
        this.mp = new RestrictedNumber(0, 0, 0);
        this.exp = 1000;
        this.gold = 0;
        this.stats = new Stats();
        // we don't want to initialize this because of side effects from default values
        this.additionalStats = {};
        this.totalStats = new Stats();
        this.skills = new Skills();
        this.allegiance = 'None';
        this.sex = 'Male';
        this.dir = 'S';
        this.x = 0;
        this.y = 0;
        this.level = 1;
        this.highestLevel = 1;
        this.baseClass = 'Undecided';
        this.sack = new sack_1.Sack({ size: this.sackSize });
        this.belt = new belt_1.Belt({ size: this.beltSize });
        this.effects = [];
        this.gear = {};
        this.combatTicks = 0;
        this.alignment = 'Neutral';
        this.allegianceReputation = {};
        lodash_1.merge(this, opts);
        this.initHpMp();
        this.init();
    }
    get baseStats() {
        return lodash_1.clone(this.stats);
    }
    get sumStats() {
        return lodash_1.clone(this.totalStats);
    }
    get allSkills() {
        return lodash_1.clone(this.skills);
    }
    get isInCombat() {
        return this.combatTicks > 0;
    }
    get sackSize() {
        return exports.MaxSizes.Sack;
    }
    get beltSize() {
        return exports.MaxSizes.Belt;
    }
    getSprite() {
        return 0;
    }
    getTotalStat(stat) {
        return this.totalStats[stat] || 0;
    }
    getBaseStat(stat) {
        return this.stats[stat] || 0;
    }
    initAI() {
        this.$$ai = {
            tick: new signals_js_1.Signal()
        };
    }
    initHpMp() {
        this.hp = new RestrictedNumber(this.hp.minimum, this.hp.maximum, this.hp.__current);
        this.mp = new RestrictedNumber(this.mp.minimum, this.mp.maximum, this.mp.__current);
    }
    initSack() {
        this.sack = new sack_1.Sack(this.sack);
    }
    initBelt() {
        this.belt = new belt_1.Belt(this.belt);
    }
    initHands() {
        if (this.leftHand)
            this.leftHand = new item_1.Item(this.leftHand);
        if (this.rightHand)
            this.rightHand = new item_1.Item(this.rightHand);
        if (this.potionHand)
            this.potionHand = new item_1.Item(this.potionHand);
    }
    initGear() {
        Object.keys(this.gear).forEach(slot => {
            if (!this.gear[slot])
                return;
            this.gear[slot] = new item_1.Item(this.gear[slot]);
        });
    }
    initEffects() {
        this.effects = this.effects.map(x => new Effects[x.name](x));
    }
    init() { }
    initServer() { }
    toJSON() {
        return lodash_1.omitBy(this, (value, key) => {
            if (key === '$fov' || key === 'battleTicks' || key === 'bgmSetting')
                return false;
            if (!Object.getOwnPropertyDescriptor(this, key))
                return true;
            if (lodash_1.startsWith(key, '$$'))
                return true;
            if (key === '_id')
                return true;
            return false;
        });
    }
    hasEmptyHand() {
        return !this.leftHand || !this.rightHand;
    }
    determineItemType(itemClass) {
        return item_1.EquipHash[itemClass] || itemClass;
    }
    getItemSlotToEquipIn(item) {
        let slot = item.itemClass;
        if (item.isRobe()) {
            const armor = this.gear.Armor;
            const robe1 = this.gear.Robe1;
            const robe2 = this.gear.Robe2;
            if (armor && robe1 && robe2)
                return false;
            if (!armor) {
                slot = 'Armor';
            }
            else if (!robe1) {
                slot = 'Robe1';
            }
            else if (!robe2) {
                slot = 'Robe2';
            }
        }
        else if (item.isArmor()) {
            const armor = this.gear.Armor;
            if (armor)
                return false;
            slot = 'Armor';
        }
        else if (item.itemClass === 'Ring') {
            const ring1 = this.gear.Ring1;
            const ring2 = this.gear.Ring2;
            if (ring1 && ring2)
                return false;
            if (!ring1) {
                slot = 'Ring1';
            }
            else if (!ring2) {
                slot = 'Ring2';
            }
        }
        else {
            const realSlot = this.determineItemType(item.itemClass);
            if (!lodash_1.includes(['Head', 'Neck', 'Waist', 'Wrists', 'Hands', 'Feet', 'Ear'], realSlot))
                return false;
            if (this.gear[realSlot])
                return false;
            slot = realSlot;
        }
        return slot;
    }
    gainStat(stat, value = 1) {
        this.additionalStats[stat] = (this.additionalStats[stat] || 0) + value;
        this.recalculateStats();
    }
    loseStat(stat, value = 1) {
        this.additionalStats[stat] = (this.additionalStats[stat] || 0) - value;
        this.recalculateStats();
    }
    gainBaseStat(stat, value = 1) {
        this.stats[stat] += value;
        this.recalculateStats();
    }
    recalculateStats() {
        this.totalStats = {};
        const allGear = lodash_1.compact(lodash_1.values(this.gear));
        const canGetBonusFromItemInHand = (item) => {
            return this.checkCanEquipWithoutGearCheck(item) && lodash_1.includes(item_1.GivesBonusInHandItemClasses, item.itemClass);
        };
        Object.keys(this.stats).forEach(stat => {
            this.totalStats[stat] = this.stats[stat];
        });
        Object.keys(this.additionalStats).forEach(stat => {
            this.totalStats[stat] += this.additionalStats[stat];
        });
        const addStatsForItem = (item) => {
            Object.keys(item.stats).forEach(stat => {
                this.totalStats[stat] += item.stats[stat];
            });
        };
        allGear.forEach(item => {
            if (!item.stats || !this.checkCanEquipWithoutGearCheck(item))
                return;
            addStatsForItem(item);
        });
        if (this.leftHand && this.leftHand.stats && canGetBonusFromItemInHand(this.leftHand))
            addStatsForItem(this.leftHand);
        if (this.rightHand && this.rightHand.stats && canGetBonusFromItemInHand(this.rightHand))
            addStatsForItem(this.rightHand);
        this.hp.maximum = Math.max(1, this.getTotalStat('hp'));
        this.hp.__current = Math.min(this.hp.__current, this.hp.maximum);
        this.mp.maximum = Math.max(0, this.getTotalStat('mp'));
        this.mp.__current = Math.min(this.mp.__current, this.mp.maximum);
        if (this.totalStats.stealth > 0) {
            this.totalStats.stealth -= this.hidePenalty();
        }
        this.totalStats.perception += this.perceptionLevel();
    }
    itemCheck(item) {
        if (!item)
            return;
        if (item.itemClass === 'Corpse')
            return;
        if (item.binds && !item.owner) {
            item.setOwner(this);
            if (item.tellsBind) {
                this.sendClientMessageToRadius({
                    message: `${this.name} has looted ${item.desc}.`,
                    subClass: 'always loot'
                }, 4);
            }
            this.sendClientMessage(`The ${item.itemClass.toLowerCase()} feels momentarily warm to the touch as it molds to fit your grasp.`);
        }
    }
    setLeftHand(item, recalc = true) {
        this.leftHand = item;
        this.itemCheck(item);
        if (recalc) {
            this.recalculateStats();
        }
    }
    setRightHand(item, recalc = true) {
        this.rightHand = item;
        this.itemCheck(item);
        if (recalc) {
            this.recalculateStats();
        }
    }
    setPotionHand(item) {
        this.itemCheck(item);
        this.potionHand = item;
    }
    equip(item) {
        if (!this.canEquip(item))
            return false;
        const slot = this.getItemSlotToEquipIn(item);
        if (!slot)
            return false;
        this.gear[slot] = item;
        this.recalculateStats();
        this.itemCheck(item);
        return true;
    }
    checkCanEquipWithoutGearCheck(item) {
        if (!item.hasCondition())
            return false;
        if (!lodash_1.includes(item_1.EquippableItemClassesWithWeapons, item.itemClass))
            return false;
        if (item.requirements) {
            if (item.requirements.level && this.level < item.requirements.level)
                return false;
            if (item.requirements.class && !lodash_1.includes(item.requirements.class, this.baseClass))
                return false;
        }
        return true;
    }
    canEquip(item) {
        if (!item.isOwnedBy(this))
            return false;
        if (!this.checkCanEquipWithoutGearCheck(item))
            return false;
        const slot = this.getItemSlotToEquipIn(item);
        if (!slot || this.gear[slot])
            return false;
        return true;
    }
    unequip(slot) {
        this.gear[slot] = null;
        this.recalculateStats();
    }
    addItemToSack(item) {
        if (item.itemClass === 'Coin') {
            this.gainGold(item.value);
            return true;
        }
        const result = this.sack.addItem(item);
        if (result) {
            this.sendClientMessage(result);
            return false;
        }
        this.itemCheck(item);
        return true;
    }
    addItemToBelt(item) {
        const result = this.belt.addItem(item);
        if (result) {
            this.sendClientMessage(result);
            return false;
        }
        this.itemCheck(item);
        return true;
    }
    gainGold(gold) {
        if (gold <= 0)
            return;
        this.gold += gold;
    }
    loseGold(gold) {
        this.gold -= gold;
        if (this.gold <= 0)
            this.gold = 0;
    }
    getDirBasedOnDiff(x, y) {
        const checkX = Math.abs(x);
        const checkY = Math.abs(y);
        if (checkX >= checkY) {
            if (x > 0) {
                return 'East';
            }
            else if (x < 0) {
                return 'West';
            }
        }
        else if (checkY > checkX) {
            if (y > 0) {
                return 'South';
            }
            else if (y < 0) {
                return 'North';
            }
        }
        return 'South';
    }
    setDirBasedOnXYDiff(x, y) {
        if (x === 0 && y === 0)
            return;
        this.dir = this.getDirBasedOnDiff(x, y).substring(0, 1);
    }
    canSee(xOffset, yOffset) {
        if (!this.$fov)
            return false;
        if (!this.$fov[xOffset])
            return false;
        if (!this.$fov[xOffset][yOffset])
            return false;
        return true;
    }
    getXYFromDir(dir) {
        const checkDir = dir.toUpperCase();
        switch (checkDir) {
            case 'N': return { x: 0, y: -1 };
            case 'E': return { x: 1, y: 0 };
            case 'S': return { x: 0, y: 1 };
            case 'W': return { x: -1, y: 0 };
            case 'NW': return { x: -1, y: 1 };
            case 'NE': return { x: 1, y: 1 };
            case 'SW': return { x: -1, y: -1 };
            case 'SE': return { x: -1, y: 1 };
            default: return { x: 0, y: 0 };
        }
    }
    takeSequenceOfSteps(steps, isChasing = false) {
        const denseTiles = this.$$map.layers[maplayer_1.MapLayer.Walls].data;
        const denseObjects = this.$$map.layers[maplayer_1.MapLayer.DenseDecor].objects;
        const interactables = this.$$map.layers[maplayer_1.MapLayer.Interactables].objects;
        const denseCheck = denseObjects.concat(interactables);
        steps.forEach(step => {
            const nextTileLoc = ((this.y + step.y) * this.$$map.width) + (this.x + step.x);
            const nextTile = denseTiles[nextTileLoc];
            if (nextTile === 0) {
                const object = lodash_1.find(denseCheck, { x: (this.x + step.x) * 64, y: (this.y + step.y + 1) * 64 });
                if (object && object.density) {
                    return;
                }
            }
            else {
                return;
            }
            if (!isChasing && !this.isValidStep(step))
                return;
            this.x += step.x;
            this.y += step.y;
        });
        if (this.x < 0)
            this.x = 0;
        if (this.y < 0)
            this.y = 0;
        if (this.x > this.$$map.width)
            this.x = this.$$map.width;
        if (this.y > this.$$map.height)
            this.y = this.$$map.height;
        const potentialTrap = this.$$room.state.getInteractable(this.x, this.y, true, 'Trap');
        if (potentialTrap && potentialTrap.properties && potentialTrap.properties.effect) {
            this.$$room.state.removeInteractable(potentialTrap);
            this.$$room.castEffectFromTrap(this, potentialTrap);
        }
    }
    isValidStep(step) {
        return true;
    }
    isDead() {
        return this.hp.atMinimum();
    }
    changeBaseClass(newClass) {
        this.baseClass = newClass;
        Classes[this.baseClass].becomeClass(this);
    }
    kill(dead) { }
    flagSkill(skills) { }
    canDie() {
        return this.hp.atMinimum();
    }
    clearEffects() {
        this.effects.forEach(effect => this.unapplyEffect(effect, true));
        this.effects = [];
    }
    resetAdditionalStats() {
        this.additionalStats = {};
        this.recalculateStats();
    }
    die(killer) {
        this.dir = 'C';
        this.effects = [];
        this.$$deathTicks = 60 * 3;
    }
    restore(force = false) { }
    gainExp(xp) {
        if (this.isDead())
            return;
        this.exp += xp;
        if (this.exp <= 100) {
            this.exp = 100;
        }
        if (xp < 0) {
            do {
                const prevLevelXp = this.calcLevelXP(this.level);
                if (this.exp < prevLevelXp && this.level >= 2) {
                    this.level -= 1;
                }
                else {
                    break;
                }
            } while (true);
        }
    }
    gainExpFromKills(xp) {
        this.gainExp(xp);
    }
    tryLevelUp(maxLevel = 0) {
        do {
            if (this.level >= maxLevel)
                break;
            const neededXp = this.calcLevelXP(this.level + 1);
            if (this.exp > neededXp) {
                this.level += 1;
                if (this.level > this.highestLevel) {
                    this.highestLevel = this.level;
                    this.gainLevelStats();
                }
            }
            else {
                break;
            }
        } while (this.level < maxLevel);
    }
    gainLevelStats() {
        Classes[this.baseClass].gainLevelStats(this);
    }
    calcLevelXP(level) {
        if (level <= 20) {
            return Math.pow(2, level - 1) * 1000;
        }
        return 99999999999999999999999 * level;
    }
    isValidSkill(type) {
        return lodash_1.includes(item_1.ValidItemTypes, type);
    }
    gainSkill(type, skillGained = 1) {
        if (!this.isValidSkill(type) || !this.canGainSkill(type))
            return;
        this._gainSkill(type, skillGained);
    }
    _gainSkill(type, skillGained) {
        type = type.toLowerCase();
        this.skills[type] += skillGained;
        if (this.skills[type] <= 0 || isNaN(this.skills[type]))
            this.skills[type] = 0;
    }
    canGainSkill(type) {
        const curLevel = this.calcSkillLevel(type);
        return curLevel < this.$$room.state.maxSkill;
    }
    _calcSkillLevel(type) {
        const skillValue = this.skills[type.toLowerCase()] || 0;
        if (skillValue < 100)
            return 0;
        if (skillValue < 200)
            return 1;
        const value = Math.log(skillValue / 100) / Math.log(2);
        return 1 + Math.floor(value);
    }
    calcSkillLevel(type) {
        return this._calcSkillLevel(type);
    }
    calcSkillXP(level) {
        return Math.pow(2, level) * 100;
    }
    applyEffect(effect) {
        const existingEffect = this.hasEffect(effect.name);
        if (existingEffect) {
            this.unapplyEffect(effect, true);
        }
        if (effect.duration > 0 || (effect.effectInfo && effect.effectInfo.isPermanent)) {
            this.effects.push(effect);
        }
        effect.effectStart(this);
    }
    unapplyEffect(effect, prematurelyEnd = false) {
        if (prematurelyEnd) {
            effect.effectEnd(this);
        }
        this.effects = this.effects.filter(eff => eff.name !== effect.name);
    }
    hasEffect(effectName) {
        return lodash_1.find(this.effects, { name: effectName });
    }
    useItem(source) {
        const item = this[source];
        if (!item || !item.use(this))
            return;
        let remove = false;
        if (item.ounces === 0) {
            this.sendClientMessage('The bottle was empty.');
            remove = true;
        }
        else if (item.ounces > 0) {
            item.ounces--;
            if (item.ounces <= 0)
                remove = true;
        }
        if (remove) {
            this[source] = null;
            this.recalculateStats();
        }
    }
    sendClientMessage(message) { }
    sendClientMessageToRadius(message, radius = 0, except = []) {
        const sendMessage = lodash_1.isString(message) ? { message, subClass: 'chatter' } : message;
        this.$$room.state.getPlayersInRange(this, radius, except).forEach(p => {
            // outta range, generate a "you heard X in the Y dir" message
            if (radius > 4 && this.distFrom(p) > 5) {
                const dirFrom = this.getDirBasedOnDiff(this.x - p.x, this.y - p.y);
                sendMessage.dirFrom = dirFrom.toLowerCase();
                p.sendClientMessage(sendMessage);
            }
            else {
                p.sendClientMessage(sendMessage);
            }
        });
    }
    drawEffectInRadius(effectName, center, effectRadius = 0, drawRadius = 0) {
        this.$$room.state.getPlayersInRange(this, drawRadius).forEach(p => {
            p.$$room.drawEffect(p, { x: center.x, y: center.y }, effectName, effectRadius);
        });
    }
    isPlayer() {
        return false;
    }
    tick() {
        if (this.isDead()) {
            if (this.$$corpseRef && this.$$corpseRef.$heldBy) {
                const holder = this.$$room.state.findPlayer(this.$$corpseRef.$heldBy);
                this.x = holder.x;
                this.y = holder.y;
            }
            if (this.$$deathTicks > 0) {
                this.$$deathTicks--;
                if (this.$$deathTicks <= 0) {
                    this.restore(true);
                }
            }
            return;
        }
        const hpRegen = this.getTotalStat('hpregen');
        const mpRegen = this.getTotalStat('mpregen');
        this.hp.add(hpRegen);
        this.mp.add(mpRegen);
        this.effects.forEach(eff => eff.tick(this));
    }
    distFrom(point, vector) {
        let checkX = this.x;
        let checkY = this.y;
        if (vector) {
            checkX += vector.x || 0;
            checkY += vector.y || 0;
        }
        return Math.floor(Math.sqrt(Math.pow(point.x - checkX, 2) + Math.pow(point.y - checkY, 2)));
    }
    addAgro(char, value) {
        if (!char)
            return;
        this.agro[char.uuid] = this.agro[char.uuid] || 0;
        this.agro[char.uuid] += value;
        if (this.agro[char.uuid] <= 0)
            this.removeAgro(char);
    }
    removeAgro(char) {
        delete this.agro[char.uuid];
    }
    changeRep(allegiance, modifier) {
        this.allegianceReputation[allegiance] = this.allegianceReputation[allegiance] || 0;
        this.allegianceReputation[allegiance] += modifier;
    }
    receiveMessage(from, message) { }
    dropHands() {
        if (this.rightHand) {
            this.$$room.addItemToGround(this, this.rightHand);
            this.setRightHand(null);
        }
        if (this.leftHand) {
            this.$$room.addItemToGround(this, this.leftHand);
            this.setLeftHand(null);
        }
    }
    strip({ x, y }, spread = 0) {
        this.dropHands();
        this.sendClientMessage('You feel an overwhelming heat as your equipment disappears from your body!');
        const pickSlot = () => ({ x: lodash_1.random(x - spread, x + spread), y: lodash_1.random(y - spread, y + spread) });
        if (this.gold > 0) {
            const gold = new item_1.Item({
                name: 'Gold Coin',
                sprite: 212,
                value: this.gold,
                isBeltable: false,
                desc: 'gold coins'
            });
            this.$$room.addItemToGround(pickSlot(), gold);
            this.gold = 0;
        }
        Object.keys(this.gear).forEach(gearSlot => {
            const item = this.gear[gearSlot];
            if (!item)
                return;
            const point = pickSlot();
            this.$$room.addItemToGround(point, item);
            this.unequip(gearSlot);
        });
        for (let i = this.sack.allItems.length; i >= 0; i--) {
            const item = this.sack.takeItemFromSlot(i);
            if (!item)
                continue;
            const point = pickSlot();
            this.$$room.addItemToGround(point, item);
        }
        for (let i = this.belt.allItems.length; i >= 0; i--) {
            const item = this.belt.takeItemFromSlot(i);
            if (!item)
                continue;
            const point = pickSlot();
            this.$$room.addItemToGround(point, item);
        }
    }
    stealthLevel() {
        const isThief = this.baseClass === 'Thief';
        const thiefLevel = this.calcSkillLevel(exports.SkillClassNames.Thievery);
        const casterThiefSkill = thiefLevel * (isThief ? 1.5 : 1);
        const casterAgi = this.getTotalStat('agi') / (isThief ? 1.5 : 3);
        const casterLevel = this.level;
        const hideBoost = isThief ? Math.floor(thiefLevel / 5) * 10 : 0;
        const hideLevel = (casterThiefSkill + casterAgi + casterLevel + hideBoost);
        return Math.floor(hideLevel);
    }
    hidePenalty() {
        const leftHandClass = this.leftHand ? this.leftHand.itemClass : '';
        const rightHandClass = this.rightHand ? this.rightHand.itemClass : '';
        const reductionPercent = (hide_reductions_1.HideReductionPercents[leftHandClass] || 0) + (hide_reductions_1.HideReductionPercents[rightHandClass] || 0);
        const stealth = this.getTotalStat('stealth');
        return Math.floor(stealth * (reductionPercent / 100));
    }
    perceptionLevel() {
        const isThief = this.baseClass === 'Thief';
        const thiefLevel = this.calcSkillLevel(exports.SkillClassNames.Thievery);
        const dex = this.getTotalStat('dex');
        const casterLevel = this.level;
        const thiefTotal = (thiefLevel + dex) * (isThief ? 1.5 : 1);
        const normalTotal = casterLevel * 3;
        return Math.floor(thiefTotal + normalTotal);
    }
    canSeeThroughStealthOf(char) {
        // +1 so we don't zero out stealth on tile
        const distFactor = Math.floor(this.distFrom(char) + 1);
        const otherStealth = char.getTotalStat('stealth');
        const thiefMultPerTile = char.baseClass === 'Thief' ? 1.05 : 0.75;
        const totalStealth = Math.floor(distFactor * otherStealth * thiefMultPerTile);
        return this.getTotalStat('perception') >= totalStealth;
    }
    canHide() {
        if (this.hasEffect('Hidden'))
            return false;
        if (this.hp.ltePercent(90))
            return false;
        if (!this.isNearWall())
            return false;
        return true;
    }
    isNearWall() {
        for (let x = this.x - 1; x <= this.x + 1; x++) {
            for (let y = this.y - 1; y <= this.y + 1; y++) {
                const tile = this.$$room.state.checkIfDenseWall(x, y);
                if (tile)
                    return true;
            }
        }
        return false;
    }
}
exports.Character = Character;
//# sourceMappingURL=character.js.map