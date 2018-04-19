import { NPC } from '../../../../shared/models/npc';
import { SpellforgingResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.rightHand = await npc.$$room.npcLoader.loadItem('Saraxa Wand');
};

export const responses = (npc: NPC) => {
  SpellforgingResponses(npc);
};
