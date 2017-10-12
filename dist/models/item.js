"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const uuid = require("uuid/v4");
const character_1 = require("./character");
const Effects = require("../server/effects");
exports.ValidItemTypes = [
    'Mace', 'Axe', 'Dagger', 'Wand', 'Onehanded', 'Twohanded', 'Polearm', 'Ranged',
    'Martial', 'Staff', 'Restoration', 'Conjuration', 'Throwing', 'Thievery', 'Shortsword'
];
exports.WeaponClasses = [
    'Axe', 'Crossbow', 'Dagger', 'Club', 'Crossbow', 'Greataxe', 'Greatmace', 'Greatsword', 'Halberd', 'Longbow',
    'Longsword', 'Mace', 'Shield', 'Shortbow', 'Shortsword', 'Staff', 'Wand'
];
exports.ShieldClasses = [
    'Shield'
];
exports.ArmorClasses = [
    'Tunic', 'Breastplate', 'Fur'
];
exports.RobeClasses = [
    'Cloak', 'Robe'
];
exports.HeadClasses = [
    'Helm', 'Skull'
];
exports.NeckClasses = [
    'Amulet'
];
exports.WaistClasses = [
    'Sash'
];
exports.WristsClasses = [
    'Bracers'
];
exports.RingClasses = [
    'Ring'
];
exports.FeetClasses = [
    'Boots'
];
exports.HandsClasses = [
    'Gloves', 'Claws'
];
exports.EarClasses = [
    'Earring'
];
exports.EquipHash = {};
exports.ArmorClasses.forEach(t => exports.EquipHash[t] = 'Armor');
exports.RobeClasses.forEach(t => exports.EquipHash[t] = 'Robe');
exports.HeadClasses.forEach(t => exports.EquipHash[t] = 'Head');
exports.NeckClasses.forEach(t => exports.EquipHash[t] = 'Neck');
exports.WaistClasses.forEach(t => exports.EquipHash[t] = 'Waist');
exports.WristsClasses.forEach(t => exports.EquipHash[t] = 'Wrists');
exports.RingClasses.forEach(t => exports.EquipHash[t] = 'Ring');
exports.FeetClasses.forEach(t => exports.EquipHash[t] = 'Feet');
exports.HandsClasses.forEach(t => exports.EquipHash[t] = 'Hands');
exports.EarClasses.forEach(t => exports.EquipHash[t] = 'Ear');
exports.GivesBonusInHandItemClasses = exports.WeaponClasses.concat(exports.NeckClasses);
exports.EquippableItemClasses = exports.HeadClasses
    .concat(exports.NeckClasses)
    .concat(exports.WaistClasses)
    .concat(exports.WristsClasses)
    .concat(exports.RingClasses)
    .concat(exports.FeetClasses)
    .concat(exports.HandsClasses)
    .concat(exports.ArmorClasses)
    .concat(exports.RobeClasses)
    .concat(exports.EarClasses);
exports.EquippableItemClassesWithWeapons = exports.EquippableItemClasses
    .concat(exports.WeaponClasses);
