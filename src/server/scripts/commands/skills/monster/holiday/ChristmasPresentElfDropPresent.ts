
import { sample } from 'lodash';

import { MonsterSkill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';

export class ChristmasPresentElfDropPresent extends MonsterSkill {

  name = 'christmaspresentelfdroppresent';

  public targetsFriendly = true;

  async use(user: Character, target: Character) {
    user.sendClientMessageToRadius({ name: user.name, message: `Whoops! Dropped a present!`, subClass: 'chatter' }, 16);

    const itemName = sample(['Christmas Gift - Red', 'Christmas Gift - Blue', 'Christmas Gift - Yellow', 'Christmas Gift - Green', 'Christmas Gift - Rainbow']);
    const item = await user.$$room.npcLoader.loadItem(itemName);

    user.$$room.addItemToGround(user, item);
  }

}
