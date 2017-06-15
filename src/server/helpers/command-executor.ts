
import * as Commands from '../scripts/commands';
import { Player } from '../../models/player';

import { isArray } from 'lodash';

const commandHash = {};

Object.keys(Commands).forEach(cmd => {
  const command = new Commands[cmd];

  let names = command.name;

  if(!isArray(command.name)) {
    names = [command.name];
  }

  names.forEach(name => {
    commandHash[name] = command;
  });
});

export class CommandExecutor {

  static executeCommand(player: Player, command: string, args: any) {
    const cmd = commandHash[command];
    if(!cmd) return false;

    const { room, client } = args;

    if(command !== 'restore' && player.isDead()) {
      room.sendClientLogMessage(client, `Your corpse can't do that.`);
      return;
    }

    const wasSuccess = cmd.execute(player, args);
    if(wasSuccess === false) {
      room.sendClientLogMessage(client, `Invalid format. Format: ${command} ${cmd.format}`);
    }

    return true;
  }

}
