
import { Skill } from '../../../../../base/Skill';
import { Player } from '../../../../../../shared/models/player';

export class MassTeleport extends Skill {

  static macroMetadata = {
    name: 'MassTeleport',
    macro: 'cast massteleport',
    icon: 'vortex',
    color: '#a0a',
    mode: 'clickToTarget',
    tooltipDesc: 'Teleport those on your tile to a previously-memorized location. Cost: 100% MP'
  };

  public name = ['massteleport', 'cast massteleport'];
  public format = 'Location';

  mpCost(user: Player) { return user.mp.maximum; }

  execute(user: Player, { args }) {
    if(!this.tryToConsumeMP(user)) return;

    this.use(user, args);
  }

  async use(user: Player, teleportLocation: string) {
    user.$$room.teleportHelper.massTeleportTo(user, teleportLocation);
  }

}
