
import { includes } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { SharpWeaponClasses } from '../../../../../shared/interfaces/item';
import { SurvivalHelper } from '../../../../helpers/tradeskill/survival-helper';

export class Tan extends Command {

  public name = 'tan';
  public format = '';

  async execute(player: Player) {

    const ground = player.$$room.state.getGroundItems(player.x, player.y);
    if(!ground.Corpse || !ground.Corpse.length) return player.sendClientMessage('There are no corpses here!');
    if(!player.rightHand || !includes(SharpWeaponClasses, player.rightHand.itemClass)) return player.sendClientMessage('You must be holding something sharp to tan!');

    SurvivalHelper.tan(player);
  }

}
