import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/npc-loader';
import { BaseClassTrainerResponses } from '../common-responses';
import { SkillClassNames } from '../../../../shared/models/character';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Ringmail Tunic');
  npc.leftHand = await NPCLoader.loadItem('Antanian Wooden Shield');
  npc.rightHand = await NPCLoader.loadItem('Antanian Longsword');
  npc.classTrain = 'Warrior';
  npc.trainSkills = [
    SkillClassNames.Axe, SkillClassNames.OneHanded, SkillClassNames.TwoHanded,
    SkillClassNames.Ranged, SkillClassNames.Martial, SkillClassNames.Polearm
  ];
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  BaseClassTrainerResponses(npc);
};
