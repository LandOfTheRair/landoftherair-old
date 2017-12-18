
import { Character, SkillClassNames } from '../../shared/models/character';
import { Command } from './Command';
import { ItemCreator } from '../helpers/item-creator';

import { isFunction, random } from 'lodash';

export abstract class Skill extends Command {

  requiresLearn = true;

  mpCost = (caster?: Character) => 0;
  hpCost = (caster?: Character) => 0;
  range = (caster?: Character) => 0;

  canUse(user: Character, target: Character): boolean {
    if(user.mp.lessThan(this.mpCost(user))) return false;
    if(user.hp.lessThan(this.hpCost(user))) return false;
    if(user.distFrom(target) > this.range(user)) return false;
    return true;
  }

  tryToConsumeMP(user: Character, effect): boolean {

    if(effect) return true;

    const mpCost = this.mpCost();

    if(user.baseClass === 'Thief') {
      if(user.hp.getValue() < mpCost) {
        user.sendClientMessage('You do not have enough HP!');
        return false;
      }

    } else if(user.mp.getValue() < mpCost) {
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
      const possTargets = user.$$room.getPossibleMessageTargets(user, args);
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

    if(target.sack.allItems.length === 0 && target.gold <= 0) return user.sendClientMessage('You can\'t seem to find anything to take!');

    const gainThiefSkill = (gainer, skillGained) => {
      if(skillGained <= 0) return;
      gainer.gainSkill(SkillClassNames.Thievery, skillGained);
    };

    const mySkill = user.calcSkillLevel(SkillClassNames.Thievery) * (user.baseClass === 'Thief' ? 3 : 1.5);
    const myStealth = Math.max(target.getTotalStat('stealth'), user.stealthLevel());
    const yourPerception = target.getTotalStat('perception');

    const baseStealRoll = (myStealth / yourPerception) * 100;
    const stealRoll = random(baseStealRoll - 10, baseStealRoll + 10);

    if(target.gold > 0) {
      if(random(0, stealRoll) < 30) {
        gainThiefSkill(user, 1);
        return user.sendClientMessage({ message: 'Your stealing attempt was thwarted!', target: target.uuid });
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

      target.gold -= stolenGold;
      const item = await ItemCreator.getGold(stolenGold);
      const handName = this.getEmptyHand(user);

      user[`set${handName}`](item);
      user.sendClientMessage({ message: `You stole ${stolenGold} gold from ${target.name}!`, target: target.uuid });

    } else if(target.sack.allItems.length > 0) {
      if(random(0, stealRoll) < 60) {
        gainThiefSkill(user, 1);
        return user.sendClientMessage({ message: 'Your stealing attempt was thwarted!', target: target.uuid });
      }

      const item = target.sack.randomItem();
      target.sack.takeItem(item);
      const handName = this.getEmptyHand(user);
      user[`set${handName}`](item);

      user.sendClientMessage({ message: `You stole a ${item.itemClass.toLowerCase()} from ${target.name}!`, target: target.uuid });

    }

    if(user.level < target.level + 3) {
      const skillGained = baseStealRoll > 100 ? 1 : Math.floor((100 - baseStealRoll) / 5);
      gainThiefSkill(user, skillGained);
    }

  }

}
