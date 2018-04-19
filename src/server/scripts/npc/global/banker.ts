import { NPC } from '../../../../shared/models/npc';
import { BankResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.rightHand = await npc.$$room.npcLoader.loadItem('Gold Coin');
};

export const responses = (npc: NPC) => {
  BankResponses(npc);
};
