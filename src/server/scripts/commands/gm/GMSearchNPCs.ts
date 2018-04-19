
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { NPCLoader } from '../../../helpers/character/npc-loader';

export class GMSearchNPCs extends Command {

  public name = '@searchnpcs';
  public format = 'NPCName';

  async execute(player: Player, { args }) {
    if(!player.$$room.subscriptionHelper.isGM(player)) return;

    const npcName = args;
    if(!npcName) return false;

    let items;
    try {
      items = await NPCLoader.searchNPCs(npcName);
    } catch(e) {
      return;
    }

    if(!items.length) return player.sendClientMessage(`No npcs matching "${npcName}" were found.`);

    player.sendClientMessage(`Search results for item with name "${npcName}":`);
    for(let i = 0; i < items.length; i++) {
      if(i >= 5) {
        player.sendClientMessage(`... and ${items.length - 5} more.`);
        return;
      }
      player.sendClientMessage(`${i + 1}: ${items[i].name} (${items[i].npcId})`);
    }
  }
}
