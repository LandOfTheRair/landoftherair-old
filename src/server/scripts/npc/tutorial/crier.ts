import { NPC } from '../../../../models/npc';
import { NPCLoader } from '../../../helpers/npc-loader';
import { RandomlyShouts, CrierResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  CrierResponses(npc);
  RandomlyShouts(npc, [
    'Yetis are the scourge of our town!',
    'Wolves are the natural predator of deer!',
    'The Hermit knows how to bring our people to salvation!',
    'Billy lost his pet moose to the wolves!',
    'You should not go far without armor or weapons!',
    'Potions can be a saving grace!'
  ]);

};
