
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

import { MetalworkingHelper } from '../../../../helpers/tradeskill/metalworking-helper';

export class Craft extends Command {

  public name = 'craft';
  public format = 'SmithUUID';

  async execute(player: Player, { room, args }) {
    if(!args) return false;
    if(!MetalworkingHelper.canMetalwork(player)) return player.sendClientMessage('You are not able to Metalforge!');

    const smithUUID = args;

    const smith = room.state.findNPC(smithUUID);
    if(!smith) return player.sendClientMessage('That person is not here.');

    const container = player.tradeSkillContainers.metalworking;

    if(container.craftResult) return player.sendClientMessage('You need to remove your previous result first.');

    const result = await MetalworkingHelper.craft(player);
    if(!result) return player.sendClientMessage('Your craft did not pan out.');

    player.sendClientMessage('Your craft was a success!');
  }

}
