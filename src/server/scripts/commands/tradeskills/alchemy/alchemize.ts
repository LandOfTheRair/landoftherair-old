
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

import { compact } from 'lodash';
import { AlchemyHelper } from '../../../../helpers/alchemy-helper';

export class Alchemize extends Command {

  public name = 'alchemize';
  public format = 'AlchUUID';

  async execute(player: Player, { room, args }) {
    if(!args) return false;

    const alch = room.state.findNPC(args);
    if(!alch) return player.sendClientMessage('That person is not here.');

    const container = player.tradeSkillContainers.alchemy;

    if(container.result) return player.sendClientMessage('You need to remove your previous result first.');

    const items = compact(container.reagents);
    if(items.length === 0) return player.sendClientMessage('You have no reagents to combine!');
    if(items.length === 1) return player.sendClientMessage('There is not enough here to combine!');

    const result = await AlchemyHelper.alchemize(player);
    if(result.name === 'Alchemical Mistake') return player.sendClientMessage('Your alchemical concoction did not pan out.');

    player.sendClientMessage('Your alchemy was a success!');
  }

}
