
import { includes, random, capitalize } from 'lodash';

import { Character, SkillClassNames } from '../../models/character';
import { ShieldClasses } from '../../models/item';
import * as Classes from '../classes';

import * as dice from 'dice.js';

export type DamageType =
  'Physical';

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

    if(defender.isDead()) return { isDead: true };

    let attackerWeapon;

    if(isThrow) {
      attackerWeapon = attacker[`${throwHand}Hand`];

    } else {
      attackerWeapon = attacker.rightHand || attacker.gear.Hands || { type: 'Martial', itemClass: 'hands', name: 'hands'};
    }

    const flagSkills = [];
    flagSkills[0] = attackerWeapon.type;
    if(attackerWeapon.secondaryType) flagSkills[1] = attackerWeapon.secondaryType;

    if(isThrow) flagSkills[1] = SkillClassNames.Throwing;

    const defenderBlocker = defender.rightHand || { type: 'Martial', itemClass: 'hands', name: 'hands' };
    const defenderShield = defender.leftHand && this.isShield(defender.leftHand) ? defender.leftHand : null;

    const attackerScope = {
      skill: attacker.calcSkillLevel(isThrow ? SkillClassNames.Throwing : attackerWeapon.type),
      offense: attacker.getTotalStat('offense'),
      accuracy: attacker.getTotalStat('accuracy'),
      dex: attacker.getTotalStat('dex'),
      str: attacker.getTotalStat('str'),
      str4: attacker.getTotalStat('str') / 4,
      level: Math.max(1, attacker.level / Classes[attacker.baseClass || 'Undecided'].combatDivisor),
      damageMin: attackerWeapon.baseDamage,
      damageMax: attackerWeapon.maxDamage
    };

    const defenderScope = {
      skill: defender.calcSkillLevel(defenderBlocker.type),
      defense: defender.getTotalStat('defense'),
      agi: defender.getTotalStat('agi'),
      dex: defender.getTotalStat('dex'),
      dex4: defender.getTotalStat('dex') / 4,
      armorClass: defender.getTotalStat('armorClass'),
      shieldAC: defenderShield ? defenderShield.stats.armorClass : 0,
      shieldDefense: defenderShield ? defenderShield.stats.defense : 0,
      level: Math.max(1, defender.level / Classes[defender.baseClass || 'Undecided'].combatDivisor)
    };

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
      attacker.sendClientMessage({ message: `You miss!`, subClass: 'combat self miss' });
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
      attacker.sendClientMessage({ message: `You were blocked by armor!`, subClass: 'combat self block armor' });
      defender.sendClientMessage({ message: `${attacker.name} was blocked by your armor!`, subClass: 'combat other block armor' });
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
    if(weaponBlockRoll < 0) {
      const itemTypeToLower = defenderBlocker.itemClass.toLowerCase();
      attacker.sendClientMessage({ message: `You were blocked by a ${itemTypeToLower}!`, subClass: 'combat self block weapon' });
      defender.sendClientMessage({ message: `${attacker.name} was blocked by your ${itemTypeToLower}!`, subClass: 'combat other block weapon' });
      if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);
      return { block: true, blockedBy: `a ${itemTypeToLower}` };
    }

    // try to block with shield
    if(defenderShield) {
      const defenderShieldBlockLeftSide = Math.floor(1 + defenderScope.shieldDefense);
      const defenderShieldBlockRightSide = Math.floor(defenderScope.dex4 + defenderScope.skill);

      const attackerShieldBlockRoll = Math.max(1, +dice.roll(`${attackerDodgeBlockLeftSide}d${attackerWeaponShieldBlockRightSide}`) - defenderScope.shieldAC);
      const defenderShieldBlockRoll = -+dice.roll(`${defenderShieldBlockLeftSide}d${defenderShieldBlockRightSide}`);

      const shieldBlockRoll = random(attackerShieldBlockRoll, defenderShieldBlockRoll);
      if(shieldBlockRoll < 0) {
        const itemTypeToLower = defenderShield.itemClass.toLowerCase();
        attacker.sendClientMessage({ message: `You were blocked by a ${itemTypeToLower}!`, subClass: 'combat self block shield' });
        defender.sendClientMessage({ message: `${attacker.name} was blocked by your ${itemTypeToLower}!`, subClass: 'combat other block shield' });
        if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);
        return { block: true, blockedBy: `a ${itemTypeToLower}` };
      }
    }

    const damageLeft = Math.floor(attackerScope.skill + attackerScope.level);
    const damageMax = random(attackerScope.damageMin, attackerScope.damageMax);
    const damageRight = Math.floor(attackerScope.str + damageMax);

    let damage = +dice.roll(`${damageLeft}d${damageRight}`);

    let damageType = 'a successful strike';

    if(attackerScope.damageMin !== attackerScope.damageMax) {
      if(attackerScope.damageMin === damageMax) damageType = 'a grazing blow';
      if(attackerScope.damageMax === damageMax) damageType = 'a grievous wound';
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
      attackerWeapon,
      attackerDamageMessage: `Your attack was ${damageType}!`,
      defenderDamageMessage: msg
    });

    if(isThrow) this.resolveThrow(attacker, defender, throwHand, attackerWeapon);

    if(damage <= 0) {
      return { noDamage: true };
    }

    return { damage, dealtBy: attackerWeapon.itemClass.toLowerCase(), damageType };
  }

  static magicalAttack(attacker: Character, attacked: Character) {

  }

  static dealOnesidedDamage(defender, { damage, damageClass, damageMessage }) {
    const damageReduced = defender.getTotalStat(`${damageClass}Resist`);
    damage -= damageReduced;

    if(damage < 0) return 0;

    defender.hp.sub(damage);

    defender.sendClientMessage({ message: `${damageMessage} [${damage} ${damageClass} damage]`, subClass: 'combat other hit' });

    if(defender.isDead()) {
      defender.sendClientMessage({ message: `You died!`, subClass: 'combat other kill' });
      defender.die();
    }
  }

  static dealDamage(
    attacker: Character,
    defender: Character,
    { damage, damageClass, attackerWeapon, attackerDamageMessage, defenderDamageMessage }
  ) {

    const damageReduced = defender.getTotalStat(`${damageClass}Resist`);
    damage -= damageReduced;

    if(damage < 0) return 0;

    if(attackerDamageMessage) {
      attacker.sendClientMessage({ message: `${attackerDamageMessage} [${damage} ${damageClass} damage]`, subClass: 'combat self hit' });
    }

    if(defenderDamageMessage) {
      defender.sendClientMessage({ message: `${defenderDamageMessage} [${damage} ${damageClass} damage]`, subClass: 'combat other hit' });
    }

    defender.hp.sub(damage);

    const wasFatal = defender.isDead();

    if(!wasFatal) {
      defender.addAgro(attacker, damage);
    } else {
      attacker.sendClientMessageToRadius({ message: `${defender.name} was killed by ${attacker.name}!`, subClass: 'combat self kill' });
      defender.sendClientMessage({ message: `You were killed by ${attacker.name}!`, subClass: 'combat other kill' });
      defender.die(attacker);
      attacker.kill(defender, attackerWeapon);
    }

    return damage;

  }
}
