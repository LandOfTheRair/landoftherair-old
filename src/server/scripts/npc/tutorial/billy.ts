import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/npc-loader';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      return `Aw, shucks. Have you seen my pet Moose? It's so lonely in this town, I might have to move. There are just the MERCHANTS, the HERMIT, and me.`;
    });

  npc.parser.addCommand('merchants')
    .set('syntax', ['merchants'])
    .set('logic', (args, { player }) => {
      return `Yeah. The building to the south of here has some merchants. They sell armor, weapons, and potions. Nothin' there for a kid like me, though.`;
    });

  npc.parser.addCommand('hermit')
    .set('syntax', ['hermit'])
    .set('logic', (args, { player }) => {
      return `Old man Hermit is off in the distant house, northwest of here. I hear he has the key to let people out of this forsaken town, whatever that means.`;
    });

};
