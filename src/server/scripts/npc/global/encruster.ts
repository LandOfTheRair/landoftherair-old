import { NPC } from '../../../../shared/models/npc';
import { EncrusterResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Encruster\'s Guild';
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Purple Gem');
};

export const responses = (npc: NPC) => {
  EncrusterResponses(npc);
};
