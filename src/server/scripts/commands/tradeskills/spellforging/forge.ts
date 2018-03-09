
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

import { capitalize } from 'lodash';
import { SpellforgingHelper } from '../../../../helpers/tradeskill/spellforging-helper';

export class Forge extends Command {

  public name = 'forge';
  public format = 'EnchUUID';

  async execute(player: Player, { room, args }) {
    if(!args) return false;
    if(!SpellforgingHelper.canSpellforge(player)) return player.sendClientMessage('You are not skilled enough to Spellforge.');

    const [enchUUID, dustType] = args.split(' ');

    const ench = room.state.findNPC(enchUUID);
    if(!ench) return player.sendClientMessage('That person is not here.');

    const container = player.tradeSkillContainers.spellforging;

    if(container.result) return player.sendClientMessage('You need to remove your previous result first.');

    const lowerDustType = dustType.toLowerCase();

    if(container.dustValues[lowerDustType] < 100) return player.sendClientMessage('You do not have enough dust to do that!');

    container.gainDust(lowerDustType, -100);

    await SpellforgingHelper.createBrickFor(player, lowerDustType);

    player.sendClientMessage(`You forged an ${capitalize(lowerDustType)} brick!`);
  }

}
