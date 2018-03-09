
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class Write extends Command {

  public name = 'write';
  public format = 'Message';

  execute(player: Player, { args }) {
    if(!args) return false;

    const right = player.rightHand;
    const left = player.leftHand;

    if(!right || right.desc !== 'an empty scroll') return player.sendClientMessage('You need an empty scroll in your right hand!');
    if(!left || left.name !== 'Ink Vial')  return player.sendClientMessage('You need an ink pot in your left hand!');

    right.desc = `a scroll inscribed with text written in ink: "${args}"`;

    player.useItem('leftHand');

    player.sendClientMessage('You have scribed your message successfully.');
  }

}
