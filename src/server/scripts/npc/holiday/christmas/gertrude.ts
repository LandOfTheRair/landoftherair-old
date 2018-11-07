import { NPC } from '../../../../../shared/models/npc';
import { Currency } from '../../../../../shared/interfaces/holiday';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Frosty Friends';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(npc.$$room.npcLoader.checkPlayerHeldItem(player, 'Christmas Gingerbread')) {
        npc.$$room.npcLoader.takePlayerItem(player, 'Christmas Gingerbread');

        player.earnCurrency(Currency.Christmas, 15, 'Gertrude');
        player.sendClientMessage({ message: `Mrs. Claus hands you 15 holiday tokens!`, grouping: 'always' });

        return 'Why thank you! This... should... work... I hope!';
      }

      return `Ah, a foreigner. Welcome to our wonderland! I\'m trying to find some baked goods for my missing man\'s return... but I\'m rubbish at baking. 
      Can you bring me some baked goods?`;
    });
};
