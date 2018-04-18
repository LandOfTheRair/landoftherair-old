
import { GameWorld } from '../../../../rooms/GameWorld';
import { FireMist } from '../../../../effects/damagers/FireMist';
import { NPC } from '../../../../../shared/models/npc';
import { Player } from '../../../../../shared/models/player';
import { SpellEffect } from '../../../../base/Effect';
import { Character } from '../../../../../shared/models/character';
import { CrazedSaraxaAIBehavior } from '../../../ai/crazedsaraxa';

class MinerFever extends SpellEffect {
  iconData = {
    name: 'screaming',
    color: '#f00',
    tooltipDesc: 'Temporarily lost some regenerative capacity.'
  };

  cast(caster: Character, target: Character, skillRef?, ai?: CrazedSaraxaAIBehavior) {
    this.duration = 15;
    this.potency = 10;
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    char.sendClientMessage('You feel a bit woozy.');
    char.loseStat('hpregen', this.potency);
    char.loseStat('mpregen', this.potency);
  }

  effectEnd(char: Character) {
    char.sendClientMessage('Your headache has cleared.');
    char.gainStat('hpregen', this.potency);
    char.gainStat('mpregen', this.potency);
  }
}

export const events = async (room: GameWorld) => {

  const applyDebuff = (player: Player) => {
    const minerFever = new MinerFever({});
    minerFever.cast(player, player);
  };

  const transformMiner = (npc: NPC) => {
    npc.die(npc, true);

    npc.spawner.createNPC({
      npcId: 'Risan Crazed Miner',
      createCallback: (createdNPC: NPC) => {
        createdNPC.leftHand = npc.leftHand;
        createdNPC.rightHand = npc.rightHand;
        createdNPC.x = npc.x;
        createdNPC.y = npc.y;
      }
    });
  };

  room.addEvent('on:crazedmist', ({ player }) => {
    player.sendClientMessage('You feel a rush of heat!');

    const fireMist = new FireMist({ potency: 350 });
    fireMist.cast(player, player);

    player.$$room.state.getAllInRange(player, 1, [], false).forEach(character => {
      if(character.isPlayer()) applyDebuff(player);
      if(character.npcId === 'Risan Miner') transformMiner(character);
    });
  });

};
