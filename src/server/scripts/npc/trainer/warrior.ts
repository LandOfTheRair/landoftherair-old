import { NPC } from '../../../../models/npc';
import { NPCLoader } from '../../../helpers/npc-loader';
import { BaseClassTrainerResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Ringmail Tunic');
  npc.leftHand = await NPCLoader.loadItem('Antanian Wooden Shield');
  npc.rightHand = await NPCLoader.loadItem('Antanian Longsword');
  npc.classTrain = 'Warrior';
  npc.trainSkills = ['Axe', 'Onehanded', 'Twohanded', 'Ranged', 'Martial', 'Polearm'];
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  BaseClassTrainerResponses(npc);
};
