
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { ItemCreator } from '../../../helpers/item-creator';

export class GMGainSkill extends Command {

  public name = '@skill';
  public format = 'SkillName Amount';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    const [skillname, amount] = args.split(' ');
    if(!player.isValidSkill(skillname)) return false;

    const skillGain = +amount;
    player._gainSkill(skillname, skillGain);
  }
}
