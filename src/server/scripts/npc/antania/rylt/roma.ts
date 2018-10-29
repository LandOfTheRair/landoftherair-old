import { NPC } from '../../../../../shared/models/npc';

import { RenegadeFeathers } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Deer Robe');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(npc.$$room.npcLoader.checkPlayerHeldItem(player, 'Deer Robe', 'right')) {

        const item = player.rightHand;
        if(item.stats.defense > 1) return 'It looks like I have already upgraded that robe. Bring me a fresh one any time!';

        item.stats.defense++;

        player.recalculateStats();

        return `Thanks, ${player.name}! I've upgraded your robe! Good luck out there!`;
      }

      return `Greetings, adventurer! One of the best things you can do for yourself right now is learn how to TAN creatures.`;
    });

  npc.parser.addCommand('tan')
    .set('syntax', ['tan'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      return `Yes! Many creatures have value beyond killing them, you can take their corpses to the tanner in the south of town. 
      He can tan their hides and give you some armor in return.
      Interested? Bring me the tanned hide of a deer and I'll upgrade it for you.`;
    });

};
