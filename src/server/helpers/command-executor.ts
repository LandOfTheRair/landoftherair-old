
import * as Commands from '../scripts/commands';
import { Player } from '../../models/player';

const commandHash = {};

Object.keys(Commands).forEach(cmd => {
  const command = new Commands[cmd];
  commandHash[command.name] = command;
});

export class CommandExecutor {

  static executeCommand(player: Player, command: string, args: any) {
    const cmd = commandHash[command];
    if(!cmd) return false;

    cmd.execute(player, args);
    return true;
  }

}
