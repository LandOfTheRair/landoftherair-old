
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

import { compact, capitalize } from 'lodash';
import { MetalworkingHelper } from '../../../../helpers/metalworking-helper';

export class Smelt extends Command {

  public name = 'smelt';
  public format = 'SmithUUID';

  async execute(player: Player, { room, gameState, args }) {
    if(!args) return false;
    if(!MetalworkingHelper.canMetalwork(player)) return player.sendClientMessage('You are not able to Metalforge!');

    const [smithUUID, oreType] = args.split(' ');

    const smith = room.state.findNPC(smithUUID);
    if(!smith) return player.sendClientMessage('That person is not here.');

    const container = player.tradeSkillContainers.metalworking;

    if(container.craftResult) return player.sendClientMessage('You need to remove your previous result first.');

    let lowerOreType = oreType.toLowerCase();

    if(container.oreValues[lowerOreType] < 100) return player.sendClientMessage('You do not have enough ore to do that!');

    container.gainOre(lowerOreType, -100);

    await MetalworkingHelper.createIngotFor(player, lowerOreType);

    player.sendClientMessage(`You forged a ${capitalize(lowerOreType)} ingot!`);
  }

}
