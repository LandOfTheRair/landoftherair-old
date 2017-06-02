
import * as Commands from '../scripts/commands';
import { Player } from '../../models/player';

const commandHash = {};

Object.keys(Commands).forEach(cmd => {
  const command = new Commands[cmd];
  commandHash[command.name] = command;
});

export class CommandExecutor {

  static executeCommand(client: any, player: Player, command: string, args: any) {
    const cmd = commandHash[command];
    if(!cmd) return false;

    cmd.execute(client, player, args);
    return true;
  }

}
