import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      return `Greetings, ${player.name}! It is I who can grant unto thee some temporary relief. 
      Just tell me one of these spells, and I'll fix you right up: invisibility`;
    });


  npc.parser.addCommand('invisibility')
    .set('syntax', ['invisibility'])
    .set('logic', (args, { player }) => {
      NPCLoader.givePlayerEffect(player, 'Invisible', { duration: 900 });
      return `Now then, go get your DP!`;
    });
};
