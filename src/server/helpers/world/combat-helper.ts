
import { includes, random, capitalize, get, clamp, cloneDeep, sample } from 'lodash';

import { Character, SkillClassNames, StatName } from '../../../shared/models/character';
import { ShieldClasses, Item, WeaponClasses, ItemEffect, HandsClasses, DamageType, AmmoClasses } from '../../../shared/models/item';
import * as Classes from '../../classes';
import * as Effects from '../../effects';

import { CharacterHelper } from '../character/character-helper';
import { NPC } from '../../../shared/models/npc';
import { BuildupEffect } from '../../base/Effect';
import { RollerHelper } from '../../../shared/helpers/roller-helper';
import { MessageHelper } from './message-helper';

export const BaseItemStatsPerTier = {
  Arrow:                { base: 1, min: 0, max: 2, weakChance: 25, damageBonus: 10 },
  Axe:                  { base: 2, min: 0, max: 2, weakChance: 10, damageBonus: 0 },
  Blunderbuss:          { base: 2, min: 0, max: 4, weakChance: 30, damageBonus: 0 },
  Broadsword:           { base: 2, min: 0, max: 2, weakChance: 5,  damageBonus: 5 },
  Claws:                { base: 3, min: 0, max: 1, weakChance: 10, damageBonus: 0 },
  Club:                 { base: 1, min: 0, max: 1, weakChance: 10, damageBonus: 5 },
  Crossbow:             { base: 0, min: 0, max: 3, weakChance: 10, damageBonus: 5 },
  Dagger:               { base: 2, min: 0, max: 1, weakChance: 1,  damageBonus: 10 },
  Flail:                { base: 0, min: 1, max: 4, weakChance: 10, damageBonus: 0 },
  Gloves:               { base: 2, min: 0, max: 2, weakChance: 10, damageBonus: 5 },
  Hands:                { base: 1, min: 0, max: 1, weakChance: 10, damageBonus: 5 },
  Boots:                { base: 2, min: 1, max: 3, weakChance: 10, damageBonus: 5 },
  Greataxe:             { base: 5, min: 1, max: 2, weakChance: 10, damageBonus: 5 },
  Greatmace:            { base: 5, min: 1, max: 2, weakChance: 10, damageBonus: 5 },
  Greatsword:           { base: 3, min: 1, max: 4, weakChance: 10, damageBonus: 5 },
  Halberd:              { base: 1, min: 0, max: 8, weakChance: 5,  damageBonus: 0 },
  Hammer:               { base: 1, min: 0, max: 1, weakChance: 20, damageBonus: 10 },
  Longbow:              { base: 4, min: 1, max: 3, weakChance: 10, damageBonus: 0 },
  Longsword:            { base: 2, min: 1, max: 2, weakChance: 15, damageBonus: 5 },
  Mace:                 { base: 2, min: 0, max: 2, weakChance: 10, damageBonus: 5 },
  Saucer:               { base: 0, min: 0, max: 0, weakChance: 10, damageBonus: 0 },
  Shield:               { base: 0, min: 0, max: 0, weakChance: 10, damageBonus: 0 },
  Shortbow:             { base: 3, min: 1, max: 2, weakChance: 10, damageBonus: 0 },
  Shortsword:           { base: 1, min: 1, max: 3, weakChance: 15, damageBonus: 5 },
  Spear:                { base: 1, min: 0, max: 3, weakChance: 10, damageBonus: 0 },
  Staff:                { base: 3, min: 0, max: 2, weakChance: 20, damageBonus: 0 },
  Totem:                { base: 1, min: 0, max: 1, weakChance: 30, damageBonus: 0 },
  Wand:                 { base: 1, min: 0, max: 1, weakChance: 30, damageBonus: 0 }
};

export class CombatHelper {

  static determineWeaponInformation(attacker: Character, item: Item, baseRolls = 0) {
    if(!BaseItemStatsPerTier[item.itemClass]) {
      return { damageRolls: 0, damageBonus: 0, isWeak: false, isStrong: false };
    }

    let itemClass = item.itemClass;
    let tier = item.tier || 0;

    if(itemClass === 'Wand' && attacker.getTraitLevel('BladedWands')) {
      itemClass = 'Longsword';
      tier += 3;
    }

    const { base, min, max, weakChance, damageBonus } = BaseItemStatsPerTier[itemClass];

    if(itemClass === 'Hands' || includes(HandsClasses, itemClass)) {
      tier += attacker.getTraitLevel('BrassKnuckles');
    }

    let damageRolls = baseRolls;
    const minTier = min * tier;
    const maxTier = max * tier;
    const baseTier = base * tier;

    // try to flub
    const didFlub = RollerHelper.XInOneHundred(weakChance * attacker.getTraitLevelAndUsageModifier('Swashbuckler'));

    const bonusRolls = didFlub ? minTier : random(minTier, maxTier);

    damageRolls += bonusRolls;

    // check if weak or strong hit
    const isWeak = min !== max && didFlub;
    const isStrong = min !== max && bonusRolls === maxTier;

    // add base tier damage if no flub
    if(!didFlub) damageRolls += baseTier;

    return { damageRolls, damageBonus: damageBonus * tier, isWeak, isStrong };
  }

  private static attemptToRiposte(attacker: Character, defender: Character) {
    const riposteLevel = defender.getTraitLevelAndUsageModifier('Riposte');
    if(riposteLevel === 0) return;
    if(!RollerHelper.XInOneHundred(riposteLevel)) return;

    this.doPhysicalAttack(defender, attacker, { isRiposte: true });
  }

  private static attemptToShadowSwap(char: Character) {
    if(char.hasEffect('Hidden') || char.hasEffect('Revealed')) return;

    const shadowSwapLevel = char.getTraitLevelAndUsageModifier('ShadowSwap');
    if(shadowSwapLevel === 0) return;
    if(!CharacterHelper.isNearWall(char)) return;

    if(!RollerHelper.XInOneHundred(shadowSwapLevel)) return;

    const hidden = new Effects.Hidden({});
    char.sendClientMessage('You swap places with your shadow!', true);
    hidden.cast(char, char);
  }

  private static attemptToStun(attacker: Character, weapon: Item, defender: Character) {

    const hasFleetOfFoot = defender.hasEffect('FleetOfFoot');
    const hasUnshakeable = defender.hasEffect('Unshakeable');

    // prone can happen randomly
    if(!hasFleetOfFoot && !hasUnshakeable && weapon.proneChance > 0 && RollerHelper.XInOneHundred(weapon.proneChance)) {
      const push = new Effects.Push({ potency: attacker.level });
      push.cast(attacker, defender);
    }

    let conMultiplier = 20;

    if(weapon.itemClass === SkillClassNames.Martial) {
      const multiplierLoss = attacker.getTraitLevelAndUsageModifier('StunningFist');
      conMultiplier -= multiplierLoss;
    }

    if(hasFleetOfFoot) {
      conMultiplier *= 2;
    }

    // low chance of cstun
    if(RollerHelper.OneInX(defender.getTotalStat('con') * conMultiplier)) {
      const stun = new Effects.Stun({ shouldNotShowMessage: true });
      stun.cast(attacker, defender);
    }
  }

