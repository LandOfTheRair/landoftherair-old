
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SubscriptionHelper } from '../../../helpers/account/subscription-helper';
import {WallSight} from '../../../effects';

export class GMSight extends Command {

  public name = '@sight';
  public format = '';

  async execute(player: Player) {
    if(!SubscriptionHelper.isGM(player)) return;

    const wallSight = new WallSight({});
    wallSight.cast(player, player);
  }
}
