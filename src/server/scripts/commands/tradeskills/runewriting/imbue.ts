
import { includes } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

import { RunewritingHelper } from '../../../../helpers/tradeskill/runewriting-helper';

export class Imbue extends Command {

  public name = 'imbue';
  public format = '';

  async execute(player: Player, { room, args }) {
    if(!RunewritingHelper.canRunewrite(player)) return player.sendClientMessage('You are not skilled enough to Imbue.');
    if(!player.rightHand || !player.leftHand) {
      return player.sendClientMessage('You must be holding a weapon in your right hand and an imbued scroll in your left!');
    }

    // must be a corpse, but not a player corpse
    if(!includes(player.leftHand.name, 'Runewritten Scroll')) return player.sendClientMessage('You can only imbue with a runewritten scroll!');

    RunewritingHelper.doImbue(player);
  }

}
