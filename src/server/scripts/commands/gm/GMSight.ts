
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import {WallSight} from '../../../effects';

export class GMSight extends Command {

  public name = '@sight';
  public format = '';

  async execute(player: Player) {
    if(!player.$$room.subscriptionHelper.isGM(player)) return;

    const wallSight = new WallSight({});
    wallSight.cast(player, player);
  }
}
