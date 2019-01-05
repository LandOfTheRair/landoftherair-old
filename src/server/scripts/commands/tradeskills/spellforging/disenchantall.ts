
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

import { SpellforgingHelper } from '../../../../helpers/tradeskill/spellforging-helper';

export class DisenchantAll extends Command {

  public name = 'disenchantall';
  public format = 'EnchUUID ItemType';

  async execute(player: Player, { room, args }) {
    if(!args) return false;
    if(!SpellforgingHelper.canSpellforge(player)) return player.sendClientMessage('You are not skilled enough to Spellforge.');

    const [enchUUID, itemType] = args.split(' ');

    const ench = room.state.findNPC(enchUUID);
    if(!ench) return player.sendClientMessage('That person is not here.');

    const container = player.tradeSkillContainers.spellforging;

    if(container.result) return player.sendClientMessage('You need to remove your previous result first.');

    const removeSlots = [];

    player.sack.allItems.forEach(async (item, i) => {
      if(item.itemClass !== itemType) return;

      if(container.modifyItem) return player.sendClientMessage('Invalid item in Subject slot. Stopping.');

      const added = this.addItemToContainer(player, player.tradeSkillContainers.spellforging, item, 0);
      if(added) removeSlots.push(i);

      if(!container.modifyItem) return player.sendClientMessage('You can\'t disenchant nothing.');

      if(!container.modifyItem.isOwnedBy(player)) return player.sendClientMessage('You can\'t disenchant someone elses items!');
      if(!SpellforgingHelper.canDisenchant(container.modifyItem)) return player.sendClientMessage('You can\'t disenchant that.');

      const message = await SpellforgingHelper.disenchant(player);

      player.sendClientMessage(message);
    });

    player.sack.takeItemFromSlots(removeSlots);
  }

}
