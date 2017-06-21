
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { ItemCreator } from '../../../helpers/item-creator';

export class GMCreateGold extends Command {

  public name = '@gold';
  public format = 'Value';

  async execute(player: Player, { client, room, gameState, args }) {
    if(!player.isGM) return;

    const value = +args;
    if(!value) return false;

    let item;
    try {
      item = await ItemCreator.getItemByName('Gold Coin');
    } catch(e) {
      room.sendClientLogMessage(client, `Warning: "Gold Coin" does not exist.`);
      return;
    }

    item.value = value;
    room.addItemToGround(player, item);
  }
}
