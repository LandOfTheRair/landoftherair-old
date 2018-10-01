
import { Character, Direction, SkillClassNames } from '../../shared/models/character';
import { Command } from './Command';

import { random, get } from 'lodash';
import { MessageHelper } from '../helpers/world/message-helper';

interface MacroMetadata {
  name: string;
  macro: string;
  icon: string;
  color: string;
  bgColor?: string;
  mode: string; // 'clickToTarget'|'autoActivate'|'lockActivation'
  tooltipDesc: string;
  requireBaseClass?: string;
  requireCharacterLevel?: number;
  requireSkillLevel?: number;
  skillTPCost?: number;
}

export abstract class Skill extends Command {

  static macroMetadata: MacroMetadata;
  static targetsFriendly: boolean;

  requiresLearn = true;

  mpCost(caster?: Character, targets?: Character[]) { return 0; };
  hpCost(caster?: Character) { return 0; };
  range(caster?: Character) { return 0; };

  modifiedMPCost(caster: Character, baseCost: number): number {

    let traitReductionLevel = 0;

    /** PERK:CLASS:MAGE:Mages get a bonus to MP cost reduction if they hold a wand in their right hand. */
    if(caster.baseClass === 'Mage' && get(caster, 'rightHand.type') === 'Wand') {
      traitReductionLevel = caster.getTraitLevel('WandSpecialty');
    }

    /** PERK:CLASS:HEALER:Healers get a bonus to MP cost reduction if they hold a totem in their right hand. */
    if(caster.baseClass === 'Healer' && get(caster, 'rightHand.type') === 'Totem') {
      traitReductionLevel = caster.getTraitLevel('TotemSpecialty');
    }

    if(traitReductionLevel > 0) {
      baseCost -= Math.floor(baseCost * (traitReductionLevel / 50));
      baseCost = Math.max(baseCost, 1);
    }

    return baseCost;
  }

  canUse(user: Character, target: Character): boolean {
    if(user.mp.lt(this.mpCost(user))) return false;
    if(user.hp.lt(this.hpCost(user))) return false;
    if(user.distFrom(target) > this.range(user)) return false;
    return true;
  }

  calcPlainAttackRange(attacker: Character, defaultRange = 0): number {
    const weapon = attacker.rightHand;
    if(!weapon) return 0;

    // if you have a twohanded item and a lefthand, normally you can't use it
    if(weapon.twoHanded && attacker.leftHand) {

      // but if you have a weapon that can shoot, and are holding ammo, we allow it to pass through
      if(!weapon.canShoot || (weapon.canShoot && !attacker.leftHand.shots)) {
        return -1;
      }
    }

    return weapon.attackRange || defaultRange;
  }

  isValidBuffTarget(user: Character, target: Character): boolean {
    return target.isPlayer() || !user.$$room.state.checkTargetForHostility(user, target);
  }

  tryToConsumeMP(user: Character, effect?, targets?: Character[]): boolean {

    if(effect) return true;

    const mpCost = this.modifiedMPCost(user, this.mpCost(user, targets));


    /** PERK:CLASS:THIEF:Thieves cast spells with their HP instead of using MP. */
    if(user.baseClass === 'Thief') {
      if(user.hp.total <= mpCost) {
        user.sendClientMessage('You do not have enough HP!');
        return false;
      }

    } else if(user.mp.total < mpCost) {
      user.sendClientMessage('You do not have enough MP!');
      return false;
    }

    if(user.baseClass === 'Thief') {
      user.hp.sub(mpCost);
    } else if(mpCost > 0) {
      user.mp.sub(mpCost);
    }

    return true;
  }

