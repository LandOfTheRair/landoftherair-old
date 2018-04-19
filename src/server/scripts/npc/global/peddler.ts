import { NPC } from '../../../../shared/models/npc';
import { RandomlyShouts, PeddlerResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await npc.$$room.npcLoader.loadItem(npc.peddleItem);
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  PeddlerResponses(npc);
  RandomlyShouts(npc, [
    `Come one, come all, get your ${npc.peddleItem} here! Only ${npc.peddleCost.toLocaleString()} gold!`,
    `${npc.peddleItem} for sale! Only ${npc.peddleCost.toLocaleString()} gold!`,
    `${npc.peddleCost.toLocaleString()} gold gets you a ${npc.peddleItem}! Only here, right now!`
  ]);

};
