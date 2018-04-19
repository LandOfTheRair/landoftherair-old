import { NPC } from '../../../../shared/models/npc';
import { DiplomatResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
};

export const responses = (npc: NPC) => {
  DiplomatResponses(npc);
};
