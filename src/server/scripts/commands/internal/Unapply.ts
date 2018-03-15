
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class Unapply extends Command {

  public name = '~unapply';
  public format = 'BuffName';

  execute(player: Player, { args }) {
    const effect = player.hasEffect(args);
    if(!effect) return player.sendClientMessage('You do not have that buff!');

    if(!effect.canBeUnapplied()) return;

    player.unapplyEffect(effect, true);
  }

}
