
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { CombatHelper } from '../../../helpers/combat-helper';
import { MessageHelper } from '../../../helpers/message-helper';

export class GMKill extends Command {

  public name = '@kill';
  public format = 'Target';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    const possTargets = MessageHelper.getPossibleMessageTargets(player, args);
    if(!possTargets.length) return player.sendClientMessage('You do not see that person.');

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
