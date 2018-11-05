import { NPC } from '../../../../shared/models/npc';
import { AutoRevives, BaseClassTrainerResponses, RecallerResponses, ReviverResponses } from '../common-responses';
import { SkillClassNames } from '../../../../shared/interfaces/character';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Master of Tradeskills';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.classTrain = 'Undecided';
  npc.trainSkills = [SkillClassNames.Alchemy, SkillClassNames.Spellforging, SkillClassNames.Runewriting, SkillClassNames.Metalworking, SkillClassNames.Survival];
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  BaseClassTrainerResponses(npc);
};
