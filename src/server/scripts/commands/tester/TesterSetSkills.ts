
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { TesterHelper } from '../../../helpers/tester/tester-helper';

export class TesterSetSkills extends Command {

  public name = '^skills';
  public format = 'SkillLevel';

  async execute(player: Player, { args }) {
    if(!player.$$room.subscriptionHelper.isGM(player) && !player.$$room.subscriptionHelper.isTester(player)) return;

    const level = +args;
    if(level < 1 || isNaN(level)) return false;

    TesterHelper.setSkills(player, level);
  }

}
