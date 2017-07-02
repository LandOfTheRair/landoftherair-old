
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { ItemCreator } from '../../../helpers/item-creator';

export class GMExamine extends Command {

  public name = '@examine';
  public format = 'Target';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    if(!args && player.rightHand) {
      player.sendClientMessage(JSON.stringify(player.rightHand.toJSON()));
      return;
    }

    const possTargets = room.getPossibleMessageTargets(player, args);
    if(!possTargets.length) return player.sendClientMessage('You do not see that person.');

    const target = possTargets[0];
    if(!target) return false;

    player.sendClientMessage(JSON.stringify(target.toJSON()));
  }
}
