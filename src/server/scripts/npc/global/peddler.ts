import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/npc-loader';
import { RandomlyShouts, PeddlerResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem(npc.peddleItem);
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
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
