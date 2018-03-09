
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

import { AllTraits } from '../../../../shared/traits/trait-hash';

export class Trait extends Command {

  public name = '~trait';
  public format = 'TraitCategory TraitName';

  execute(player: Player, { args }) {
    if(!args) return false;

    const [category, name] = args.split(' ');
    if(!category || !name || !AllTraits[category] || !AllTraits[category][name]) return false;

    const trait = AllTraits[category][name];

    if(!trait.canBuy(player)) return player.sendClientMessage('You cannot buy that trait.');

    trait.buy(player, { category, name });
  }

}