  private static attemptToIncreaseResourceDrops(attacker: Character, defender: Character) {
    const curSkill = attacker.calcSkillLevel(SkillClassNames.Survival);
    const maxSkill = attacker.$$room.maxSkill;

    const diff = maxSkill - curSkill;
    const pctChance = diff <= 0 ? 50 : 50 - (Math.min(diff, 4) * 10);

    const sackItems = defender.sack.allItems;

    if(!RollerHelper.XInOneHundred(pctChance) || sackItems.length === 0) return;
    attacker.sendClientMessage('Your survival knowledge helped you find more items!', true);

    const randomItem = sample(sackItems);
    const copiedItem = attacker.$$room.itemCreator.duplicateItem(randomItem);
    defender.sack.addItem(copiedItem);
  }

  static isShield(item) {
    return includes(ShieldClasses, item.itemClass);
  }

  static resolveThrow(attacker, defender, hand, item: Item) {
    if(item.returnsOnThrow) return;

    const breakTypes = {
      Bottle: `You hear the sound of glass shattering!`,
      Trap: `You hear a mechanical snap and see parts fly all over!`
    };

    if(breakTypes[item.itemClass]) {
      attacker[`set${capitalize(hand)}Hand`](null);
      defender.sendClientMessageToRadius({ message: breakTypes[item.itemClass], subClass: 'combat' }, 5);

    } else if(item.shots) {
      item.shots--;
      if(item.shots <= 0) {
        attacker[`set${capitalize(hand)}Hand`](null);
      }

    } else {
      attacker[`set${capitalize(hand)}Hand`](null);
      defender.$$room.addItemToGround(defender, item);
    }
  }

  static physicalAttack(attacker: Character, defender: Character, opts: any = {}) {
    this.doPhysicalAttack(attacker, defender, opts);

    const shouldOffhandProcCheck = !opts.isThrow || (opts.isThrow && get(attacker.leftHand, 'returnsOnThrow'));

    if(shouldOffhandProcCheck && get(attacker.leftHand, 'offhand')) {
      opts = opts || {};
      opts.isOffhand = true;
      opts.throwHand = 'left';
      this.doPhysicalAttack(attacker, defender, opts);
    }

    attacker.setDirRelativeTo(defender);
  }

  private static calcDurabilityDamageDoneBasedOnDefender(item: Item, attacker: Character, defender: Character, baseDamage: number): number {
    if(!defender.isNaturalResource) return baseDamage;

    if(item.itemClass === 'Bottle') {
      attacker.sendClientMessage('Your bottle is in critical condition!', true);
      return item.condition;
    }

    attacker.sendClientMessage(`You strain your ${item.itemClass.toLowerCase()} from striking the ${defender.name}!`, true);

    let modifier = 1;
    /** PERK:CLASS:WARRIOR:Warriors take half weapon damage when gathering from gathering nodes. */
    const classMultiplier = attacker.baseClass === 'Warrior' ? 50 : 100;

    if(defender.isOreVein) {
      if(item.type !== 'Mace') modifier = 2;
    } else {
      if(item.type === 'Mace' || item.type === 'Staff' || item.itemClass === 'Gloves' || item.itemClass === 'Claws' || item.itemClass === 'Boots') modifier = 2;
    }

    return classMultiplier * baseDamage * modifier;
  }

  private static calcDamageDoneBasedOnDefender(item: Item, attacker: Character, defender: Character, baseDamage: number, criticality: number): number {
    if(!defender.isNaturalResource) return baseDamage;

    if(!includes(WeaponClasses, item.itemClass) && item.itemClass !== 'Gloves' && item.itemClass !== 'Claws' && item.itemClass !== 'Boots') return 0;

    if(defender.isOreVein) {
      if(item.type === 'Mace') criticality += 1;
    } else {
      if(item.type !== 'Mace' && item.type !== 'Staff' && item.itemClass !== 'Gloves' && item.itemClass !== 'Claws' && item.itemClass !== 'Boots') criticality += 1;
    }

    /** PERK:CLASS:WARRIOR:Warriors always do additional damage versus gathering nodes. */
    if(attacker.baseClass === 'Warrior') criticality += 1;

    return criticality;
  }

