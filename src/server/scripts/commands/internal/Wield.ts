
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { CommandExecutor } from '../../../helpers/command-executor';

export class Wield extends Command {

  public name = ['~wield', 'wield'];
  public format = 'Slot|ItemType';

  execute(player: Player, { args, room, gameState }) {
    if(!args) return false;

    let slot = +args;

    // numeric slot
    if(isNaN(slot)) {
      slot = -1;

      player.belt.allItems.forEach((beltItem, index) => {
        if(beltItem.itemClass.toLowerCase() === args.toLowerCase() || beltItem.type.toLowerCase() === args.toLowerCase()) {
          slot = index;
        }
      });
    }

    if(slot < 0) return player.sendClientMessage('No valid item found.');

    // item name slot

    if(!player.rightHand) CommandExecutor.executeCommand(player, `~BtR`, { args: slot, room, gameState });
    else                  CommandExecutor.executeCommand(player, `~BtL`, { args: slot, room, gameState });
  }

}
