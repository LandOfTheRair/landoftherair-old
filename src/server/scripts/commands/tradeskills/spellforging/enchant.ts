
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

import { compact } from 'lodash';
import { SpellforgingHelper } from '../../../../helpers/spellforging-helper';

export class Enchant extends Command {

  public name = 'enchant';
  public format = 'EnchUUID';

  async execute(player: Player, { room, gameState, args }) {
    if(!args) return false;
    if(!SpellforgingHelper.canSpellforge(player)) return player.sendClientMessage('You are not skilled enough to Spellforge.');

    const ench = room.state.findNPC(args);
    if(!ench) return player.sendClientMessage('That person is not here.');

    const container = player.tradeSkillContainers.spellforging;

    if(container.result) return player.sendClientMessage('You need to remove your previous result first.');
    if(!container.modifyItem) return player.sendClientMessage('You can\'t enchant nothing.');
    if(!container.reagent) return player.sendClientMessage('You need an enchanting brick or rune scroll to enchant.');

    const wasSuccess = SpellforgingHelper.enchant(player);

    if(!wasSuccess) {
      player.sendClientMessage(`The enchantment failed!`);
      return;
    }

    player.sendClientMessage(`You successfully enchanted your ${container.result.itemClass.toLowerCase()}!`);
  }

}
