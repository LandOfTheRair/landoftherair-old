
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class Trait extends Command {

  public name = '~trait';
  public format = 'TraitName';

  execute(player: Player, { args }) {
    if(!args) return false;

    const traitName = args;
    if(!player.skillTree.isAvailableToBuy(traitName)) {
      player.sendClientMessage('You cannot buy that trait!');
      return;
    }

    if(!player.skillTree.hasEnoughPointsToBuy(traitName)) {
      player.sendClientMessage('You do not have enough points to buy that trait!');
      return;
    }

    if(!player.skillTree.isCapableOfBuying(traitName, player)) {
      player.sendClientMessage('You do not meet the requirements to buy that trait!');
      return;
    }

    const ref = player.skillTree.linkBuyableNodeToRealNode(traitName);

    // is trait
    if(ref.traitName) {
      player.skillTree.buyTrait(player, ref.name, ref.traitName);

    // is skill
    } else {
      player.skillTree.buySkill(player, ref.name);

    }

    player.$$room.updateSkillTree(player);
    player.saveSkillTree();
  }

}
