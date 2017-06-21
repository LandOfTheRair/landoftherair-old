import { NPC } from '../../../../models/npc';
import { NPCLoader } from '../../../helpers/npc-loader';
import { BaseClassTrainerResponses, RecallerResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Studded Tunic');
  npc.rightHand = await NPCLoader.loadItem('Antanian Staff');
  npc.classTrain = 'Healer';
  npc.trainSkills = ['Restoration', 'Mace', 'Staff'];
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  BaseClassTrainerResponses(npc);
  RecallerResponses(npc);
};
