
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SettingsHelper } from '../../../helpers/settings-helper';

export class GMSettingsUpdate extends Command {

  public name = '@updatemapsettings';
  public format = 'Propsish...';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;
    if(!args) return false;

    const mergeObj = this.getMergeObjectFromArgs(args);

    Object.keys(mergeObj).forEach(key => {
      // validate key
      if(SettingsHelper.isSettingValid(key)) return;
      delete mergeObj[key];
      player.sendClientMessage(`Setting ${key} is invalid. Removing.`);
    });

    await SettingsHelper.saveMapSettings(room.mapRegion, room.mapName, mergeObj);
    room.loadGameSettings();
  }
}
