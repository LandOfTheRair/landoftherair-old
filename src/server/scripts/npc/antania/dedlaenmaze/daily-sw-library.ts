import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem('Antanian Longsword');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Breastplate');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
};
