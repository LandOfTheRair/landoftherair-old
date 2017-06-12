
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

export class LookAt extends Command {

  public name = 'look_at';
  public format = 'TARGET';

  execute(player: Player, { room, client, args }) {
    if(!args) return false;

    const possTargets = room.getPossibleMessageTargets(player, args);
    const target = possTargets[0];
    if(!target) return room.sendClientLogMessage(client, 'You do not see that person.');;

    const chestItem = target.gear.Robe2 || target.gear.Robe1 || target.gear.Armor;
    const chestDesc = chestItem ? chestItem.desc : 'nothing';

    const leftDesc = target.leftHand ? target.leftHand.desc : '';
    const rightDesc = target.rightHand ? target.rightHand.desc : '';

    let handDesc = '';
    if(!leftDesc && !rightDesc) {
      handDesc = 'nothing';
    } else if(leftDesc && rightDesc) {
      handDesc = `${leftDesc} and ${rightDesc}`;
    } else {
      handDesc = leftDesc || rightDesc;
    }

    const description = `You are looking at a ${target.ageString} being named ${target.name}. ${target.name} is wearing ${chestDesc} and holding ${handDesc}.`;

    room.sendClientLogMessage(client, description);
  }

}
