
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { ItemCreator } from '../../../helpers/item-creator';

export class GMKill extends Command {

  public name = '@kill';
  public format = 'Target';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    const possTargets = room.getPossibleMessageTargets(player, args);
    if(!possTargets.length) return player.sendClientMessage('You do not see that person.');

    const target = possTargets[0];
    if(!target) return false;
    if(target.hostility === 'Never') return player.sendClientMessage('That target is not killable.');

    target.hp.toMinimum();
    target.die(player);
  }
}
