import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/character/npc-loader';
import { BaseClassTrainerResponses } from '../common-responses';
import { SkillClassNames } from '../../../../shared/models/character';

const learnedSkills = { Conjuration: {
  1: ['MagicMissile'],
  2: ['Identify'],
  3: ['TrueSight'],
  4: ['BarFire', 'BarFrost'],
  5: ['BarWater'],
  6: ['FireMist'],
  7: ['IceMist'],
  8: ['Transmute', 'MagicBolt'],
  9: ['EnergyWave'],
  10: ['Darkness'],
  11: ['DarkVision'],
  12: ['Push'],
  13: ['MagicShield'],
  14: ['Absorption'],
  15: ['FindFamiliar'],
  16: ['Firethorns'],
  20: ['Haste']
} };

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.rightHand = await NPCLoader.loadItem('Antanian Shortsword');
  npc.classTrain = 'Mage';
  npc.trainSkills = [SkillClassNames.Conjuration, SkillClassNames.Wand, SkillClassNames.Shortsword];
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  BaseClassTrainerResponses(npc, learnedSkills);
};
