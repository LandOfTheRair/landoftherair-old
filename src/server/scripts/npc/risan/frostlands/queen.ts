import { NPC } from '../../../../../shared/models/npc';

import { includes } from 'lodash';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Undecided Simple Machleum Ring');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Frostlands Noble Robe');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 1) return 'Please move closer.';
      if(player.level < 25) return 'Greets! Too weak! Come back when strong like king!';

      const item = player.rightHand;
      const mod = player.leftHand;

      const mergeItems = (newRing, oldRing) => {
        Object.keys(oldRing.stats).forEach(stat => {
          if(!newRing.stats[stat]) newRing.stats[stat] = 0;
          newRing.stats[stat] += oldRing.stats[stat];
        });
      };

      if(item) {
        if(item.name === 'Basic Machleum Ring') {
          if(!mod || mod.name !== 'Risan Frost Larimar') return 'Ring and gem! Need both!';

          npc.$$room.npcLoader.loadItem(`${player.baseClass} Simple Machleum Ring`)
            .then(newItem => {
              mergeItems(newItem, player.rightHand);
              player.setRightHand(newItem);
              player.setLeftHand(null);
            });

          return 'Good! Here, have ring. Want better? Bring ether red gem. More tricks to share, yes yes!';
        }

        if(includes(item.name, 'Simple Machleum Ring')) {
          if(!mod || mod.name !== 'Risan Ether Larimar') return 'Ring and gem! Need both!';

          npc.$$room.npcLoader.loadItem(`${player.baseClass} Double Machleum Ring`)
            .then(newItem => {
              mergeItems(newItem, player.rightHand);
              player.setRightHand(newItem);
              player.setLeftHand(null);
            });

          return 'Good! Here, new ring. Best ring in kingdom, probably. Best jeweler, yes!';
        }

        return 'Hold ring and gem!';
      }

      return `Greets, adventurer! Am Risa IV, queen of Risan! Also like making jewelry. 
      Machleum make good ring, bring machleum ring and gem that emanates frost - yetis value highly!`;
    });
};