  private static doPhysicalAttack(attacker: Character, defender: Character, opts: any = {}) {
    const { isThrow, throwHand, isMug, isAssassinate, attackRange, isOffhand, isKick, isRiposte, damageMult } = opts;
    let { isPunch, isBackstab, accuracyLoss } = opts;

    if(!accuracyLoss) accuracyLoss = 0;

    let backstabIgnoreRange = false;

    if(!isRiposte && !isBackstab) {
      const procChance = attacker.getTraitLevelAndUsageModifier('ShadowDaggers');
      if(RollerHelper.XInOneHundred(procChance)) {
        attacker.sendClientMessage({
          message: `Your shadow daggers unsheathe themselves and attempt to strike ${defender.name}!`,
          subClass: 'combat self hit'
        }, true);
        isBackstab = true;
        backstabIgnoreRange = true;
      }
    }

    if(defender.isDead() || attacker.isDead()) return { isDead: true };

    attacker.setCombatTicks(10);
    defender.setCombatTicks(10);

    let isAttackerVisible = defender.canSeeThroughStealthOf(attacker);
    if(CharacterHelper.isInDarkness(defender) && !defender.hasEffect('DarkVision')) {
      isAttackerVisible = false;
    }

    if(!isAttackerVisible && defender.hasEffect('Debilitate')) {
      isBackstab = true;
    }

    let attackerWeapon: Item;

    if(isThrow) {
      attackerWeapon = attacker[`${throwHand}Hand`];

    } else if(isOffhand) {
      attackerWeapon = attacker.leftHand;

    } else if(isKick) {
      attackerWeapon = attacker.gear.Feet
                    || { type: SkillClassNames.Martial, itemClass: 'Boots', name: 'feet',
                         tier: 1,
                         canUseInCombat: () => true,
                         isOwnedBy: () => true, hasCondition: () => true, loseCondition: (x, y) => {} };

    } else {
      attackerWeapon = attacker.rightHand;

      if(isPunch || !attackerWeapon) {
        isPunch = true;
        attackerWeapon = attacker.gear.Hands
                    || { type: SkillClassNames.Martial, itemClass: 'Hands', name: 'hands',
                         tier: 1,
                         canUseInCombat: () => true,
                         isOwnedBy: () => true, hasCondition: () => true, loseCondition: (x, y) => {} };
      }
    }

    // flag appropriate skills based on attack
    const flagSkills = [];
    flagSkills.push(attackerWeapon.type);
    if(attackerWeapon.secondaryType)      flagSkills.push(attackerWeapon.secondaryType);
    if(isThrow)                           flagSkills.push(SkillClassNames.Throwing);
    if(!isAttackerVisible || isBackstab)  flagSkills.push(SkillClassNames.Thievery);

    attacker.flagSkill(flagSkills);

    let defenderArmor = null;

    if(!defenderArmor && defender.gear.Robe2 && defender.gear.Robe2.hasCondition()) defenderArmor = defender.gear.Robe2;
    if(!defenderArmor && defender.gear.Robe1 && defender.gear.Robe1.hasCondition()) defenderArmor = defender.gear.Robe1;
    if(!defenderArmor && defender.gear.Armor && defender.gear.Armor.hasCondition()) defenderArmor = defender.gear.Armor;

    if(!defenderArmor) defenderArmor = { hasCondition: () => true,
                                         isOwnedBy: (x) => true,
                                         loseCondition: (x, y) => {},
                                         conditionACModifier: () => 0 };

    const defenderBlocker = defender.rightHand
                        || { type: SkillClassNames.Martial, itemClass: 'Hands', name: 'hands', conditionACModifier: () => 0,
                             hasCondition: () => true, isOwnedBy: (x) => true, loseCondition: (x, y) => {} };

    const defenderShield = defender.leftHand && this.isShield(defender.leftHand)
                         ? defender.leftHand
                         : null;

    const defenderOffhand = defender.leftHand && defender.leftHand.offhand ? defender.leftHand : null;

    let offhandMultiplier = 1;
    if(isOffhand) {
      offhandMultiplier = 0.2 + attacker.getTraitLevelAndUsageModifier('OffhandFinesse');
    }

    const attackerName = isAttackerVisible ? attacker.name : 'somebody';
    let attackerDamageRolls = attacker.getTotalStat('weaponDamageRolls');

    // boost the base number of damage rolls by the tier of the arrow, if possible
    if(attackerWeapon.canShoot && attacker.leftHand && attacker.leftHand.shots) {
      attackerDamageRolls += attacker.leftHand.tier;
      attacker.leftHand.shots--;
      if(attacker.leftHand.shots <= 0) attacker.setLeftHand(null);
    }

    const { damageRolls, damageBonus, isWeak, isStrong } = this.determineWeaponInformation(attacker, attackerWeapon, attackerDamageRolls);

    // skill + 1 because skill 0 is awful
    const calcSkill = attacker.calcSkillLevel(isThrow ? SkillClassNames.Throwing : attackerWeapon.type) + 1;

    const damageCalcStat: StatName = isThrow || attackerWeapon.type === 'Ranged' ? 'dex' : 'str';

    let baseDamageCalcStat = attacker.getTotalStat(damageCalcStat);
    const strongMindMod = attacker.getTraitLevelAndUsageModifier('StrongMind');

    if(damageCalcStat === 'str' && strongMindMod > 0) {
      const attackerInt = attacker.getTotalStat('int');
      baseDamageCalcStat += Math.floor( attackerInt * strongMindMod);
    }

    let attackerSkillCalculated = calcSkill;
    if(attackerWeapon.secondaryType) {
      attackerSkillCalculated = Math.floor((attackerSkillCalculated + attacker.calcSkillLevel(attackerWeapon.secondaryType)) / 2);
    }

    const attackerScope = {
      skill: attackerSkillCalculated,
      skill4: Math.floor(attackerSkillCalculated / 4),
      offense: Math.floor(attacker.getTotalStat('offense') * offhandMultiplier),
      accuracy: Math.floor(attacker.getTotalStat('accuracy') * offhandMultiplier) - accuracyLoss,
      dex: Math.floor(attacker.getTotalStat('dex') * offhandMultiplier) + attacker.getTraitLevelAndUsageModifier('MartialAcuity'),
      damageStat: Math.floor(baseDamageCalcStat * offhandMultiplier),
      damageStat4: Math.floor((baseDamageCalcStat / 4) * offhandMultiplier),
      level: 1 + Math.floor(attacker.level / Classes[attacker.baseClass || 'Undecided'].combatLevelDivisor),
      realLevel: attacker.level,
      damageRolls: Math.max(1, damageRolls)
    };

    const defenderACBoost = defenderArmor.conditionACModifier() + (defenderShield ? defenderShield.conditionACModifier() : 0);

    const defenderScope = {
      skill: defender.calcSkillLevel(defenderBlocker.type) + 1,
      defense: defender.getTotalStat('defense'),
      agi: defender.getTotalStat('agi'),
      dex: defender.getTotalStat('dex'),
      dex4: Math.floor(defender.getTotalStat('dex') / 4),
      armorClass: defender.getTotalStat('armorClass') + defenderACBoost,
      weaponAC: get(defenderBlocker, 'stats.weaponArmorClass', 0),
      shieldAC: get(defenderShield, 'stats.armorClass', 0),
      shieldDefense: get(defenderShield, 'stats.defense', 0),
      offhandAC: get(defenderOffhand, 'stats.weaponArmorClass', 0),
      offhandDefense: get(defenderOffhand, 'stats.defense', 0),
      offhandSkill: defenderOffhand ? Math.floor(defender.calcSkillLevel(defenderOffhand.type) + 1) / 4 : 0,
      level: 1 + Math.floor(defender.level / Classes[defender.baseClass || 'Undecided'].combatLevelDivisor),
      realLevel: defender.level,
      riposteLevel: defender.getTraitLevel('Riposte'),
      mitigation: defender.getTotalStat('mitigation'),
      dodgeBonus: Math.floor((100 - get(defender.gear, 'Armor.stats.mitigation', 0)) / 10)
    };

    const fumbleMultiplier = attacker.isPlayer() ? 1 : 10;
    const fumbleRoll = Math.max(attackerScope.skill, 5)
                     * Math.max(attackerScope.realLevel, 5)
                     * Math.max(attackerScope.accuracy, 1)
                     * Math.max(attackerScope.offense, 1);

    let isFumble = RollerHelper.XInY(1, fumbleRoll * fumbleMultiplier);
    const failMsg = isFumble ? 'You fumble your weapon.' : 'You feel a burning sensation in your hands!';

    if(attacker.hasEffect('Dangerous')) isFumble = false;

    if(attacker.rightHand && (isFumble || !attackerWeapon.canUseInCombat(attacker))) {
      if(!isThrow || (isThrow && !attackerWeapon.returnsOnThrow)) {
        attacker.$$room.addItemToGround(attacker, attacker.rightHand);
        attacker.setRightHand(null);
      }

      attacker.sendClientMessage({ message: failMsg, target: defender.uuid }, true);
      return;
    }

    if(isPunch && attackerWeapon.itemClass !== 'Hands' && (isFumble || !attackerWeapon.canUseInCombat(attacker))) {
      attacker.$$room.addItemToGround(attacker, attackerWeapon);
      attacker.unequip('Hands');
      attacker.sendClientMessage({ message: failMsg, target: defender.uuid }, true);
      return;
    }

    const lostAtkCondition = 1 - (attacker.getTraitLevelAndUsageModifier('CarefulTouch'));
    const totalConditionDamageDone = this.calcDurabilityDamageDoneBasedOnDefender(attackerWeapon, attacker, defender, lostAtkCondition);
    attackerWeapon.loseCondition(totalConditionDamageDone, () => attacker.recalculateStats());
    defender.addAgro(attacker, 1);

    // try to dodge
    const attackerDodgeBlockLeftSide = Math.floor(10 + attackerScope.skill + attackerScope.offense);
    const attackerDodgeBlockRightSide = Math.floor(attackerScope.dex + attackerScope.skill);

    const defenderDodgeBlockLeftSide = Math.floor(1 + defenderScope.defense);
    const defenderDodgeRightSide = Math.floor(defenderScope.dex4 + defenderScope.agi + defenderScope.level + defenderScope.riposteLevel);

    const attackerDodgeRoll = RollerHelper.uniformRoll(attackerDodgeBlockLeftSide, attackerDodgeBlockRightSide) + attackerScope.accuracy;
    let defenderDodgeRoll = -RollerHelper.uniformRoll(defenderDodgeBlockLeftSide, defenderDodgeRightSide) + defenderScope.dodgeBonus;

    if(defender.isNaturalResource) defenderDodgeRoll = 0;

    let defenderDodgeMartialBonusMultiplier = 1;
    const defenderDodgeMartialLevel = defender.getTraitLevelAndUsageModifier('MartialAgility');

    if(defenderDodgeMartialLevel) {
      if(!defender.rightHand) defenderDodgeMartialBonusMultiplier += defenderDodgeMartialLevel;
      if(!defender.leftHand)  defenderDodgeMartialBonusMultiplier += defenderDodgeMartialLevel;
    }

    defenderDodgeRoll *= defenderDodgeMartialBonusMultiplier;

    let attackDistance = attackRange ? attackRange : 0;
    const distBetween = attacker.distFrom(defender);

    if((!backstabIgnoreRange && isBackstab) || isMug) {
      attackDistance = 0;
    }

    const dodgeRoll = random(defenderDodgeRoll, attackerDodgeRoll);

    if(dodgeRoll < 0 || attackDistance < distBetween) {
      if(!isRiposte) {
        if(distBetween === 0)  this.attemptToRiposte(attacker, defender);

        attacker.$$room.combatEffect(attacker, 'block-miss', defender.uuid);
        attacker.sendClientMessage({
          message: `You miss!`,
          subClass: 'combat self miss',
          sfx: 'combat-miss',
          target: defender.uuid,
          extraData: {
            type: 'miss',
            uuid: attacker.uuid,
            weapon: attackerWeapon.itemClass,
            damage: 0,
            monsterName: defender.name
          }
        }, true);

        defender.sendClientMessage({
          message: `${attackerName} misses!`, subClass: 'combat other miss',
          extraData: {
            type: 'miss',
            uuid: attacker.uuid,
            weapon: attackerWeapon.itemClass,
            damage: 0,
            monsterName: attacker.name
          }
        }, true);
      }
      if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);
      return { dodge: true };
    }

