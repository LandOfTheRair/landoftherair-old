
import * as Commands from '../scripts/commands';
import { Player } from '../../shared/models/player';

import { isArray, startsWith, includes } from 'lodash';
import { Skill } from '../base/Skill';
import { Command } from '../base/Command';
import { Character } from '../../shared/models/character';

const commandHash = {};
const skillHash = {};

Object.keys(Commands).forEach(cmd => {
  const command = new Commands[cmd];

  let names = command.name;

  const addToHash = (hash, name, addCommand) => {
    if(hash[name]) throw new Error(`Error: Skill/Command ${name} already exists (bound to ${hash[name].constructor.name})`);
    hash[name] = addCommand;
  };

  // a monster skill has no name
  if(!command.name) {
    addToHash(skillHash, cmd.toLowerCase(), command);
  }

  if(!isArray(command.name)) {
    names = [command.name];
  }

  names.forEach(name => {
    addToHash(commandHash, name, command);
    if(command instanceof Skill) {
      addToHash(skillHash, name, command);
    }
  });
});

export class CommandExecutor {

  // NPC ONLY
  static checkIfCanUseSkill(skillName, user: Character, target: Character) {
    const skill = CommandExecutor.getSkillRef(skillName);
    if(!skill) return false;
    return skill.canUse(user, target) ? skill : null;
  }

  static getSkillRef(skillName) {
    return skillHash[skillName.toLowerCase()];
  }

  // command queuing for players
  static async queueCommand(player: Player, command: string, args: any) {

    if(!player) return;

    const wasSuccess = await this._queueCommand(player, command, args);

    // explicit check
    if(wasSuccess === false) {
      player.sendClientMessage(`Command "${command}" is invalid.`);
    }
  }

  static async _queueCommand(player: Player, command: string, args: any) {
    const cmd: Command = commandHash[command];
    if(!cmd) return false;

    // wat?
    if(!player) return;

    if(startsWith(command, '@') || startsWith(command, '~~')) {
      return this.executeCommand(player, command, args);
    }

    const allowedDeadCommands = ['restore', '~look'];

    if(!includes(allowedDeadCommands, command) && player.isDead()) {
      player.sendClientMessage(`Your corpse can't do that.`);
      return;
    }

    if(startsWith(command, '~') && !player.isUnableToAct()) {
      return await this.executeCommand(player, command, args);
    } else {
      player.queueAction({ command, args: args.args });
      return true;
    }
  }

  static async executeCommand(player: Player, command: string, args: any) {
    const cmd: Command = commandHash[command];
    if(!cmd) return false;

    const spell = command.split(' ')[1];
    const hasLearned = player.hasLearned(spell || '');
    if(cmd.requiresLearn && !hasLearned) return player.sendClientMessage('You do not know that spell!');

    if(hasLearned.effect) args.effect = hasLearned.effect;

    const wasSuccess = await cmd.execute(player, args);
    if(wasSuccess === false) {
      player.sendClientMessage(`Invalid format. Format: ${command} ${cmd.format}`);
    } else {
      player.manageTraitPointPotentialGain(command);
    }

    return true;
  }

}
