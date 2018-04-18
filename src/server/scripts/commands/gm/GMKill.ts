
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { CombatHelper } from '../../../helpers/world/combat-helper';
import { MessageHelper } from '../../../helpers/world/message-helper';
import { SubscriptionHelper } from '../../../helpers/account/subscription-helper';

export class GMKill extends Command {

  public name = '@kill';
  public format = 'Target';

  async execute(player: Player, { args }) {
    if(!SubscriptionHelper.isGM(player)) return;

    const possTargets = MessageHelper.getPossibleMessageTargets(player, args, false);
    if(!possTargets.length) return player.youDontSeeThatPerson(args);

    const target = possTargets[0];
    if(!target) return false;
    if(target.hostility === 'Never') return player.sendClientMessage('That target is not killable.');

    CombatHelper.dealDamage(player, target, {
      defenderDamageMessage: `${player.name} forced your insides outside.`,
      attackerDamageMessage: `You GM-killed ${target.name}.`,
      damage: target.hp.maximum,
      damageClass: 'gm'
    });
  }
}
