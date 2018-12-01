


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { GlacierStance as CastEffect } from '../../../../../effects/stances/GlacierStance';
import { NPC } from '../../../../../../shared/models/npc';

export class GlacierStance extends Skill {

  static macroMetadata = {
    name: 'GlacierStance',
    macro: 'stance glacier',
    icon: 'frozen-orb',
    color: '#000080',
    bgColor: '#000',
    mode: 'autoActivate',
    tooltipDesc: 'Become more defensive, increasing your physical defensive capabilities, ice resistance, and doing ice damage on physical hit.'
  };

  public targetsFriendly = true;

  public name = ['glacierstance', 'stance glacierstance', 'stance glacier'];
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
