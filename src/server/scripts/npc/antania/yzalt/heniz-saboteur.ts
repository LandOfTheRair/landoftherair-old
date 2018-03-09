import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.allegiance = 'Pirates';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', () => {
      return `Psssst. I dug a tunnel all the way to the Steffen Sewers. The entrance is just south of this building.`;
    });

};
