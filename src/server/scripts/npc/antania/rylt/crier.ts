import { NPC } from '../../../../../models/npc';
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
    'Wolves are the natural predator of deer!',
    'You should not go far without armor or weapons!',
    'Potions can be a saving grace!',
    'The Alchemist can make your potions last longer!',
    'The Renegade camp in the southeast is full of dangerous brigands!',
    'The cave to the east is filled with practitioners of magic!',
    'Thieves prefer to hide!',
    'The Banker can hold onto your gold!',
    'The Smith can repair your broken and breaking gear!'
  ]);

};
