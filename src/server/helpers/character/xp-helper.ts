
// after this point, XP required will be a constant value based on this levels required XP
const FIRST_LEVEL_CONSTANT_CHANGER = 19;

export class XPHelper {
  static calcLevelXP(level: number): number {
    const pre20XP = Math.pow(2, Math.min(FIRST_LEVEL_CONSTANT_CHANGER, level - 1)) * 1000;

    if(level <= FIRST_LEVEL_CONSTANT_CHANGER) {
      return pre20XP;
    }

    if(level <= 50) {
      return pre20XP * (Math.max(1, level - FIRST_LEVEL_CONSTANT_CHANGER));
    }

    return 99999999999999999999999 * level;
  }
}