class ItemRequirements {
}
exports.ItemRequirements = ItemRequirements;
class Item {
    constructor(opts) {
        this.baseDamage = 0;
        this.minDamage = 0;
        this.maxDamage = 0;
        this.ounces = 0;
        this.value = 0;
        this.stats = {};
        this.condition = 20000;
        this.type = 'Martial';
        this.twoHanded = false;
        this.isBeltable = false;
        this.isSackable = true;
        this.attackRange = 0;
        lodash_1.extend(this, opts);
        if (!this.uuid)
            this.uuid = uuid();
    }
    regenerateUUID() {
        this.uuid = uuid();
    }
    usesString() {
        if (!this.effect || !this.effect.uses || this.effect.uses < 0)
            return '';
        const uses = this.effect.uses;
        if (uses < 3)
            return 'looks brittle';
        if (uses < 9)
            return 'looks cracked';
        if (uses < 20)
            return 'looks normal';
        if (uses < 50)
            return 'looks energetic';
        if (uses < 100)
            return 'crackles with power';
        return 'is flawlessly vibrant';
        // the item <x>
    }
    conditionString() {
        if (this.condition <= 0)
            return 'broken';
        if (this.condition <= 5000)
            return 'tattered';
        if (this.condition <= 10000)
            return 'below average';
        if (this.condition <= 20000)
            return 'average';
        if (this.condition <= 30000)
            return 'above average';
        if (this.condition <= 40000)
            return 'mint';
        if (this.condition <= 50000)
            return 'above mint';
        return 'perfect';
    }
    conditionACModifier() {
        if (this.condition <= 0)
            return -3;
        if (this.condition <= 5000)
            return -2;
        if (this.condition <= 10000)
            return -1;
        if (this.condition <= 20000)
            return 0;
        if (this.condition <= 30000)
            return 1;
        if (this.condition <= 40000)
            return 2;
        if (this.condition <= 50000)
            return 3;
        return 4;
    }
    setOwner(player) {
        this.owner = player.uuid;
    }
    descTextFor(player, senseLevel = 0) {
        let ownedText = '';
        if (this.owner) {
            if (this.owner === player.username)
                ownedText = 'This item belongs to you. ';
            else
                ownedText = 'This item does NOT belong to you. ';
        }
        const fluidText = this.ounces > 0 ? `It is filled with ${this.ounces}oz of fluid. ` : '';
        let usesText = this.usesString();
        usesText = usesText ? `The item ${usesText}. ` : '';
        const sense1Text = senseLevel > 0 && this.extendedDesc ? `This item is ${this.extendedDesc}. ` : '';
        let sense1AfterText = '';
        if (senseLevel > 0 && (this.stats.offense > 0 || this.stats.defense > 0)) {
            sense1AfterText = `The combat adds are ${this.stats.offense || 0}/${this.stats.defense || 0}. `;
        }
        let sense2Text = '';
        if (senseLevel > 1 && this.effect && this.itemClass !== 'Bottle') {
            sense2Text = `This item has ${this.effect.uses ? 'castable' : 'on-contact'} ${this.effect.name}`;
            sense2Text = this.effect.potency ? `${sense2Text} with a potency of ${this.effect.potency}. ` : `${sense2Text}. `;
        }
        const levelText = this.requirements && this.requirements.level ? `You must be level ${this.requirements.level} to use this item. ` : '';
        const baseText = `You are looking at ${this.desc}. `;
        const conditionText = `The item is in ${this.conditionString()} condition. `;
        const canAppraise = player.baseClass === 'Thief' && player.calcSkillLevel(character_1.SkillClassNames.Thievery) >= 7;
        const appraiseText = canAppraise ? `The item is worth ${this.value} gold. ` : '';
        return `${baseText}${sense1Text}${sense1AfterText}${sense2Text}${usesText}${fluidText}${levelText}${conditionText}${ownedText}${appraiseText}`;
    }
    isRobe() {
        return exports.EquipHash[this.itemClass] === 'Robe';
    }
    isArmor() {
        return exports.EquipHash[this.itemClass] === 'Armor';
    }
    isOwnedBy(char) {
        return !this.owner || this.owner && char.username === this.owner;
    }
    hasCondition() {
        return this.condition > 0;
    }
    loseCondition(val = 1, onBreak = () => { }) {
        this.condition -= val;
        if (onBreak && this.condition <= 0)
            onBreak();
    }
    canUse(char) {
        return (this.effect || this.ounces > 0) && this.hasCondition() && this.isOwnedBy(char);
    }
    // < 0 means it lasts forever
    castAndTryBreak() {
        if (this.effect.uses < 0)
            return false;
        this.effect.uses--;
        return this.effect.uses === 0;
    }
    use(char) {
        if (!this.canUse(char))
            return false;
        if (this.effect && (lodash_1.isNumber(this.ounces) ? this.ounces > 0 : true)) {
            char.applyEffect(new Effects[this.effect.name](this.effect));
        }
        return true;
    }
    toJSON() {
        return lodash_1.omitBy(this, (value, key) => {
            if (!Object.getOwnPropertyDescriptor(this, key))
                return true;
            if (key === '_id' || key === '$heldBy')
                return true;
            return false;
        });
    }
}
exports.Item = Item;
//# sourceMappingURL=item.js.map