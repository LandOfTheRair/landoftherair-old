
import { Character, SkillClassNames } from '../../shared/models/character';
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

    if(caster.baseClass === 'Mage' && get(caster, 'rightHand.type') === 'Wand') {
      traitReductionLevel = caster.getTraitLevel('WandSpecialty');
    }

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

  isValidBuffTarget(user: Character, target: Character): boolean {
    return target.isPlayer() || !user.$$room.state.checkTargetForHostility(user, target);
  }

  tryToConsumeMP(user: Character, effect?, targets?: Character[]): boolean {

    if(effect) return true;

    const mpCost = this.modifiedMPCost(user, this.mpCost(user, targets));

    if(user.baseClass === 'Thief') {
      if(user.hp.total < mpCost) {
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

  getTarget(user: Character, args: string, allowSelf = false): Character {

    let target = null;

    if(allowSelf) {
      target = user;
    }

    if(args) {
      const possTargets = MessageHelper.getPossibleMessageTargets(user, args.trim());
      target = possTargets[0];
    }

    if(!target) {
      user.sendClientMessage('You do not see that person.');
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

    if(target.sack.allItems.length === 0 && target.gold <= 0) {
      user.sendClientMessage('You can\'t seem to find anything to take!');
      return;
    }

    const gainThiefSkill = (gainer, skillGained) => {
      if(skillGained <= 0) return;
      gainer.gainSkill(SkillClassNames.Thievery, skillGained);
    };

    const mySkill = user.calcSkillLevel(SkillClassNames.Thievery) * (user.baseClass === 'Thief' ? 3 : 1.5);
    const myStealth = Math.max(target.getTotalStat('stealth'), user.stealthLevel());
    const yourPerception = target.getTotalStat('perception');

    const baseStealRoll = (myStealth / yourPerception) * 100;
    const stealRoll = random(baseStealRoll - 10, baseStealRoll + 10);

    const userName = target.canSeeThroughStealthOf(user) ? user.name : 'somebody';

    if(target.gold > 0) {
      if(random(0, stealRoll) < 30) {
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
          target.gold,
          mySkill * 100,
          Math.max(5, Math.floor(target.gold * (fuzzedSkill / 100)))
        )
      );

      const handName = this.getEmptyHand(user);
      if(!handName) return;

      target.gold -= stolenGold;
      const item = await user.$$room.itemCreator.getGold(stolenGold);

      user[`set${handName}`](item);
      user.sendClientMessage({ message: `You stole ${stolenGold} gold from ${target.name}!`, target: target.uuid });

    } else if(target.sack.allItems.length > 0) {
      if(random(0, stealRoll) < 60) {
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
