import { NPC } from '../../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      return `Greetings, ${player.name}! It is I who can grant unto thee some temporary relief. 
      Just tell me one of these spells, and I'll fix you right up: invisibility, darkvision`;
    });

  npc.parser.addCommand('invisibility')
    .set('syntax', ['invisibility'])
    .set('logic', (args, { player }) => {
      npc.$$room.npcLoader.givePlayerEffect(player, 'Invisible', { duration: 900 });
      return `Now then, go get your DP!`;
    });

  npc.parser.addCommand('darkvision')
    .set('syntax', ['darkvision'])
    .set('logic', (args, { player }) => {
      npc.$$room.npcLoader.givePlayerEffect(player, 'DarkVision', { duration: 900 });
      return `Now then, go delve the depths!`;
    });
};
