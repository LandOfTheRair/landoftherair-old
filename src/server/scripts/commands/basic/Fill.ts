
import { includes } from 'lodash';

import { Skill } from '../../../base/Skill';
import { Character } from '../../../../shared/models/character';
import { SwimLevel } from '../../../helpers/world/descriptions';

export class Fill extends Skill {

  public name = 'fill';
  public format = 'Hand';

  requiresLearn = false;

  execute(user: Character, { args }) {
    if(!args) args = 'right';
    const [handCheck] = args.split(' ');

    const hand = handCheck.toLowerCase();
    if(hand !== 'left' && hand !== 'right') return false;

    const item = user[`${hand}Hand`];
    if(!item || item.itemClass !== 'Bottle' || item.ounces > 0) return user.sendClientMessage('You do not have anything to fill in that hand!');

    const swimLevel = user.swimLevel;
    if(!swimLevel) return user.sendClientMessage('You are not in a place to fill up your bottle!');

    if(!item.isOwnedBy(user)) return user.sendClientMessage('That is not yours!');

    this.use(user, user, { hand });
  }

  use(user: Character, target: Character, opts: any = {}) {
    const { hand } = opts;

    let effect = null;
    let extendedDesc = null;

    if(user.swimLevel === SwimLevel.NormalWater) {
      effect = 'FillNormalWater';
      extendedDesc = 'filled with water';
    }

    if(user.swimLevel === SwimLevel.ChillWater) {
      effect = 'FillChilledWater';
      extendedDesc = 'filled with chilled water';
    }

    if(user.swimLevel === SwimLevel.Lava) {
      effect = 'FillLava';
      extendedDesc = 'somehow filled with lava';
    }

    // override based on locale
    const interactable = user.$$room.state.getInteractable(user.x, user.y);
    if(interactable && interactable.properties && interactable.properties.fillEffect && interactable.properties.fillDesc) {
      effect = interactable.properties.fillEffect;
      extendedDesc = interactable.properties.fillDesc;
    }

    const item = user[`${hand}Hand`];
    item.ounces = 1;
    item.value = 2;
    item.effect = { name: effect };
    item.extendedDesc = extendedDesc;

    if(includes(item.name, '(Empty)')) item.name = item.name.substring(0, item.name.indexOf('(Empty)') - 1);
    item.name = `${item.name} (Filled ${effect})`;
    user.sendClientMessage(`The bottle in your ${hand} hand is now ${extendedDesc}.`);
  }

}
