
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MessageHelper } from '../../../helpers/world/message-helper';

export class LookAt extends Command {

  static macroMetadata = {
    name: 'Look At',
    macro: 'look at',
    icon: 'look-at',
    color: '#8A6948',
    mode: 'clickToTarget',
    tooltipDesc: 'Look at a target, getting a full description of them and their gear.'
  };

  public name = 'look at';
  public format = 'TARGET';

  execute(player: Player, { args }) {
    if(!args) return false;

    const possTargets = MessageHelper.getPossibleMessageTargets(player, args);
    const target = possTargets[0];
    if(!target) return player.youDontSeeThatPerson(args);

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

    const description = `
    You are looking at a being named ${target.name}. 
    ${target.name} is of ${(target.alignment || 'unknown').toLowerCase()} alignment. 
    ${target.name} is wearing ${chestDesc} and holding ${handDesc}.`;

    player.sendClientMessage(description);
  }

}
