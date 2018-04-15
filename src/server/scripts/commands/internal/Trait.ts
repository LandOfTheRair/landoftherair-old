
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class Trait extends Command {

  public name = '~trait';
  public format = 'TraitName';

  execute(player: Player, { args }) {
    if(!args) return false;

    const traitName = args;

    if(player.skillTree.isBought(traitName)) {

      if(!player.skillTree.hasEnoughPointsToRefund()) {
        player.sendClientMessage('You do not have enough reset points to refund that trait!');
        return;
      }

      if(!player.skillTree.isCapableOfRefunding(traitName)) {
        player.sendClientMessage('You must first refund the children nodes to refund that!');
        return;
      }

      player.skillTree.refundNode(player, traitName);

      player.$$room.updateSkillTree(player);
      player.saveSkillTree();

      return;
    }

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

    player.skillTree.buyNode(player, traitName);

    player.$$room.updateSkillTree(player);
    player.saveSkillTree();
  }

}
