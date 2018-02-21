
import { Player } from '../../shared/models/player';
import { Character } from '../../shared/models/character';

const SKILL_COEFFICIENT = 1.55;

export class SkillHelper {
  static calcSkillXP(level: number) {
    if(level === 0) return 100;
    // if(level === 1) return 200;

    return Math.floor(Math.pow(SKILL_COEFFICIENT, level) * 100);
  }

  static calcSkillLevel(player: Character, type: string) {
    const skillValue = player.allSkills[type.toLowerCase()] || 0;
    if(skillValue < 100) return 0;
    // if(skillValue < 200) return 1;

    const value = Math.log(skillValue / 100) / Math.log(SKILL_COEFFICIENT);
    return 1 + Math.floor(value);
  }

  static assess(player: Player, skill: string): string {
    skill = skill.toLowerCase();

    const skillValue = player.allSkills[skill] || 0;
    const skillLevel = player.calcSkillLevel(skill);

    const nextLevel = skillLevel === 0 ? 100 : this.calcSkillXP(skillLevel);
    const prevLevel = skillLevel === 0 ? 0 : this.calcSkillXP(skillLevel - 1);

    const normalizedCurrent = skillValue - prevLevel;
    const normalizedMax = nextLevel - prevLevel;

    const percentWay = Math.max(0, (normalizedCurrent / normalizedMax * 100)).toFixed(3);

    return percentWay;
  }
}
