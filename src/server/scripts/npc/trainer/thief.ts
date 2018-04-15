import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/character/npc-loader';
import { BaseClassTrainerResponses } from '../common-responses';
import { SkillClassNames } from '../../../../shared/models/character';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Scalemail Tunic');
  npc.rightHand = await NPCLoader.loadItem('Antanian Dagger');
  npc.classTrain = 'Thief';
  npc.trainSkills = [SkillClassNames.Thievery, SkillClassNames.Dagger, SkillClassNames.Throwing];
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  BaseClassTrainerResponses(npc);
};
