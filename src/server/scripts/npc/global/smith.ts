import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/npc-loader';
import { SmithResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem('Smith Hammer');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Breastplate');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  SmithResponses(npc);
};
