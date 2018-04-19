import { NPC } from '../../../../shared/models/npc';
import { SmithResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Smith Hammer');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Breastplate');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  SmithResponses(npc);
};
