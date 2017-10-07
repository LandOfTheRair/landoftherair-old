
import { startsWith, random } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../models/character';
import { ItemCreator } from '../../../../helpers/item-creator';

export class Steal extends Skill {

  static macroMetadata = {
    name: 'Steal',
    macro: 'steal',
    icon: 'take-my-money',
    color: '#7F6B00',
    mode: 'lockActivation'
  };

  public name = 'steal';
  public format = 'Target';

  requiresLearn = false;

  range = () => 0;

  execute(user: Character, { gameState, args }) {
    if(!args) return false;

    if(!this.checkPlayerEmptyHand(user)) return;

    const possTargets = user.$$room.getPossibleMessageTargets(user, args);
    const target = possTargets[0];
    if(!target) return user.sendClientMessage('You do not see that person.');

    if(target.distFrom(user) > this.range()) return user.sendClientMessage('That target is too far away!');

    this.use(user, target);
  }

  async use(user: Character, target: Character) {

    if(target.sack.allItems.length === 0 && target.gold <= 0) return user.sendClientMessage('You can\'t seem to find anything to take!');

    const mySkill = user.calcSkillLevel(SkillClassNames.Thievery) * (user.baseClass === 'Thief' ? 3 : 1.5);
    const myStealth = Math.max(target.getTotalStat('stealth'), user.stealthLevel());
    const yourPerception = target.getTotalStat('perception');

    const baseStealRoll = (myStealth / yourPerception) * 100;
    const stealRoll = random(baseStealRoll - 10, baseStealRoll + 10);

    if(target.gold > 0) {
      if(random(0, stealRoll) < 30) {
        this.gainThiefSkill(user, 1);
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
        this.gainThiefSkill(user, 1);
        return user.sendClientMessage({ message: 'Your stealing attempt was thwarted!', target: target.uuid });
      }

      const item = target.sack.randomItem();
      target.sack.takeItem(item);
      const handName = this.getEmptyHand(user);
      user[`set${handName}`](item);

      user.sendClientMessage({ message: `You stole a ${item.itemClass.toLowerCase()} from ${target.name}!`, target: target.uuid });

    }

    const skillGained = baseStealRoll > 100 ? 1 : Math.floor((100 - baseStealRoll) / 5);
    this.gainThiefSkill(user, skillGained);
  }

  private gainThiefSkill(user: Character, skillGained: number) {
    if(skillGained <= 0) return;
    user.gainSkill(SkillClassNames.Thievery, skillGained);
  }

}
