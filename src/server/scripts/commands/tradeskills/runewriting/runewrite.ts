
import { includes } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

import { RunewritingHelper } from '../../../../helpers/tradeskill/runewriting-helper';

export class Runewrite extends Command {

  public name = 'runewrite';
  public format = '';

  async execute(player: Player, { room, args }) {
    if(!RunewritingHelper.canRunewrite(player)) return player.sendClientMessage('You are not skilled enough to Runewrite.');
    if(!player.potionHand || !player.rightHand || !player.leftHand) {
      return player.sendClientMessage('You must be holding an empty scroll in your right hand, a corpse in your left, and your potion must be ink!');
    }

    // hardcoded ink vial for now, maybe use more ink vials later?
    if(!includes(player.potionHand.name, 'Ink Vial')) return player.sendClientMessage('That is not an ink bottle!');

    // must be an empty scribe scroll
    if(player.rightHand.name !== 'Scribe Scroll') return player.sendClientMessage('You must be holding an empty scroll!');
    if(player.rightHand.desc !== 'an empty scroll') return player.sendClientMessage('That scroll has been written on!');

    // must be a corpse, but not a player corpse
    if(player.leftHand.itemClass !== 'Corpse') return player.sendClientMessage('You can only scribe corpse blood!');
    if(player.leftHand.$$isPlayerCorpse) return player.sendClientMessage('You cannot scribe from player corpses!');

    RunewritingHelper.doRunewrite(player);
  }

}
