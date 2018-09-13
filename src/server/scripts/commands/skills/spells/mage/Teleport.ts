
import { Skill } from '../../../../../base/Skill';
import { Player } from '../../../../../../shared/models/player';

export class Teleport extends Skill {

  static macroMetadata = {
    name: 'Teleport',
    macro: 'cast teleport',
    icon: 'teleport',
    color: '#a0a',
    mode: 'clickToTarget',
    tooltipDesc: 'Teleport to a previously-memorized location. Cost: 50% MP',
    requireCharacterLevel: 20,
    requireSkillLevel: 15,
    skillTPCost: 20
  };

  public name = ['teleport', 'cast teleport'];
  public format = 'Location';

  mpCost(user: Player) { return Math.floor(user.mp.maximum / 2); }

  execute(user: Player, { args }) {
    if(user.mp.total < this.mpCost(user)) return user.sendClientMessage('You do not have enough MP!');

    this.use(user, user, args);
  }

  async use(user: Player, target: Player, teleportLocation: string) {
    const didTeleport = await user.$$room.teleportHelper.teleportTo(user, teleportLocation);
    if(didTeleport) {
      this.tryToConsumeMP(user);
    }
  }

}
