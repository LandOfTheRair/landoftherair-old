
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
    if(user.mp.total < this.mpCost(user)) return user.sendClientMessage('You do not have enough MP!');

    this.use(user, user, args);
  }

  async use(user: Player, target: Player, teleportLocation: string) {
    const didTeleport = await user.$$room.teleportHelper.massTeleportTo(user, teleportLocation);
    if(didTeleport) {
      this.tryToConsumeMP(user);
    }
  }

}
