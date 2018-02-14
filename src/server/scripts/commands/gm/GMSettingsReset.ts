
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SettingsHelper } from '../../../helpers/settings-helper';
import { SubscriptionHelper } from '../../../helpers/subscription-helper';

export class GMSettingsReset extends Command {

  public name = '@resetmapsettings';
  public format = '';

  async execute(player: Player, { room, gameState, args }) {
    if(!SubscriptionHelper.isGM(player)) return;

    await SettingsHelper.resetMapSettings(room.mapRegion, room.mapName);
    room.loadGameSettings();
  }
}
