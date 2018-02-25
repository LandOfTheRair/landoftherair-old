
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

import { compact, capitalize } from 'lodash';
import { MetalworkingHelper } from '../../../../helpers/metalworking-helper';

export class Upgrade extends Command {

  public name = 'upgrade';
  public format = 'SmithUUID';

  async execute(player: Player, { room, gameState, args }) {
    if(!args) return false;
    if(!MetalworkingHelper.canMetalwork(player)) return player.sendClientMessage('You are not able to Metalforge!');

    const smithUUID = args;

    const smith = room.state.findNPC(smithUUID);
    if(!smith) return player.sendClientMessage('That person is not here.');

    const container = player.tradeSkillContainers.metalworking;

    if(container.upgradeResult) return player.sendClientMessage('You need to remove your previous result first.');

    const baseItem = container.upgradeItem;
    const baseUpgrade = container.upgradeReagent;

    const result = MetalworkingHelper.upgrade(player);
    if(!result) return player.sendClientMessage('Your upgrade did not pan out.');

    player.sendClientMessage(`You successfully upgraded your ${baseItem.itemClass.toLowerCase()} with ${baseUpgrade.desc}!`);
  }

}
