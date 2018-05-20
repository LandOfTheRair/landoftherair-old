
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Blindstrike as CastEffect } from '../../../../../effects/arts/Blindstrike';
import { CharacterHelper } from '../../../../../helpers/character/character-helper';

export class Blindstrike extends Skill {

  static macroMetadata = {
    name: 'Blindstrike',
    macro: 'art blindstrike',
    icon: 'sword-tie',
    color: '#a00',
    mode: 'autoActivate',
    tooltipDesc: 'Attack a random creature on your tile, even while you are unable to see.',
    requireSkillLevel: 10
  };

  public name = ['blindstrike', 'art blindstrike'];

  canUse(char: Character) {
    return !CharacterHelper.isAbleToSee(char);
  }

  execute(user: Character, { effect }) {

    const item = user.rightHand;
    if(!item) return user.sendClientMessage('You need a weapon to do that!');
    if(!CastEffect.isValid(user, item.type, CastEffect.skillRequired)) return user.sendClientMessage('You cannot blindstrike with that weapon.');

    this.use(user, user, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const art = new CastEffect(baseEffect);
    art.cast(user, target, this);
  }

}
