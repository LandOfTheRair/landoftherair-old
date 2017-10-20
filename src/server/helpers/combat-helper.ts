
import { includes, random, capitalize } from 'lodash';

import { Character, SkillClassNames, StatName } from '../../shared/models/character';
import { ShieldClasses, Item } from '../../shared/models/item';
import * as Classes from '../classes';
import * as Effects from '../effects';

import * as dice from 'dice.js';

export type DamageType =
  'Physical'
| 'Fire'
| 'Water'
| 'Energy';

export class CombatHelper {

  static attemptToShadowSwap(char: Character) {
    const shadowSwapLevel = char.getTraitLevel('ShadowSwap');
    if(shadowSwapLevel === 0) return;
    if(!char.isNearWall()) return;

    if(random(1, 100) > shadowSwapLevel * 2) return;

    const hidden = new Effects.Hidden({});
    char.sendClientMessage('You swap places with your shadow!');
    hidden.cast(char, char);
  }

  static attemptToStun(attacker: Character, weapon: Item, defender: Character) {
    if(!weapon.proneChance) return;
    if(random(1, 100) > weapon.proneChance) return;

    defender.sendClientMessageToRadius(`${defender.name} was knocked down!`, 5);
    defender.takeSequenceOfSteps([{ x: random(-1, 1), y: random(-1, 1) }], false, true);

    // low chance of cstun
    if(random(1, defender.getTotalStat('con')) > 3) return;

    const stun = new Effects.Stunned({});
    stun.cast(attacker, defender);
  }

  static isShield(item) {
    return includes(ShieldClasses, item.itemClass);
  }

  static resolveThrow(attacker, defender, hand, item) {
    if(item.returnsOnThrow) return;
    attacker[`set${capitalize(hand)}Hand`](null);

    if(item.itemClass === 'Bottle') {
      defender.sendClientMessageToRadius({
        message: `You hear the sound of glass shattering!`, subClass: 'combat' }, 5
      );

    } else {
      defender.$$room.addItemToGround(defender, item);
    }
  }

  static physicalAttack(attacker: Character, defender: Character, opts: any = {}) {
    this.doPhysicalAttack(attacker, defender, opts);

    if(attacker.leftHand && attacker.leftHand.offhand) {
      opts = opts || {};
      opts.isOffhand = true;
      this.doPhysicalAttack(attacker, defender, opts);
    }
  }

