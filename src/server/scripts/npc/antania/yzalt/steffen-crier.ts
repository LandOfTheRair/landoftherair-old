import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';
import { RandomlyShouts, CrierResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  CrierResponses(npc);
  RandomlyShouts(npc, [
    'You should not go far without armor or weapons!',
    'The Alchemist can make your potions last longer!',
    'Thieves prefer to hide!',
    'The Banker can hold onto your gold!',
    'The Smith can repair your broken and breaking gear!',
    'There are tales of a renegade who collects books!',
    'Try asking the Healer to RECALL you!',
    'The Healer can REVIVE your comrades!',
    'Rumors speak of a wandering Botanist with beneficial abilities!',
    'The Steffen are the natural enemy of the Heniz!',
    'Below the sewers there is rumored to be an asylum!',
    'There is supposedly a clandestine enclave of neutral dissenters!'
  ]);

};
