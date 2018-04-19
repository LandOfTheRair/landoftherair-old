import { NPC } from '../../../../shared/models/npc';
import { BaseClassTrainerResponses } from '../common-responses';
import { SkillClassNames } from '../../../../shared/models/character';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Shortsword');
  npc.classTrain = 'Mage';
  npc.trainSkills = [SkillClassNames.Conjuration, SkillClassNames.Wand, SkillClassNames.Shortsword];
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  BaseClassTrainerResponses(npc);
};
