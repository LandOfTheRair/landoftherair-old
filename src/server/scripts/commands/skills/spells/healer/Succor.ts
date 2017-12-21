
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Player } from '../../../../../../shared/models/player';

export class Succor extends Skill {

  static macroMetadata = {
    name: 'Succor',
    macro: 'cast succor',
    icon: 'blackball',
    color: '#080',
    mode: 'autoActivate',
    tooltipDesc: 'Create a consumable that will let you return to your current location. Cost: 25 MP'
  };

  public name = ['succor', 'cast succor'];
  public format = '';

  flagSkills = [SkillClassNames.Restoration];

  mpCost = () => 25;
  range = () => 0;

  execute(user: Character, { gameState, args, effect }) {
    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, effect);
  }

  async use(user: Character, baseEffect = {}) {

    if(user.$$room.state.isSuccorRestricted(<Player>user)) {
      return user.sendClientMessage('You can\'t seem to find anything recognizable about this place.');
    }

    if(user.rightHand) return user.sendClientMessage('You must empty your right hand!');

    const skill = user.calcSkillLevel(SkillClassNames.Restoration);

    user.sendClientMessage('You channel your memories of this place into a ball of magical energy.');

    const succor = await user.$$room.itemCreator.getItemByName('Succor Blob');

    const succorRegion = user.$$room.state.getSuccorRegion(<Player>user);

    succor.setOwner(user);
    succor.desc = `a blob of spatial memories formed in the lands of ${user.map} around ${succorRegion}`;
    succor.ounces = Math.floor(skill / 5) || 1;

    succor.succorInfo = {
      map: user.map,
      x: user.x,
      y: user.y,
      z: (<any>user).z || 0
    };

    user.setRightHand(succor);
  }

}