  getTarget(user: Character, args: string, allowSelf = false, allowDirection = false): Character|any {

    let target = null;
    args = args.trim();

    // try to do directional casting, ie, n w w e
    const splitArgs = args.split(' ');
    if(allowDirection && (splitArgs.length > 0 || args.length <= 2)) {
      let curX = user.x;
      let curY = user.y;

      for(let i = 0; i < splitArgs.length; i++) {
        // you can specify a max of 4 directions
        if(i >= 4) continue;

        const { x, y } = user.getXYFromDir(<Direction>splitArgs[i]);

        // if you specify a wall tile, your cast is halted
        if(user.$$room.state.checkIfActualWall(curX + x, curY + y)) break;

        curX += x;
        curY += y;
      }

      if(curX !== user.x || curY !== user.y) {
        return { x: curX, y: curY };
      }
    }

    if(allowSelf) {
      target = user;
    }

    if(args) {
      const possTargets = MessageHelper.getPossibleMessageTargets(user, args);
      target = possTargets[0];
    }

    if(!target) {
      user.youDontSeeThatPerson(args);
      return null;
    }

    const range = this.range();

    if(target.distFrom(user) > range) {
      user.sendClientMessage('That target is too far away!');
      return null;
    }

    return target;
  }

  async facilitateSteal(user: Character, target: Character) {

    if(target.sack.allItems.length === 0 && target.currentGold <= 0) {
      user.sendClientMessage('You can\'t seem to find anything to take!');
      return;
    }

    const gainThiefSkill = (gainer, skillGained) => {
      if(skillGained <= 0) return;
      gainer.gainSkill(SkillClassNames.Thievery, skillGained);
    };

    /** PERK:CLASS:THIEF:Thieves gain thievery skill faster. */
    const mySkill = user.calcSkillLevel(SkillClassNames.Thievery) * (user.baseClass === 'Thief' ? 3 : 1.5);
    const myStealth = Math.max(target.getTotalStat('stealth'), user.stealthLevel());
    const yourPerception = target.getTotalStat('perception');

    const baseStealRoll = (myStealth / yourPerception) * 100;
    const stealRoll = random(baseStealRoll - 10, baseStealRoll + 10);

    const userName = target.canSeeThroughStealthOf(user) ? user.name : 'somebody';

    const stealMod = 1 + user.getTraitLevelAndUsageModifier('NimbleStealing');

    if(target.currentGold > 0) {
      if(random(0, stealRoll) < 30 - stealMod) {
        gainThiefSkill(user, 1);
        target.addAgro(user, 1);
        user.sendClientMessage({ message: 'Your stealing attempt was thwarted!', target: target.uuid });
        target.sendClientMessage({ message: `${userName} just tried to steal from you!`, target: user.uuid });
        return;
      }

      const fuzzedSkill = random(Math.max(mySkill - 3, 1), mySkill + 5);

      const stolenGold = Math.max(
        1,
        Math.min(
          target.currentGold,
          mySkill * 100 * stealMod,
          Math.max(5, Math.floor(target.currentGold * (fuzzedSkill / 100)))
        )
      );

      const handName = this.getEmptyHand(user);
      if(!handName) return;

      target.spendGold(stolenGold);
      const item = await user.$$room.itemCreator.getGold(stolenGold);

      user[`set${handName}`](item);
      user.sendClientMessage({ message: `You stole ${stolenGold} gold from ${target.name}!`, target: target.uuid });

    } else if(target.sack.allItems.length > 0) {
      if(random(0, stealRoll) < 60 - stealMod) {
        gainThiefSkill(user, 1);
        target.addAgro(user, 1);
        user.sendClientMessage({ message: 'Your stealing attempt was thwarted!', target: target.uuid });
        target.sendClientMessage({ message: `${userName} just tried to steal from you!`, target: user.uuid });
        return;
      }

      const handName = this.getEmptyHand(user);
      if(!handName) return;

      const item = target.sack.randomItem();
      target.sack.takeItem(item);
      user[`set${handName}`](item);

      user.sendClientMessage({ message: `You stole a ${item.itemClass.toLowerCase()} from ${target.name}!`, target: target.uuid });

    }

    if(user.level < target.level + 3) {
      const skillGained = baseStealRoll > 100 ? 1 : Math.floor((100 - baseStealRoll) / 5);
      gainThiefSkill(user, skillGained);
    }

  }

  use(user: Character, target: Character, baseEffect = {}) {}

}

export abstract class MonsterSkill extends Skill {
  monsterSkill = true;

  execute(user: Character, { args }) {
    if(!args) return false;

    const target = this.getTarget(user, args);
    if(!target) return;

    this.use(user, target);
  }

}
