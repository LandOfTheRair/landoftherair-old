


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { VolcanoStance as CastEffect } from '../../../../../effects/stances/VolcanoStance';
import { NPC } from '../../../../../../shared/models/npc';

export class VolcanoStance extends Skill {

  static macroMetadata = {
    name: 'VolcanoStance',
    macro: 'stance volcano',
    icon: 'fire-silhouette',
    color: '#DC143C',
    bgColor: '#000',
    mode: 'autoActivate',
    tooltipDesc: 'Become more offensive, increasing your physical offensive capabilities, your fire resistance, and doing fire damage on physical hits.'
  };

  public targetsFriendly = true;

  public name = ['volcanostance', 'stance volcanostance', 'stance volcano'];
  public unableToLearnFromStealing = true;

  canUse(user: Character, target: Character) {
    if(user.isPlayer()) return true;
    const check = <NPC>user;
    return super.canUse(user, target) && user.rightHand && !check.$$stanceCooldown || check.$$stanceCooldown <= 0;
  }

  execute(user: Character) {

    const item = user.rightHand;
    if(!item) return user.sendClientMessage('You need a weapon to stance with!');
    if(!CastEffect.isValid(user, item.type, CastEffect.skillRequired)) return user.sendClientMessage('You cannot stance with that weapon.');

    this.use(user);
  }

  use(user: Character) {
    const stance = new CastEffect({});
    stance.cast(user, user, this);

    if(!user.isPlayer()) (<NPC>user).$$stanceCooldown = 15;
  }

}
