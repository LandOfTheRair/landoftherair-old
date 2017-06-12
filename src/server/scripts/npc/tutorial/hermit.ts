import { NPC } from '../../../../models/npc';
import { NPCLoader } from '../../../helpers/npc-loader';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.leftHand = await NPCLoader.loadItem('Tutorial Yeti Skull');
  npc.rightHand = await NPCLoader.loadItem('Tutorial Key');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

};
