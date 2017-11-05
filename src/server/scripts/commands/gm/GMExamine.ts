
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { get } from 'lodash';

export class GMExamine extends Command {

  public name = '@examine';
  public format = 'Target? Prop?';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    if(!args && player.rightHand) {
      player.sendClientMessage(JSON.stringify(player.rightHand));
      return;
    }

    const [npcish, prop] = args.split(' ');
    const possTargets = room.getPossibleMessageTargets(player, npcish);
    if(!possTargets.length) return player.sendClientMessage('You do not see that person.');

    const target = possTargets[0];
    if(!target) return false;

    let targetJSON = target.toJSON();
    if(prop) {
      targetJSON = get(targetJSON, prop);
    }

    player.sendClientMessage(JSON.stringify(targetJSON));
  }
}
