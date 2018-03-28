
import { Character } from '../../../shared/models/character';
import { DefaultAIBehavior } from './default';
import { CombatHelper } from '../../helpers/world/combat-helper';

export class CrazedSedgwickAIBehavior extends DefaultAIBehavior {

  private trigger75 = false;
  private trigger50 = false;
  private trigger25 = false;

  private blast() {
    const npc = this.npc;

    const msgObject = { name: npc.name, message: `HIYAAAAAAAAAH! Take THIS!`, subClass: 'chatter' };
    npc.sendClientMessageToRadius(msgObject, 10);

    const players = npc.$$room.state.getPlayersInRange(npc, 10);

    players.forEach(player => {
      if(player.x === 21 && player.y === 6) {
        player.sendClientMessage('A magical barrier protects you from Sedgwick\'s magic!');
        return;
      }

      CombatHelper.magicalAttack(npc, player, {
        atkMsg: `You blast ${player.name} with a wave of energy!`,
        defMsg: `${npc.name} blasted you with a wave of energy!`,
        damage: 1500,
        damageClass: 'energy'
      });
    });
  };

  mechanicTick() {
    const npc = this.npc;

    if(!this.trigger75 && npc.hp.ltePercent(75)) {
      this.trigger75 = true;

      setTimeout(() => {
        this.blast();
      }, 2000);
    }

    if(!this.trigger50 && npc.hp.ltePercent(50)) {
      this.trigger50 = true;

      setTimeout(() => {
        this.blast();
      }, 2000);
    }

    if(!this.trigger25 && npc.hp.ltePercent(25)) {
      this.trigger25 = true;

      setTimeout(() => {
        this.blast();
      }, 2000);
    }
  }

  death(killer: Character) {
    const npc = this.npc;

    const msgObject = { name: npc.name, message: `Curse you, ${killer.name}! Curse you to your grave!`, subClass: 'chatter' };
    npc.sendClientMessageToRadius(msgObject, 50);
    npc.sendClientMessageToRadius('You hear a lock click in the distance.', 50);

    npc.$$room.state.getInteractableByName('Chest Door').properties.requireLockpick = false;
  };

}
