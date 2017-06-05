
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

    const wasSuccess = cmd.execute(player, args);
    if(wasSuccess === false) {
      const { room, client } = args;
      room.sendClientLogMessage(client, `Invalid format. Format: ${command} ${cmd.format}`);
    }

    return true;
  }

}
