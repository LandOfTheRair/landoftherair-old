import { NPC } from '../../../../shared/models/npc';
import { AlchemistResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Alchemist\'s Guild';
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.rightHand = await npc.$$room.npcLoader.loadItem('Mend Bottle');
};

export const responses = (npc: NPC) => {
  AlchemistResponses(npc);
};
