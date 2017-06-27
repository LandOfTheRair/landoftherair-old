
import * as Commands from '../scripts/commands';
import { Player } from '../../models/player';

import { isArray, startsWith } from 'lodash';
import { Skill } from '../base/Skill';

const commandHash = {};
const skillHash = {};

Object.keys(Commands).forEach(cmd => {
  const command = new Commands[cmd];

  let names = command.name;

  if(!isArray(command.name)) {
    names = [command.name];
  }

  names.forEach(name => {
    commandHash[name] = command;
    if(command instanceof Skill) {
      skillHash[name] = command;
    }
  });
});

export class CommandExecutor {

  static checkIfCanUseSkill(skillName, user, target) {
    const skill = skillHash[skillName.toLowerCase()];
    if(!skill) return false;
    return skill.canUse(user, target) ? skill : null;
  }

  static queueCommand(player: Player, command: string, args: any) {

    const wasSuccess = this._queueCommand(player, command, args);

    // explicit check
    if(wasSuccess === false) {
      player.sendClientMessage(`Command "${command}" is invalid. Try again.`);
    }
  }

  static _queueCommand(player: Player, command: string, args: any) {
    const cmd = commandHash[command];
    if(!cmd) return false;

    // wat?
    if(!player) return;

    if(command !== 'restore' && player.isDead()) {
      player.sendClientMessage(`Your corpse can't do that.`);
      return;
    }

    if(startsWith(command, '~')) {
      return this.executeCommand(player, command, args);
    } else {
      player.queueAction({ command, args: args.args });
      return true;
    }
  }

  static executeCommand(player: Player, command: string, args: any) {
    const cmd = commandHash[command];
    if(!cmd) return false;

    const hasLearned = player.hasLearned(command);
    if(cmd.requiresLearn && !hasLearned) return player.sendClientMessage('You do not know that spell!');

    if(hasLearned.effect) args.effect = hasLearned.effect;

    const wasSuccess = cmd.execute(player, args);
    if(wasSuccess === false) {
      player.sendClientMessage(`Invalid format. Format: ${command} ${cmd.format}`);
    }

    return true;
  }

}
