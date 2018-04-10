
import { Skill } from '../../../../../base/Skill';
import { Player } from '../../../../../../shared/models/player';

export class Teleport extends Skill {

  static macroMetadata = {
    name: 'Teleport',
    macro: 'cast teleport',
    icon: 'deadly-strike',
    color: '#a0a',
    mode: 'clickToTarget',
    tooltipDesc: 'Teleport to a previously-memorized location. Cost: 50% MP',
    requireCharacterLevel: 20,
    requireSkillLevel: 15,
    skillTPCost: 20
  };

  public name = ['teleport', 'cast teleport'];
  public format = 'Location';

  mpCost(user: Player) { return user.mp.maximum / 2; }

  execute(user: Player, { args }) {
    if(!this.tryToConsumeMP(user)) return;

    this.use(user, user, args);
  }

  async use(user: Player, target: Player, teleportLocation: string) {
    user.$$room.teleportHelper.teleportTo(user, teleportLocation);
  }

}
