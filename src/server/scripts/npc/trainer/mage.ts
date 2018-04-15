import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/character/npc-loader';
import { BaseClassTrainerResponses } from '../common-responses';
import { SkillClassNames } from '../../../../shared/models/character';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.rightHand = await NPCLoader.loadItem('Antanian Shortsword');
  npc.classTrain = 'Mage';
  npc.trainSkills = [SkillClassNames.Conjuration, SkillClassNames.Wand, SkillClassNames.Shortsword];
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  BaseClassTrainerResponses(npc);
};
