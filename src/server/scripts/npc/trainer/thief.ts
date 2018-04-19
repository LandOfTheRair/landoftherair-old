import { NPC } from '../../../../shared/models/npc';
import { BaseClassTrainerResponses } from '../common-responses';
import { SkillClassNames } from '../../../../shared/models/character';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Scalemail Tunic');
  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Dagger');
  npc.classTrain = 'Thief';
  npc.trainSkills = [SkillClassNames.Thievery, SkillClassNames.Dagger, SkillClassNames.Throwing];
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  BaseClassTrainerResponses(npc);
};
