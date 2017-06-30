
import { includes, random, capitalize } from 'lodash';

import { Character, SkillClassNames } from '../../models/character';
import { ShieldClasses, Item } from '../../models/item';
import * as Classes from '../classes';
import * as Effects from '../effects';

import * as dice from 'dice.js';
import { Logger } from '../logger';

export type DamageType =
  'Physical'
| 'Fire'
| 'Water'
| 'Energy';

export class CombatHelper {

  static isShield(item) {
    return includes(ShieldClasses, item.itemClass);
  }

  static resolveThrow(attacker, defender, hand, item) {
    if(item.returnsOnThrow) return;
    attacker[`set${capitalize(hand)}Hand`](null);
    defender.$$room.addItemToGround(defender, item);
  }

  static physicalAttack(attacker: Character, defender: Character, opts: any = {}) {

    const { isThrow, throwHand } = opts;

    if(defender.isDead() || attacker.isDead()) return { isDead: true };

    let attackerWeapon: Item;

    if(isThrow) {
      attackerWeapon = attacker[`${throwHand}Hand`];

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

    if(isThrow) flagSkills[1] = SkillClassNames.Throwing;

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

    if(!defenderArmor) defenderArmor = { hasCondition: () => true, isOwnedBy: (x) => true, loseCondition: (x, y) => {} };

    const defenderBlocker = defender.rightHand
                        || { type: SkillClassNames.Martial, itemClass: 'Gloves', name: 'hands',
                             hasCondition: () => true, isOwnedBy: (x) => true, loseCondition: (x, y) => {} };

    const defenderShield = defender.leftHand && this.isShield(defender.leftHand)
                         ? defender.leftHand
                         : null;

    const attackerScope = {
      skill: attacker.calcSkillLevel(isThrow ? SkillClassNames.Throwing : attackerWeapon.type),
      offense: attacker.getTotalStat('offense'),
      accuracy: attacker.getTotalStat('accuracy'),
      dex: attacker.getTotalStat('dex'),
      str: attacker.getTotalStat('str'),
      str4: Math.floor(attacker.getTotalStat('str') / 4),
      divisor: Classes[attacker.baseClass || 'Undecided'].combatDivisor,
      level: 1 + Math.floor(attacker.level / Classes[attacker.baseClass || 'Undecided'].combatDivisor),
      damageMin: attackerWeapon.minDamage,
      damageMax: attackerWeapon.maxDamage,
      damageBase: attackerWeapon.baseDamage
    };

    const defenderScope = {
      skill: defender.calcSkillLevel(defenderBlocker.type),
      defense: defender.getTotalStat('defense'),
      agi: defender.getTotalStat('agi'),
      dex: defender.getTotalStat('dex'),
      dex4: Math.floor(defender.getTotalStat('dex') / 4),
      armorClass: defender.getTotalStat('armorClass'),
      shieldAC: defenderShield ? defenderShield.stats.armorClass : 0,
      shieldDefense: defenderShield ? defenderShield.stats.defense || 0 : 0,
      level: 1 + Math.floor(defender.level / Classes[defender.baseClass || 'Undecided'].combatDivisor)
    };

    attackerWeapon.loseCondition(1, () => attacker.recalculateStats());
    defender.addAgro(attacker, 1);

    // try to dodge
    const attackerDodgeBlockLeftSide = Math.floor(10 + attackerScope.skill + attackerScope.offense + attackerScope.accuracy);
    const attackerDodgeBlockRightSide = Math.floor(attackerScope.dex + attackerScope.level + attackerScope.skill);

    const defenderDodgeBlockLeftSide = Math.floor(1 + defenderScope.defense);
    const defenderDodgeRightSide = Math.floor(defenderScope.dex4 + defenderScope.agi + defenderScope.level);

    const attackerDodgeRoll = +dice.roll(`${attackerDodgeBlockLeftSide}d${attackerDodgeBlockRightSide}`);
    const defenderDodgeRoll = -+dice.roll(`${defenderDodgeBlockLeftSide}d${defenderDodgeRightSide}`);

    const dodgeRoll = random(defenderDodgeRoll, attackerDodgeRoll);
    if(dodgeRoll < 0) {
      attacker.sendClientMessage({ message: `You miss!`, subClass: 'combat self miss', target: defender.uuid });
      defender.sendClientMessage({ message: `${attacker.name} misses!`, subClass: 'combat other miss' });
      if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);
      return { dodge: true };
    }

    // try to block with armor
    const defenderBlockRightSide = Math.floor(defenderScope.level);

    const attackerACRoll = Math.max(1, +dice.roll(`${attackerDodgeBlockLeftSide}d${attackerDodgeBlockRightSide}`) - defenderScope.armorClass);
    const defenderACRoll = -+dice.roll(`${defenderDodgeBlockLeftSide}d${defenderBlockRightSide}`);

    const acRoll = random(attackerACRoll, defenderACRoll);
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
      defenderBlocker.loseCondition(1, () => defender.recalculateStats());
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
        defenderShield.loseCondition(1, () => defender.recalculateStats());
        if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);
        return { block: true, blockedBy: `a ${itemTypeToLower}` };
      }
    }

    const damageLeft = Math.floor(attackerScope.skill);
    const damageMax = random(attackerScope.damageMin, attackerScope.damageMax);
    const damageRight = Math.floor(attackerScope.str + attackerScope.level + damageMax);

    let damage = Math.floor(+dice.roll(`${damageLeft}d${damageRight}`) / attackerScope.divisor) + attackerScope.damageBase;

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

    if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);

    if(attackerWeapon.effect) {
      const applyEffect = Effects[attackerWeapon.effect.name];

      if(!applyEffect) {
        Logger.error(new Error(`Effect ${attackerWeapon.effect.name} does not exist.`));
      } else {

        const chance = attackerWeapon.effect.chance || 100;
        if(+dice.roll('1d100') <= chance) {
          const effect = new applyEffect(attackerWeapon.effect);
          effect.cast(attacker, defender);
        }
      }
    }

    if(damage <= 0) {
      return { noDamage: true };
    }

    return { damage, dealtBy: attackerWeapon.itemClass.toLowerCase(), damageType };
  }

  static magicalAttack(attacker: Character, attacked: Character, { effect, skillRef, atkMsg, defMsg, damage, damageClass }: any = {}) {

    if(skillRef) {
      attacker.flagSkill(skillRef.flagSkills);
    }

    const willCheck = +dice.roll('1d500') <= attacked.getTotalStat('wil');

    if(willCheck) {
      const willDivisor = Classes[attacked.baseClass || 'Undecided'].willDivisor;
      damage -= Math.floor(damage / willDivisor);
    }

    this.dealDamage(attacker, attacked, { damage, damageClass, attackerDamageMessage: atkMsg, defenderDamageMessage: defMsg });
  }

  static dealOnesidedDamage(defender, { damage, damageClass, damageMessage }) {
    if(defender.isDead()) return;

    const damageReduced = defender.getTotalStat(`${damageClass}Resist`);
    damage -= damageReduced;

    // non-physical attacks are magical
    if(damageClass !== 'physical') {
      const magicReduction = defender.getTotalStat('magicalResist');
      damage -= magicReduction;
    }

    defender.hp.sub(damage);

    defender.sendClientMessage({ message: `${damageMessage} [${damage} ${damageClass} damage]`, subClass: 'combat other hit' });

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

    if(defender.isDead()) return;

    const isHeal = damage < 0;

    // if not healing, check for damage resist
    if(!isHeal) {
      const damageReduced = defender.getTotalStat(`${damageClass}Resist`);
      damage -= damageReduced;

      if(damageReduced > 0 && attacker) {
        attacker.sendClientMessage({ message: `Your attack is mangled by a magical force!`, subClass: `combat self blocked`, target: defender.uuid });
      }

      // non-physical attacks are magical
      if(damageClass !== 'physical') {
        const magicReduction = defender.getTotalStat('magicalResist');
        damage -= magicReduction;
      }

      if(damage < 0) damage = 0;
    }

    const absDmg = Math.abs(damage);
    const dmgString = isHeal ? 'health' : `${damageClass} damage`;

    const otherClass = isHeal ? 'heal' : 'hit';

    if(attackerDamageMessage && attacker) {
      attacker.sendClientMessage({ message: `${attackerDamageMessage} [${absDmg} ${dmgString}]`, subClass: `combat self ${otherClass}`, target: defender.uuid });
    }

    if(defenderDamageMessage && attacker !== defender) {
      defender.sendClientMessage({ message: `${defenderDamageMessage} [${absDmg} ${dmgString}]`, subClass: `combat other ${otherClass}` });
    }

    defender.hp.sub(damage);

    const wasFatal = defender.isDead();

    if(!wasFatal) {
      defender.addAgro(attacker, damage);
    } else {
      if(attacker) {
        defender.sendClientMessageToRadius({
          message: `${defender.name} was killed by ${attacker.name}!`, subClass: 'combat self kill' }, 5, [defender.uuid]
        );
        defender.sendClientMessage({ message: `You were killed by ${attacker.name}!`, subClass: 'combat other kill' });
        defender.die(attacker);
        attacker.kill(defender);
      } else {
        defender.sendClientMessageToRadius({ message: `${defender.name} was killed!`, subClass: 'combat self kill' }, 5, [defender.uuid]);
        defender.sendClientMessage({ message: `You were killed!`, subClass: 'combat other kill' });
        defender.die(attacker);
      }
    }

    return damage;

  }
}