    // try to block with armor
    const defenderBlockRightSide = Math.floor(defenderScope.level + defenderScope.armorClass);

    const attackerACRoll = Math.max(1, RollerHelper.uniformRoll(attackerDodgeBlockLeftSide, attackerDodgeBlockRightSide) - defenderScope.armorClass);
    let defenderACRoll = -RollerHelper.uniformRoll(defenderDodgeBlockLeftSide, defenderBlockRightSide);

    if(defender.isNaturalResource) defenderACRoll = 0;

    const acRoll = random(defenderACRoll, attackerACRoll);
    if(acRoll < 0) {
      if(!isRiposte) {
        attacker.$$room.combatEffect(attacker, 'block-armor', defender.uuid);
        attacker.sendClientMessage({
          message: `You were blocked by armor!`,
          subClass: 'combat self block armor',
          sfx: 'combat-block-armor',
          target: defender.uuid,
          extraData: {
            type: 'block-armor',
            uuid: attacker.uuid,
            weapon: attackerWeapon.itemClass,
            damage: 0,
            monsterName: defender.name
          }
        }, true);

        defender.sendClientMessage({
          message: `${attackerName} was blocked by your armor!`,
          subClass: 'combat other block armor',
          extraData: {
            type: 'block-armor',
            uuid: attacker.uuid,
            weapon: attackerWeapon.itemClass,
            damage: 0,
            monsterName: attacker.name
          }
        }, true);
      }
      defenderArmor.loseCondition(1, () => defender.recalculateStats());
      if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);
      return { block: true, blockedBy: 'armor' };
    }

    // try to block with weapon
    const attackerWeaponShieldBlockRightSide = Math.floor(attackerScope.damageStat4 + attackerScope.dex + attackerScope.skill) - defenderScope.weaponAC;
    const defenderWeaponBlockLeftSide = 1;
    const defenderWeaponBlockRightSide = Math.floor(defenderScope.dex4 + defenderScope.skill);

    const attackerWeaponBlockRoll = RollerHelper.uniformRoll(attackerDodgeBlockLeftSide, attackerWeaponShieldBlockRightSide);
    let defenderWeaponBlockRoll = -RollerHelper.uniformRoll(defenderWeaponBlockLeftSide, defenderWeaponBlockRightSide);

    if(defender.isNaturalResource) defenderWeaponBlockRoll = 0;

    const weaponBlockRoll = random(defenderWeaponBlockRoll, attackerWeaponBlockRoll);
    if(weaponBlockRoll < 0 && defenderBlocker.isOwnedBy(defender) && defenderBlocker.hasCondition()) {
      const itemTypeToLower = defenderBlocker.itemClass.toLowerCase();

      if(!isRiposte) {
        if(distBetween === 0)  this.attemptToRiposte(attacker, defender);

        attacker.$$room.combatEffect(attacker, 'block-weapon', defender.uuid);

        attacker.sendClientMessage({
          message: `You were blocked by a ${itemTypeToLower}!`,
          subClass: 'combat self block weapon',
          sfx: 'combat-block-weapon',
          target: defender.uuid,
          extraData: {
            type: 'block-weapon',
            uuid: attacker.uuid,
            weapon: attackerWeapon.itemClass,
            damage: 0,
            monsterName: defender.name
          }
        }, true);

        defender.sendClientMessage({
          message: `${attackerName} was blocked by your ${itemTypeToLower}!`,
          subClass: 'combat other block weapon',
          extraData: {
            type: 'block-weapon',
            uuid: attacker.uuid,
            weapon: attackerWeapon.itemClass,
            damage: 0,
            monsterName: attacker.name
          }
        }, true);
      }

      const lostCondition = 1 - (defender.getTraitLevelAndUsageModifier('CarefulTouch'));
      defenderBlocker.loseCondition(lostCondition, () => defender.recalculateStats());
      if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);
      return { block: true, blockedBy: `a ${itemTypeToLower}` };
    }

    // try to block with shield
    if(defenderShield && defender.leftHand.isOwnedBy(defender) && defenderShield.hasCondition()) {
      const defenderShieldBlockLeftSide = Math.floor(1 + defenderScope.shieldDefense);
      const defenderShieldBlockRightSide = Math.floor(defenderScope.dex4 + defenderScope.skill);

      const attackerShieldBlockRoll = Math.max(1, RollerHelper.uniformRoll(attackerDodgeBlockLeftSide, attackerWeaponShieldBlockRightSide) - defenderScope.shieldAC);
      const defenderShieldBlockRoll = -RollerHelper.uniformRoll(defenderShieldBlockLeftSide, defenderShieldBlockRightSide);

      const shieldBlockRoll = random(attackerShieldBlockRoll, defenderShieldBlockRoll);
      if(shieldBlockRoll < 0) {
        const itemTypeToLower = defenderShield.itemClass.toLowerCase();

        if(!isRiposte) {
          if(distBetween === 0)  this.attemptToRiposte(attacker, defender);

          attacker.$$room.combatEffect(attacker, 'block-shield', defender.uuid);
          attacker.sendClientMessage({
            message: `You were blocked by a ${itemTypeToLower}!`,
            subClass: 'combat self block shield',
            sfx: 'combat-block-armor',
            target: defender.uuid,
            extraData: {
              type: 'block-shield',
              uuid: attacker.uuid,
              weapon: attackerWeapon.itemClass,
              damage: 0,
              monsterName: defender.name
            }
          }, true);

          defender.sendClientMessage({
            message: `${attackerName} was blocked by your ${itemTypeToLower}!`,
            subClass: 'combat other block shield',
            extraData: {
              type: 'block-shield',
              uuid: attacker.uuid,
              weapon: attackerWeapon.itemClass,
              damage: 0,
              monsterName: attacker.name
            }
          }, true);
        }

        const lostCondition = 1 - (defender.getTraitLevelAndUsageModifier('CarefulTouch'));
        defenderShield.loseCondition(lostCondition, () => defender.recalculateStats());
        if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);
        return { block: true, blockedBy: `a ${itemTypeToLower}` };
      }
    }

    // try to block with offhand weapon
    if(defenderOffhand && defender.leftHand.isOwnedBy(defender) && defenderOffhand.hasCondition()) {
      const defenderOffhandBlockLeftSide = Math.floor(1 + defenderScope.offhandDefense);
      const defenderOffhandBlockRightSide = Math.floor(defenderScope.dex4 + defenderScope.offhandSkill);

      const attackerOffhandBlockRoll = Math.max(1, RollerHelper.uniformRoll(attackerDodgeBlockLeftSide, attackerWeaponShieldBlockRightSide) - defenderScope.offhandAC);
      const defenderOffhandBlockRoll = -RollerHelper.uniformRoll(defenderOffhandBlockLeftSide, defenderOffhandBlockRightSide);

      const offhandBlockRoll = random(attackerOffhandBlockRoll, defenderOffhandBlockRoll);
      if(offhandBlockRoll < 0) {
        const itemTypeToLower = defenderOffhand.itemClass.toLowerCase();

        if(!isRiposte) {
          if(distBetween === 0)  this.attemptToRiposte(attacker, defender);

          attacker.$$room.combatEffect(attacker, 'block-offhand', defender.uuid);
          attacker.sendClientMessage({
            message: `You were blocked by a ${itemTypeToLower}!`,
            subClass: 'combat self block offhand',
            sfx: 'combat-block-weapon',
            target: defender.uuid,
            extraData: {
              type: 'block-offhand',
              uuid: attacker.uuid,
              weapon: attackerWeapon.itemClass,
              damage: 0,
              monsterName: defender.name
            }
          }, true);

          defender.sendClientMessage({
            message: `${attackerName} was blocked by your ${itemTypeToLower}!`,
            subClass: 'combat other block offhand',
            extraData: {
              type: 'block-offhand',
              uuid: attacker.uuid,
              weapon: attackerWeapon.itemClass,
              damage: 0,
              monsterName: attacker.name
            }
          }, true);
        }

        const lostCondition = 1 - (defender.getTraitLevelAndUsageModifier('CarefulTouch'));
        defenderOffhand.loseCondition(lostCondition, () => defender.recalculateStats());
        if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);
        return { block: true, blockedBy: `a ${itemTypeToLower}` };
      }
    }

    const damageLeft = attackerScope.damageRolls + attackerScope.skill4;
    const damageRight = Math.floor(attackerScope.damageStat + attackerScope.level + attackerScope.skill);
    const damageBoost = attacker.getTotalStat('physicalDamageBoost') + damageBonus;

    // thieves get +25% to the bottom damage range, warriors get +50%
    let damageRollMinimum = 1;

    /** PERK:CLASS:THIEF:Thieves always do at least 25% of their damage roll when rolling dice. */
    if(attacker.baseClass === 'Thief') damageRollMinimum = Math.floor(damageRight * 0.25);

    /** PERK:CLASS:WARRIOR:Warriors always do at least 50% of their damage roll when rolling dice. */
    if(attacker.baseClass === 'Warrior') damageRollMinimum = Math.floor(damageRight * 0.5);

    let damage = Math.floor(RollerHelper.diceRoll(damageLeft, damageRight, damageRollMinimum)) + damageBoost;

    if(isOffhand) {
      damage = Math.floor(damage * offhandMultiplier);
    }

    const thiefSkill = attacker.calcSkillLevel(SkillClassNames.Thievery);

    if(isAssassinate) {
      let didSucceed = true;
      const skillAvg = (thiefSkill + attackerScope.skill) / 2;

      if(skillAvg <= defender.getTotalStat('con')) didSucceed = false;
      if(attackerScope.realLevel < defenderScope.realLevel + 7) didSucceed = false;
      if(defender.hasEffect('Dangerous')) didSucceed = false;

      if(!didSucceed) {
        isBackstab = true;
      } else {
        damage = defender.hp.maximum;
      }
    }

    if(isBackstab) {
      let bonusMultiplier = 1.5;
      if(attacker.baseClass === 'Thief') {
        bonusMultiplier += attacker.getTraitLevelAndUsageModifier('BetterBackstab');
      }
      if(isAssassinate) bonusMultiplier *= 3;
      damage = Math.floor(damage * bonusMultiplier);
    }

    if(isMug) {
      /** PERK:CLASS:THIEF:Thieves do more damage when mugging. */
      const reductionFactor = 1 - Math.max(
        0.5,
        0.9 - (attacker.baseClass === 'Thief' ? Math.floor(thiefSkill / 5) / 10 : 0)
      );
      damage = Math.floor(damage * reductionFactor);
    }

    let msg = '';

    if(attacker.rightHand && !isKick && !isPunch) {
      msg = `${attackerName} hits with a ${attackerWeapon.itemClass.toLowerCase()}!`;

    } else if(isKick) {
      msg = `${attackerName} kicks you!`;

    } else if(attackerWeapon.itemClass === 'Claws') {
      msg = `${attackerName} claws you!`;

    } else {
      msg = `${attackerName} punches you!`;
    }

    if(damage > 0) {
      const levelDifferenceModifier = clamp(attackerScope.realLevel - defenderScope.realLevel, -10, 10) * 5;
      const mitigationModifier = Math.min(75, defenderScope.mitigation - (defenderScope.mitigation * (levelDifferenceModifier / 100)));
      const mitigatedDamage = Math.floor(damage * (mitigationModifier / 100));
      damage -= mitigatedDamage;
    }

    let damageType = 'was a successful strike';
    let criticality = 1;

    if(isWeak) {
      damageType = 'was a grazing blow';
      criticality = 0;
      attacker.$$room.combatEffect(attacker, 'hit-min', defender.uuid);

    } else if(isStrong) {
      damageType = 'left a grievous wound';
      criticality = 2;
      attacker.$$room.combatEffect(attacker, 'hit-max', defender.uuid);

    } else {
      attacker.$$room.combatEffect(attacker, 'hit-mid', defender.uuid);
    }

    if(damageMult) {
      damage = Math.floor(damage * damageMult);
    }

    damage = this.calcDamageDoneBasedOnDefender(attackerWeapon, attacker, defender, damage, criticality);

    let damageClass = attackerWeapon.damageClass || 'physical';
    if(attackerWeapon.canShoot && attacker.leftHand && attacker.leftHand.shots) {
      damageClass = attacker.leftHand.damageClass || 'physical';
    }

    damage = this.dealDamage(attacker, defender, {
      damage,
      damageClass,
      isMelee: true,
      attackerDamageMessage: damage > 0 ? `Your attack ${damageType}!` : '',
      defenderDamageMessage: msg,
      attackerWeapon,
      isRanged: damageCalcStat === 'dex',
      isWeak,
      isStrong,
      isAttackerVisible,
      isRiposte
    });

    this.attemptToStun(attacker, attackerWeapon, defender);
    this.attemptToShadowSwap(attacker);

    if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);

    let didEffect = false;

    if(attackerWeapon.canShoot && attacker.leftHand && attacker.leftHand.shots) {
      const encrustEffectAmmo = get(attacker.leftHand, 'encrust.stats.effect', null);

      // encrusted effect takes priority if it exists
      if(encrustEffectAmmo && !encrustEffectAmmo.autocast) {
        didEffect = this.tryApplyEffect(attacker, defender, encrustEffectAmmo, attacker.leftHand);

      } else if(attacker.leftHand.effect && !attacker.leftHand.effect.autocast) {
        const effect = cloneDeep(attacker.leftHand.effect);
        effect.potency += attackerScope.skill;
        didEffect = this.tryApplyEffect(attacker, defender, effect, attacker.leftHand);
      }
    }

    if(!didEffect) {
      const encrustEffect = get(attackerWeapon, 'encrust.stats.effect', null);

      // encrusted effect takes priority if it exists
      if(encrustEffect && !encrustEffect.autocast) {
        this.tryApplyEffect(attacker, defender, encrustEffect, attackerWeapon);

      } else if(attackerWeapon.effect && !attackerWeapon.effect.autocast) {
        const effect = cloneDeep(attackerWeapon.effect);
        effect.potency += attackerScope.skill;
        this.tryApplyEffect(attacker, defender, effect, attackerWeapon);
      }
    }

    if(damage <= 0) {
      return { noDamage: true };
    }

    attacker.gainCurrentSkills(1);

    return { hit: true, damage, dealtBy: attackerWeapon.itemClass.toLowerCase(), damageType };
  }

  static tryDamageReflect(attacker, defender, damage: number, damageClass) {
    const stat = damageClass === 'physical' ? 'physicalDamageReflect' : 'magicalDamageReflect';
    const damageReflectStat = defender.getTotalStat(<StatName>stat);

    const reflectedDamage = Math.min(damage, damageReflectStat);

    if(damage <= 0) return;

    this.dealOnesidedDamage(attacker, {
      damageClass: damageClass,
      damage: reflectedDamage,
      damageMessage: 'Some of the damage was reflected back at you!',
      suppressIfNegative: true
    });
  }

  static tryApplyEffect(attacker: Character, defender: Character, effect: ItemEffect, source?: Item): boolean {

    // non-weapons (like bottles) can't trigger effects
    if(source && !includes(WeaponClasses.concat(AmmoClasses), source.itemClass)) return false;

    const applyEffect = Effects[effect.name];
    if(!applyEffect) return false;

    const chance = effect.chance || 100;
    if(!RollerHelper.XInOneHundred(chance)) return false;

    const appEffect = new applyEffect(effect);
    if(!appEffect.cast) return;

    appEffect.potency = effect.potency || 0;

    appEffect.cast(attacker, defender, source);

    return true;
  }

  static magicalAttack(attacker: Character, attacked: Character, { effect, skillRef, atkMsg, defMsg, damage, damageClass, isOverTime, isAOE }: any = {}) {

    if(attacker) {
      attacker.setCombatTicks(10);
    }

    attacked.setCombatTicks(10);

    if(skillRef && attacker) {
      attacker.flagSkill(skillRef.flagSkills);
    }

    const willCheck = RollerHelper.XInY(attacked.getTotalStat('wil'), 500);

    if(willCheck && damage > 0) {
      const willDivisor = Classes[attacked.baseClass || 'Undecided'].willDivisor;
      damage -= Math.floor(damage / willDivisor);
    }

    if(attacker) {
      if(attacker.hasEffect('Encumbered')) {
        damage = Math.floor(damage / 2);
      }
    }

    damage = attacked.isNaturalResource ? 0 : damage;
    const totalDamage = this.dealDamage(attacker, attacked, {
      damage, damageClass, isOverTime, attackerDamageMessage: atkMsg, defenderDamageMessage: defMsg, attackerWeapon: {
        itemClass: effect ? effect.name : '???',
        owner: effect ? effect.effectInfo.caster : '???',
        ownerName: effect ? effect.effectInfo.casterName : '???'
      }
    });

    if(attacker && !attacker.isPlayer() && effect) {
      (<NPC>attacker).registerAttackDamage(attacked, effect.name, totalDamage);
    }

    if(attacker && !isOverTime && !isAOE) {
      attacker.$$room.combatEffect(attacker, `hit-${damage > 0 ? 'magic' : 'heal'}`, attacked.uuid);
    }
  }

  static dealOnesidedDamage(defender, { damage, damageClass, damageMessage, suppressIfNegative }) {
    if(!defender || defender.isDead()) return;

    const isHeal = damage < 0;

    if(!isHeal) {
      const damageReduced = defender.getTotalStat(`${damageClass}Resist`);
      damage -= damageReduced;

      // non-physical attacks are magical
      if(damageClass !== 'physical' && damageClass !== 'gm') {
        const magicReduction = defender.getTotalStat('magicalResist');
        damage -= magicReduction;
      }
    }

    if(!isHeal && damage < 0) damage = 0;

    defender.hp.sub(damage);

    if((damage <= 0 && !suppressIfNegative) || damage > 0) {
      defender.sendClientMessage({ message: `${damageMessage} [${damage} ${damageClass} damage]`, subClass: 'combat other hit' }, true);
    }

    if(defender.isDead()) {
      defender.sendClientMessage({ message: `You died!`, subClass: 'combat other kill', sfx: 'combat-die' }, true);
      defender.die();
    }

    if(damage < 0) return 0;
  }

  private static determineSfx({ attackerWeapon, isMelee }) {
    if(attackerWeapon && attackerWeapon.itemClass === 'Blunderbuss') return 'combat-special-blunderbuss';

    return isMelee ? 'combat-hit-melee' : 'combat-hit-spell';
  }

  static dealDamage(
    attacker: Character,
    defender: Character,
    { damage, damageClass, attackerDamageMessage, defenderDamageMessage, isOverTime, customSfx,
      attackerWeapon, isRanged, isAttackerVisible, isRiposte, isWeak, isMelee }: any
  ): number {

    if(defender.isDead() || (<any>defender).hostility === 'Never') return;

    const baseDamage = damage;

    const isHeal = damage < 0;

    if(attacker) {
      let damageBoostPercent = 0;

      switch(damageClass) {
        case 'energy':    damageBoostPercent = attacker.getTraitLevelAndUsageModifier('MagicFocus'); break;
        case 'necrotic':  damageBoostPercent = attacker.getTraitLevelAndUsageModifier('NecroticFocus'); break;
        case 'disease':   damageBoostPercent = attacker.getTraitLevelAndUsageModifier('NecroticFocus'); break;
        case 'poison':    damageBoostPercent = attacker.getTraitLevelAndUsageModifier('NecroticFocus'); break;
        case 'heal':      damageBoostPercent = attacker.getTraitLevelAndUsageModifier('HealingFocus'); break;
        case 'physical':  damageBoostPercent = attacker.getTraitLevelAndUsageModifier('ForcefulStrike'); break;
        case 'fire': {
          if(attacker.hasEffect('GlacierStance')) damageBoostPercent = -(40 + attacker.getTraitLevel('GlacierStanceImproved') * 10);
          if(attacker.hasEffect('VolcanoStance')) damageBoostPercent = (40 + attacker.getTraitLevel('VolcanoStanceImproved') * 10);
          break;
        }
        case 'ice': {
          if(attacker.hasEffect('VolcanoStance')) damageBoostPercent = -(40 + attacker.getTraitLevel('VolcanoStanceImproved') * 10);
          if(attacker.hasEffect('GlacierStance')) damageBoostPercent = (40 + attacker.getTraitLevel('GlacierStanceImproved') * 10);
          break;
        }
      }

      if(isMelee && !isAttackerVisible && defender.hasEffect('BuildupSneakAttack')) {
        damageBoostPercent = 25 + attacker.getTraitLevelAndUsageModifier('ShadowRanger');
      }

      damage = Math.floor(damage * (1 + (damageBoostPercent / 100)));

      if(!isMelee) {
        damage += attacker.getTotalStat('magicalDamageBoost');
      }
    }

    const baseDamageWithModifiers = damage;
    let mitigatedPercent = 0;

    // if not healing, check for damage resist
    if(!isHeal) {
      const damageReduced = defender.getTotalStat(<StatName>`${damageClass}Resist`);
      damage -= damageReduced;
      // non-physical attacks are magical
      if(!isMelee) {
        const magicReduction = defender.getTotalStat('magicalResist');
        damage -= magicReduction;
      }

      if(defender) {
        defender.attributeEffectsList.forEach(eff => {
          damage = eff.modifyDamage(attacker, defender, { attackerWeapon, damage, damageClass });
        });
      }

      mitigatedPercent = (damage / baseDamageWithModifiers);

      if(damage < 0) damage = 0;

      if(!isRiposte) {
        if(damageReduced > 0 && damage !== 0 && attacker && attacker !== defender) {
          attacker.sendClientMessage({
            message: `Your attack is mangled by a magical force!`,
            subClass: `combat self blocked`,
            target: defender.uuid,
            extraData: {
              type: 'hit-physical',
              uuid: attacker ? attacker.uuid : get(attackerWeapon, 'owner', '???'),
              weapon: attackerWeapon ? attackerWeapon.itemClass : '???',
              damage,
              monsterName: defender.name
            }
          }, true);
        }

        if(attacker && attacker !== defender && damage === 0) {
          attacker.sendClientMessage({
            message: `Your attack did no visible damage!`,
            subClass: `combat self blocked`,
            target: defender.uuid,
            extraData: {
              type: 'hit-physical',
              uuid: attacker ? attacker.uuid : get(attackerWeapon, 'owner', '???'),
              weapon: attackerWeapon ? attackerWeapon.itemClass : '???',
              damage: 0,
              monsterName: defender.name
            }
          }, true);
        }
      }

    // if healing, add some boost
    } else {
      if(attacker) {
        damage -= attacker.getTotalStat('healingBoost');
      }
    }

    this.doElementalDebuffing(attacker, defender, damageClass, damage, { isRanged, isAttackerVisible, mitigatedPercent });

    if(defender.isNaturalResource) damage = baseDamage;

    if(isWeak && RollerHelper.XInOneHundred(defender.getTraitLevelAndUsageModifier('SterlingArmor'))) damage = 0;

    const absDmg = Math.round(Math.abs(damage));
    const dmgString = isHeal ? 'health' : `${damageClass} damage`;

    const otherClass = isHeal ? 'heal' : 'hit';
    const damageType = isMelee ? 'melee' : 'magic';

    if(attackerDamageMessage && attacker) {

      const secondaryClass = attacker !== defender ? 'self' : 'other';

      const formattedAtkMessage = MessageHelper.formatMessageFor(attacker, attackerDamageMessage, [defender]);

      attacker.sendClientMessage({
        message: `${isRiposte ? 'You riposte the attack!' : formattedAtkMessage} [${absDmg} ${dmgString}]`,
        subClass: `combat ${secondaryClass} ${otherClass} ${damageType} ${isOverTime ? 'out-overtime' : ''}`,
        target: defender.uuid,
        sfx: customSfx || CombatHelper.determineSfx({ attackerWeapon, isMelee }),
        extraData: {
          type: 'damage',
          uuid: attacker ? attacker.uuid : get(attackerWeapon, 'owner', '???'),
          weapon: attackerWeapon ? attackerWeapon.itemClass : '???',
          damage,
          monsterName: defender.name
        }
      }, true);
    }

    if(defenderDamageMessage && defender && attacker !== defender) {

      const formattedDefMessage = MessageHelper.formatMessageFor(defender, defenderDamageMessage, [attacker]);

      defender.sendClientMessage({
        message: `${isRiposte ? 'Your attack was riposted!' : formattedDefMessage} [${absDmg} ${dmgString}]`,
        subClass: `combat other ${otherClass} ${damageType} ${isOverTime ? 'in-overtime' : ''}`,
        extraData: {
          type: 'damage',
          uuid: attacker ? attacker.uuid : get(attackerWeapon, 'owner', '???'),
          weapon: attackerWeapon ? attackerWeapon.itemClass : '???',
          damage,
          monsterName: attacker ? attacker.name : get(attackerWeapon, 'ownerName', '???')
        }
      }, true);
    }

    if(attacker) {
      attacker.augmentEffectsList.forEach(eff => eff.augmentAttack(attacker, defender, {
        damage, damageClass
      }));
    }

    if(defender) {
      defender.onHitEffectsList.forEach(eff => eff.onHit(attacker, defender, {
        damage, damageClass
      }));
    }

    if(isNaN(damage)) damage = 0;

    damage = Math.floor(damage);
    defender.hp.sub(damage);

    if(isNaN(defender.hp.total)) {
      defender.hp.set(1);
    }

    if(defender.$$ai) defender.$$ai.damageTaken.dispatch({ damage, attacker });


    defender.addAgro(attacker, damage);
    if(attacker) attacker.addAgro(defender, damage);

    const wasFatal = defender.isDead();

    if(wasFatal) {
      if(attacker) {
        const killMethod = defender.isNaturalResource ? 'smashed' : 'killed';
        defender.sendClientMessageToRadius({
            message: `%0 was ${killMethod} by %1!`,
            subClass: `combat notme kill ${defender.isPlayer() ? 'player' : 'npc'}`,
            sfx: defender.isPlayer() ? 'combat-die' : 'combat-kill'
          },
          5,
          [defender.uuid, attacker.uuid],
          true,
          [defender, attacker],
          true
        );

        const formattedAtkMessage = MessageHelper.formatMessageFor(attacker, `You ${killMethod} %0!`, [defender]);
        attacker.sendClientMessage({
          message: formattedAtkMessage,
          subClass: `combat self kill ${defender.isPlayer() ? 'player' : 'npc'}`,
          sfx: defender.isPlayer() ? 'combat-die' : 'combat-kill'
        }, true);

        const formattedDefMessage = MessageHelper.formatMessageFor(defender, `You were killed by %0!`, [attacker]);
        defender.sendClientMessage({ message: formattedDefMessage, subClass: 'combat other kill', sfx: 'combat-die' }, true);

        if((<any>attacker).uuid) {
          attacker.kill(defender);
        }

        defender.die(attacker);

        if(defender.isNaturalResource) {
          attacker.gainSkill(SkillClassNames.Survival, attacker.$$room.maxSkill);
          this.attemptToIncreaseResourceDrops(attacker, defender);
        }

      } else {
        defender.sendClientMessageToRadius({ message: `${defender.name} was killed!`, subClass: 'combat self kill' }, 5, [defender.uuid], true);
        defender.sendClientMessage({ message: `You were killed!`, subClass: 'combat other kill', sfx: 'combat-die' }, true);
        defender.die(attacker);
      }
    }

    this.tryDamageReflect(attacker, defender, damage, damageClass);

    return damage;

  }

  private static elementalBoostValue(attacker: Character, debuffName): number {
    if(!attacker) return 0;

    switch(debuffName) {
      case 'BuildupHeat':           return attacker.getTraitLevelAndUsageModifier('ForgedFire') * 3;
      case 'BuildupChill':          return attacker.getTraitLevelAndUsageModifier('FrostedTouch') * 3;
      case 'BuildupSneakAttack':    return -Math.min(5, attacker.getTraitLevel('ShadowRanger'));
    }

    return 0;
  }

  private static elementalDecayRateValue(attacker: Character, debuffName: string): number {
    if(!attacker) return 0;

    switch(debuffName) {
      case 'BuildupHeat':           return attacker.getTraitLevelAndUsageModifier('ForgedFire');
      case 'BuildupChill':          return attacker.getTraitLevelAndUsageModifier('FrostedTouch');
      case 'BuildupSneakAttack':    return -Math.min(5, attacker.getTraitLevel('ShadowRanger'));
    }

    return 0;
  }

  private static getElementalDebuff(damageClass: DamageType,
                                    extraData: { attacker: Character, defender: Character, isRanged: boolean, isAttackerVisible: boolean }): string[] {

    const lowerDamageClass = damageClass.toLowerCase();

    const atk = extraData.attacker;
    const def = extraData.defender;

    if(atk && def && lowerDamageClass === 'physical') {
      /** PERK:CLASS:THIEF:Thieves can build up sneak attack damage while hidden. */
      if(atk.baseClass === 'Thief' && !extraData.isAttackerVisible) {
        return ['BuildupSneakAttack', 'DefensesShattered', 'RecentlyShattered'];
      }
    }

    switch(lowerDamageClass) {
      case 'fire': return ['BuildupHeat', 'Burning', 'RecentlyBurned'];
      case 'ice': return ['BuildupChill', 'Frosted', 'RecentlyFrosted'];
    }

    return [];
  }

  private static doElementalDebuffing(attacker: Character, defender: Character, damageClass: DamageType, damage: number,
                                      { isRanged, isAttackerVisible, mitigatedPercent }: any = {}) {
    if(!attacker || damage <= 0) return;

    const [debuff, activeDebuff, recentDebuff] = this.getElementalDebuff(damageClass, { attacker, defender, isRanged, isAttackerVisible });
    if(!debuff) return;

    if(defender.hasEffect(activeDebuff) || defender.hasEffect(recentDebuff)) return;

    let targetEffect = <BuildupEffect>defender.hasEffect(debuff);
    const bonusIncrease = this.elementalBoostValue(attacker, debuff);
    let debuffIncrease = Math.max(5, 25 + bonusIncrease);

    // if thief and offhand weapon, do ~half boost for each hand
    if(debuff === 'BuildupSneakAttack' && get(attacker, 'leftHand.offhand')) {
      debuffIncrease /= 1.75;
    }

    mitigatedPercent = mitigatedPercent || 0;
    debuffIncrease = Math.floor(debuffIncrease * mitigatedPercent);

    if(!targetEffect) {
      const buildupMax = 200 + (10 * defender.level);

      targetEffect = new Effects[debuff]({});
      targetEffect.buildupMax = buildupMax;
      targetEffect.buildupCur = bonusIncrease;
      targetEffect.decayRate -= this.elementalDecayRateValue(attacker, debuff);
      targetEffect.cast(attacker, defender);
    }

    if(debuffIncrease + targetEffect.buildupCur <= 0) targetEffect.buildupCur = Math.abs(debuffIncrease);

    targetEffect.buildupCur += debuffIncrease;
    targetEffect.buildupDamage += damage;
  }
}

