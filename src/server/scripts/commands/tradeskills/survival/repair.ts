

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { SurvivalHelper } from '../../../../helpers/tradeskill/survival-helper';

export class Repair extends Command {

  public name = 'repair';
  public format = '';

  async execute(player: Player) {

    if(!player.rightHand) return player.sendClientMessage('You must be holding something to repair!');
    if(!player.leftHand || player.leftHand.itemClass !== 'Hammer') return player.sendClientMessage('You must be holding a hammer in your left hand to repair!');
    if(player.leftHand.isBroken()) return player.sendClientMessage('That hammer can\'t be used for anything!');

    SurvivalHelper.repair(player);
  }

}
