import { NPC } from '../../../../models/npc';
import { NPCLoader } from '../../../helpers/npc-loader';
import { BaseClassTrainerResponses, RecallerResponses } from '../common-responses';
import { SkillClassNames } from '../../../../models/character';

const learnedSkills = { Restoration: {
  1: ['Cure'],
  2: ['Afflict'],
  3: ['TrueSight'],
  4: ['Antidote'],
  5: ['Poison'],
  6: ['BarNecro']
} };

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Studded Tunic');
  npc.rightHand = await NPCLoader.loadItem('Antanian Staff');
  npc.classTrain = 'Healer';
  npc.trainSkills = [SkillClassNames.Restoration, SkillClassNames.Mace, SkillClassNames.Staff];
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  BaseClassTrainerResponses(npc, learnedSkills);
  RecallerResponses(npc);
};