  private static doPhysicalAttack(attacker: Character, defender: Character, opts: any = {}) {
    const { isThrow, throwHand, isBackstab, isMug, attackRange, isOffhand } = opts;

    if(defender.isDead() || attacker.isDead()) return { isDead: true };

    attacker.combatTicks = 10;
    defender.combatTicks = 10;

    let attackerWeapon: Item;

    if(isThrow) {
      attackerWeapon = attacker[`${throwHand}Hand`];

    } else if(isOffhand) {
      attackerWeapon = attacker.leftHand;

    } else {
      attackerWeapon = attacker.rightHand
                    || attacker.gear.Hands
                    || { type: SkillClassNames.Martial, itemClass: 'Gloves', name: 'hands',
                         minDamage: 1, maxDamage: 1, baseDamage: 1,
                         isOwnedBy: () => true, hasCondition: () => true, loseCondition: (x, y) => {} };
    }

    const flagSkills = [];
    flagSkills[0] = attackerWeapon.type;
    if(attackerWeapon.secondaryType) flagSkills[1] = attackerWeapon.secondaryType;

    attacker.flagSkill(flagSkills);

    if(isThrow)    flagSkills[1] = SkillClassNames.Throwing;
    if(isBackstab) flagSkills[1] = SkillClassNames.Thievery;

    if(!attackerWeapon.isOwnedBy(attacker) || !attackerWeapon.hasCondition()) {
      if(!isThrow || (isThrow && attackerWeapon.returnsOnThrow)) {
        attacker.$$room.addItemToGround(attacker, attacker.rightHand);
        attacker.setRightHand(null);
      }

      attacker.sendClientMessage({ message: `Your hand feels a burning sensation!`, target: defender.uuid });
      return;
    }

    let defenderArmor = null;

    if(!defenderArmor && defender.gear.Robe2 && defender.gear.Robe2.hasCondition()) defenderArmor = defender.gear.Robe2;
    if(!defenderArmor && defender.gear.Robe1 && defender.gear.Robe1.hasCondition()) defenderArmor = defender.gear.Robe1;
    if(!defenderArmor && defender.gear.Armor && defender.gear.Armor.hasCondition()) defenderArmor = defender.gear.Armor;

    if(!defenderArmor) defenderArmor = { hasCondition: () => true,
                                         isOwnedBy: (x) => true,
                                         loseCondition: (x, y) => {},
                                         conditionACModifier: () => 0 };

    const defenderBlocker = defender.rightHand
                        || { type: SkillClassNames.Martial, itemClass: 'Gloves', name: 'hands', conditionACModifier: () => 0,
                             hasCondition: () => true, isOwnedBy: (x) => true, loseCondition: (x, y) => {} };

    const defenderShield = defender.leftHand && this.isShield(defender.leftHand)
                         ? defender.leftHand
                         : null;

    const offhandDivisor = isOffhand ? 3 : 1;

    // skill + 1 because skill 0 is awful
    const attackerScope = {
      skill: attacker.calcSkillLevel(isThrow ? SkillClassNames.Throwing : attackerWeapon.type) + 1,
      offense: Math.floor(attacker.getTotalStat('offense') / offhandDivisor),
      accuracy: Math.floor(attacker.getTotalStat('accuracy') / offhandDivisor),
      dex: Math.floor(attacker.getTotalStat('dex') / offhandDivisor),
      str: Math.floor(attacker.getTotalStat('str') / offhandDivisor),
      str4: Math.floor((attacker.getTotalStat('str') / 4) / offhandDivisor),
      multiplier: Classes[attacker.baseClass || 'Undecided'].combatDamageMultiplier,
      level: 1 + Math.floor(attacker.level / Classes[attacker.baseClass || 'Undecided'].combatLevelDivisor),
      damageMin: attackerWeapon.minDamage,
      damageMax: attackerWeapon.maxDamage,
      damageBase: attackerWeapon.baseDamage
    };

    const defenderACBoost = defenderArmor.conditionACModifier() + (defenderShield ? defenderShield.conditionACModifier() : 0);

    const defenderScope = {
      skill: defender.calcSkillLevel(defenderBlocker.type) + 1,
      defense: defender.getTotalStat('defense'),
      agi: defender.getTotalStat('agi'),
      dex: defender.getTotalStat('dex'),
      dex4: Math.floor(defender.getTotalStat('dex') / 4),
      armorClass: defender.getTotalStat('armorClass') + defenderACBoost,
      shieldAC: defenderShield ? defenderShield.stats.armorClass : 0,
      shieldDefense: defenderShield ? defenderShield.stats.defense || 0 : 0,
      level: 1 + Math.floor(defender.level / Classes[defender.baseClass || 'Undecided'].combatLevelDivisor)
    };

    const lostAtkCondition = 1 - (attacker.getTraitLevel('CarefulTouch') * 0.05);
    attackerWeapon.loseCondition(lostAtkCondition, () => attacker.recalculateStats());
    defender.addAgro(attacker, 1);

    // try to dodge
    const attackerDodgeBlockLeftSide = Math.floor(10 + attackerScope.skill + attackerScope.offense + attackerScope.accuracy);
    const attackerDodgeBlockRightSide = Math.floor(attackerScope.dex + attackerScope.level + attackerScope.skill);

    const defenderDodgeBlockLeftSide = Math.floor(1 + defenderScope.defense);
    const defenderDodgeRightSide = Math.floor(defenderScope.dex4 + defenderScope.agi + defenderScope.level);

    const attackerDodgeRoll = +dice.roll(`${attackerDodgeBlockLeftSide}d${attackerDodgeBlockRightSide}`);
    const defenderDodgeRoll = -+dice.roll(`${defenderDodgeBlockLeftSide}d${defenderDodgeRightSide}`);

    let attackDistance = attackRange ? attackRange : 0;
    const distBetween = attacker.distFrom(defender);

    if(isBackstab || isMug) {
      attackDistance = 0;
    }

    const dodgeRoll = random(defenderDodgeRoll, attackerDodgeRoll);

    if(dodgeRoll < 0 || attackDistance < distBetween) {
      attacker.sendClientMessage({ message: `You miss!`, subClass: 'combat self miss', target: defender.uuid });
      defender.sendClientMessage({ message: `${attacker.name} misses!`, subClass: 'combat other miss' });
      if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);
      return { dodge: true };
    }

