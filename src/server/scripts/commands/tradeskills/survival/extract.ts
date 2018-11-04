
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { SurvivalHelper } from '../../../../helpers/tradeskill/survival-helper';

export class Extract extends Command {

  public name = 'extract';
  public format = '';

  async execute(player: Player) {

    if(player.rightHand) return player.sendClientMessage('You must have an empty hand to extract blood!');
    if(!player.leftHand || player.leftHand.itemClass !== 'Corpse') return player.sendClientMessage('You are not holding a corpse!');

    SurvivalHelper.extract(player);

  }

}
