import { NPC } from '../../../../shared/models/npc';
import { BaseClassTrainerResponses } from '../common-responses';
import { SkillClassNames } from '../../../../shared/models/character';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Master Warrior';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Ringmail Tunic');
  npc.leftHand = await npc.$$room.npcLoader.loadItem('Antanian Wooden Shield');
  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Longsword');
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