    // try to block with armor
    const defenderBlockRightSide = Math.floor(defenderScope.level);

    const attackerACRoll = Math.max(1, +dice.roll(`${attackerDodgeBlockLeftSide}d${attackerDodgeBlockRightSide}`) - defenderScope.armorClass);
    const defenderACRoll = -+dice.roll(`${defenderDodgeBlockLeftSide}d${defenderBlockRightSide}`);

    const acRoll = random(defenderACRoll, attackerACRoll);
    if(acRoll < 0) {
      attacker.sendClientMessage({ message: `You were blocked by armor!`, subClass: 'combat self block armor', target: defender.uuid });
      defender.sendClientMessage({ message: `${attacker.name} was blocked by your armor!`, subClass: 'combat other block armor' });
      defenderArmor.loseCondition(1, () => defender.recalculateStats());
      if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);
      return { block: true, blockedBy: 'armor' };
    }

    // try to block with weapon
    const attackerWeaponShieldBlockRightSide = Math.floor(attackerScope.str4 + attackerScope.dex + attackerScope.skill);
    const defenderWeaponBlockLeftSide = 1;
    const defenderWeaponBlockRightSide = Math.floor(defenderScope.dex4 + defenderScope.skill);

    const attackerWeaponBlockRoll = +dice.roll(`${attackerDodgeBlockLeftSide}d${attackerWeaponShieldBlockRightSide}`);
    const defenderWeaponBlockRoll = -+dice.roll(`${defenderWeaponBlockLeftSide}d${defenderWeaponBlockRightSide}`);

    const weaponBlockRoll = random(attackerWeaponBlockRoll, defenderWeaponBlockRoll);
    if(weaponBlockRoll < 0 && defenderBlocker.isOwnedBy(defender) && defenderBlocker.hasCondition()) {
      const itemTypeToLower = defenderBlocker.itemClass.toLowerCase();
      attacker.sendClientMessage({ message: `You were blocked by a ${itemTypeToLower}!`, subClass: 'combat self block weapon', target: defender.uuid });
      defender.sendClientMessage({ message: `${attacker.name} was blocked by your ${itemTypeToLower}!`, subClass: 'combat other block weapon' });


      const lostCondition = 1 - (defender.getTraitLevel('CarefulTouch') * 0.05);
      defenderBlocker.loseCondition(lostCondition, () => defender.recalculateStats());
      if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);
      return { block: true, blockedBy: `a ${itemTypeToLower}` };
    }

    // try to block with shield
    if(defenderShield && defender.leftHand.isOwnedBy(defender) && defenderShield.hasCondition()) {
      const defenderShieldBlockLeftSide = Math.floor(1 + defenderScope.shieldDefense);
      const defenderShieldBlockRightSide = Math.floor(defenderScope.dex4 + defenderScope.skill);

      const attackerShieldBlockRoll = Math.max(1, +dice.roll(`${attackerDodgeBlockLeftSide}d${attackerWeaponShieldBlockRightSide}`) - defenderScope.shieldAC);
      const defenderShieldBlockRoll = -+dice.roll(`${defenderShieldBlockLeftSide}d${defenderShieldBlockRightSide}`);

      const shieldBlockRoll = random(attackerShieldBlockRoll, defenderShieldBlockRoll);
      if(shieldBlockRoll < 0) {
        const itemTypeToLower = defenderShield.itemClass.toLowerCase();
        attacker.sendClientMessage({ message: `You were blocked by a ${itemTypeToLower}!`, subClass: 'combat self block shield', target: defender.uuid });
        defender.sendClientMessage({ message: `${attacker.name} was blocked by your ${itemTypeToLower}!`, subClass: 'combat other block shield' });

        const lostCondition = 1 - (defender.getTraitLevel('CarefulTouch') * 0.05);
        defenderShield.loseCondition(lostCondition, () => defender.recalculateStats());
        if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);
        return { block: true, blockedBy: `a ${itemTypeToLower}` };
      }
    }

    const damageLeft = Math.floor(attackerScope.skill);
    const damageMax = random(attackerScope.damageMin, attackerScope.damageMax);
    const damageRight = Math.floor(attackerScope.str + attackerScope.level);

    let damage = Math.floor((+dice.roll(`${damageLeft}d${damageRight}`) + damageMax) * attackerScope.multiplier) + attackerScope.damageBase;

    if(isOffhand) {
      damage = Math.floor(damage / offhandDivisor);
    }

    if(isBackstab) {
      const thiefSkill = attacker.calcSkillLevel(SkillClassNames.Thievery);
      const bonusMultiplier = attacker.baseClass === 'Thief' ? 2 + Math.floor(thiefSkill / 5) : 1.5;
      damage = Math.floor(damage * bonusMultiplier);
    }

    if(isMug) {
      const thiefSkill = attacker.calcSkillLevel(SkillClassNames.Thievery);
      const reductionFactor = 1 - Math.max(
        0.5,
        0.9 - (attacker.baseClass === 'Thief' ? Math.floor(thiefSkill / 5) / 10 : 0)
      );
      damage = Math.floor(damage * reductionFactor);
    }

    let damageType = 'was a successful strike';

    if(attackerScope.damageMin !== attackerScope.damageMax) {
      if(attackerScope.damageMin === damageMax) damageType = 'was a grazing blow';
      if(attackerScope.damageMax === damageMax) damageType = 'left a grievous wound';
    }

    let msg = '';

    if(attacker.rightHand) {
      msg = `${attacker.name} hits with a ${attackerWeapon.itemClass.toLowerCase()}!`;
    } else if(attackerWeapon.itemClass === 'Claws') {
      msg = `${attacker.name} claws you!`;
    } else {
      msg = `${attacker.name} punches you!`;
    }

    damage = this.dealDamage(attacker, defender, {
      damage,
      damageClass: 'physical',
      attackerDamageMessage: `Your attack ${damageType}!`,
      defenderDamageMessage: msg
    });

    this.attemptToStun(attacker, attackerWeapon, defender);
    this.attemptToShadowSwap(attacker);

    if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);

    if(attackerWeapon.effect) {
      this.tryApplyEffect(attacker, defender, attackerWeapon.effect);
    }

    if(damage <= 0) {
      return { noDamage: true };
    }

    return { hit: true, damage, dealtBy: attackerWeapon.itemClass.toLowerCase(), damageType };
  }

  static tryApplyEffect(attacker, defender, effect) {
    const applyEffect = Effects[effect.name];
    if(!applyEffect) return;

    const chance = effect.chance || 100;
    if(+dice.roll('1d100') > chance) return;

    const appEffect = new applyEffect(effect);
    if(!appEffect.cast) return;

    appEffect.cast(attacker, defender);
  }

  static magicalAttack(attacker: Character, attacked: Character, { effect, skillRef, atkMsg, defMsg, damage, damageClass }: any = {}) {

    if(attacker) {
      attacker.combatTicks = 10;
    }

    attacked.combatTicks = 10;

    if(skillRef && attacker) {
      attacker.flagSkill(skillRef.flagSkills);
    }

    const willCheck = +dice.roll('1d500') <= attacked.getTotalStat('wil');

    if(willCheck) {
      const willDivisor = Classes[attacked.baseClass || 'Undecided'].willDivisor;
      damage -= Math.floor(damage / willDivisor);
    }

    this.dealDamage(attacker, attacked, { damage, damageClass, attackerDamageMessage: atkMsg, defenderDamageMessage: defMsg });
  }

  static dealOnesidedDamage(defender, { damage, damageClass, damageMessage, suppressIfNegative }) {
    if(defender.isDead()) return;

    const isHeal = damage < 0;

    if(!isHeal) {
      const damageReduced = defender.getTotalStat(`${damageClass}Resist`);
      damage -= damageReduced;

      // non-physical attacks are magical
      if(damageClass !== 'physical') {
        const magicReduction = defender.getTotalStat('magicalResist');
        damage -= magicReduction;
      }
    }

    if(!isHeal && damage < 0) damage = 0;

    defender.hp.sub(damage);

    if((damage <= 0 && !suppressIfNegative) || damage > 0) {
      defender.sendClientMessage({ message: `${damageMessage} [${damage} ${damageClass} damage]`, subClass: 'combat other hit' });
    }

    if(defender.isDead()) {
      defender.sendClientMessage({ message: `You died!`, subClass: 'combat other kill' });
      defender.die();
    }

    if(damage < 0) return 0;
  }

  static dealDamage(
    attacker: Character,
    defender: Character,
    { damage, damageClass, attackerDamageMessage, defenderDamageMessage }
  ) {

    if(defender.isDead() || (<any>defender).hostility === 'Never') return;

    const isHeal = damage < 0;

    if(attacker) {
      let damageBoostPercent = 0;

      switch(damageClass) {
        case 'energy':    damageBoostPercent = attacker.getTraitLevel('MagicFocus') * 5; break;
        case 'heal':      damageBoostPercent = attacker.getTraitLevel('HealingFocus') * 5; break;
        case 'physical':  damageBoostPercent = attacker.getTraitLevel('ForcefulStrike') * 5; break;
      }

      damage = Math.floor(damage * (1 + (damageBoostPercent / 100)));
    }

    // if not healing, check for damage resist
    if(!isHeal) {
      const damageReduced = defender.getTotalStat(<StatName>`${damageClass}Resist`);
      damage -= damageReduced;
      // non-physical attacks are magical
      if(damageClass !== 'physical') {
        const magicReduction = defender.getTotalStat('magicalResist');
        damage -= magicReduction;
      }

      if(damage < 0) damage = 0;

      if(damageReduced > 0 && damage !== 0 && attacker && attacker !== defender) {
        attacker.sendClientMessage({ message: `Your attack is mangled by a magical force!`, subClass: `combat self blocked`, target: defender.uuid });
      }

      if(attacker && attacker !== defender && damage === 0) {
        attacker.sendClientMessage({ message: `Your attack did no visible damage!`, subClass: `combat self blocked`, target: defender.uuid });
      }
    }

    const absDmg = Math.abs(damage);
    const dmgString = isHeal ? 'health' : `${damageClass} damage`;

    const otherClass = isHeal ? 'heal' : 'hit';
    const damageType = damageClass === 'physical' ? 'melee' : 'magic';

    if(attackerDamageMessage && (<any>attacker).username) {

      const secondaryClass = attacker !== defender ? 'self' : 'other';

      attacker.sendClientMessage({
        message: `${attackerDamageMessage} [${absDmg} ${dmgString}]`,
        subClass: `combat ${secondaryClass} ${otherClass} ${damageType}`,
        target: defender.uuid
      });
    }

    if(defenderDamageMessage && attacker !== defender) {
      defender.sendClientMessage({
        message: `${defenderDamageMessage} [${absDmg} ${dmgString}]`,
        subClass: `combat other ${otherClass} ${damageType}`
      });
    }

    defender.hp.sub(damage);

    const wasFatal = defender.isDead();

    if(!wasFatal) {
      if(defender !== attacker) {
        defender.addAgro(attacker, damage);
      }
    } else {
      if(attacker) {
        defender.sendClientMessageToRadius({
          message: `${defender.name} was killed by ${attacker.name}!`, subClass: 'combat self kill' }, 5, [defender.uuid]
        );
        defender.sendClientMessage({ message: `You were killed by ${attacker.name}!`, subClass: 'combat other kill' });
        defender.die(attacker);

        if((<any>attacker).uuid) {
          attacker.kill(defender);
        }

      } else {
        defender.sendClientMessageToRadius({ message: `${defender.name} was killed!`, subClass: 'combat self kill' }, 5, [defender.uuid]);
        defender.sendClientMessage({ message: `You were killed!`, subClass: 'combat other kill' });
        defender.die(attacker);
      }
    }

    return damage;

  }
}
