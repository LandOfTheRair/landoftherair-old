
import { some } from 'lodash';

import { NPC } from '../../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Apprentice Tailor';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      const CLOAK = `Forest Spirit ${player.baseClass} Cloak`;

      if(player.rightHand && player.rightHand.name === 'Dedlaen Crypt Thing Sash'
      && player.leftHand && player.leftHand.name === CLOAK) {

        if(some(['wis', 'int', 'str', 'agi', 'hp'], stat => player.rightHand.stats[stat] >= 2)) return 'Too strong! Can\'t help!';

        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, CLOAK);

        const hash = {
          Undecided: 'hp',
          Mage: 'int',
          Healer: 'wis',
          Warrior: 'str',
          Thief: 'agi'
        };

        const upStat = hash[player.baseClass];
        player.rightHand.stats[upStat] = player.rightHand.stats[upStat] || 0;
        player.rightHand.stats[upStat] += upStat === 'hp' ? 100 : 1;

        return `Welcome! Sash better!`;
      }

      return `Greet! Seek sash of strange teleporting creature and cloak of forest spirit. Can make sash better!`;
    });
};
