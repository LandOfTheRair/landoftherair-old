import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/character/npc-loader';
import { BaseClassTrainerResponses, RecallerResponses, ReviverResponses } from '../common-responses';
import { SkillClassNames } from '../../../../shared/models/character';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Studded Tunic');
  npc.rightHand = await NPCLoader.loadItem('Antanian Staff');
  npc.classTrain = 'Healer';
  npc.trainSkills = [SkillClassNames.Restoration, SkillClassNames.Mace, SkillClassNames.Staff];
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  BaseClassTrainerResponses(npc);
  RecallerResponses(npc);
  ReviverResponses(npc);
};
