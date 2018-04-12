
export class TraitUsageModifiers {

  public static getTraitLevelAndUsageModifier(trait: string, level: number): number {

    switch(trait) {
      case 'DarkerShadows':       return level * 2;
      case 'ShadowSheath':        return level;
      case 'IrresistibleStuns':   return level;
      case 'PhilosophersStone':   return level * 10;
      case 'DeathGrip':           return Math.min(100, level * 5);
      case 'ShadowSwap':          return Math.min(100, level * 2);
      case 'ShadowDaggers':       return level;
      case 'ForgedFire':          return level;
      case 'FrostedTouch':        return level;
      case 'Riposte':             return level;
      case 'CarefulTouch':        return Math.min(0.95, level * 0.1);
      case 'EffectiveSupporter':  return level * 0.1;
      case 'OffhandFinesse':      return level * 0.1;
      case 'MagicFocus':          return level * 10;
      case 'NecroticFocus':       return level * 10;
      case 'HealingFocus':        return level * 10;
      case 'ForcefulStrike':      return level * 10;
      case 'ShadowRanger':        return level * 10;

      case 'FriendlyFire':        return level * 10;
      case 'ThermalBarrier':      return level * 0.1;
      case 'CalmMind':            return level * 2;
      case 'NaturalArmor':        return level * 2;
      case 'ManaPool':            return level * 10;
      case 'StrongMind':          return level * 0.1;
      case 'NatureSpirit':        return level * 0.05;

      case 'GlacierStanceImproved':     return level * 0.1;
      case 'VolcanoStanceImproved':     return level * 0.1;
      case 'PartyManaRegeneration':     return level * 2;
      case 'PartyHealthRegeneration':   return level * 2;

      default: return level;
    }
  }
}
