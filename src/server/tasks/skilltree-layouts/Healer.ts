
const HEALER_TREE = {
  Healer: {
    icon: 'abstract-041',
    desc: 'The Healer is a class focused on keeping its allies and itself alive.',
    unbuyable: true,
    root: true,
    unlocks: ['Cure', 'PartyHealthRegeneration0', 'CalmMind0', 'ManaPool0', 'CarefulTouch0', 'DeathGrip0', 'NaturalArmor0']
  },

  // TRAITS
  PartyHealthRegeneration0: {
    unlocks: ['PartyHealthRegeneration1']
  },
  PartyHealthRegeneration1: {
    unlocks: ['PartyHealthRegeneration2']
  },
  PartyHealthRegeneration2: {

  },

  CalmMind0: {
    unlocks: ['CalmMind1']
  },
  CalmMind1: {
    unlocks: ['CalmMind2']
  },
  CalmMind2: {

  },

  ManaPool0: {
    unlocks: ['ManaPool1']
  },
  ManaPool1: {
    unlocks: ['ManaPool2']
  },
  ManaPool2: {

  },

  CarefulTouch0: {
    unlocks: ['CarefulTouch1']
  },
  CarefulTouch1: {
    unlocks: ['CarefulTouch2']
  },
  CarefulTouch2: {

  },

  DeathGrip0: {
    unlocks: ['DeathGrip1']
  },
  DeathGrip1: {
    unlocks: ['DeathGrip2']
  },
  DeathGrip2: {

  },

  NaturalArmor0: {
    unlocks: ['NaturalArmor1']
  },
  NaturalArmor1: {
    unlocks: ['NaturalArmor2']
  },
  NaturalArmor2: {

  },

  HealingFocus0: {
    unlocks: ['HealingFocus1']
  },
  HealingFocus1: {
    unlocks: ['HealingFocus2', 'Succor']
  },
  HealingFocus2: {
    unlocks: ['HealingFocus3']
  },
  HealingFocus3: {
    unlocks: ['HealingFocus4', 'Revive']
  },
  HealingFocus4: {
    unlocks: ['HealingFocus5']
  },
  HealingFocus5: {
    unlocks: ['HealingFocus6', 'Wellspring']
  },
  HealingFocus6: {
    unlocks: ['HealingFocus7', 'PowerwordHeal']
  },
  HealingFocus7: {
    unlocks: ['VitalEssence']
  },

  // SKILLS
  Cure: {
    unlocks: ['HealingFocus0']
  },

  Succor: {

  },

  PowerwordHeal: {

  },

  Wellspring: {

  },

  VitalEssence: {

  },

  Revive: {

  }
};

const DRUID_TREE = {
  Druid: {
    icon: 'abstract-097',
    desc: 'The Druid is a class focused on debuffing enemies and cleansing debuffs from allies.',
    unbuyable: true,
    root: true,
    unlocks: ['NatureSpirit0', 'NatureSpirit1', 'NatureSpirit2', 'NatureSpirit3', 'NatureSpirit4']
  },

  // TRAITS
  NatureSpirit0: {
    unlocks: ['Antidote']
  },
  NatureSpirit1: {
    unlocks: ['Vision']
  },
  NatureSpirit2: {
    unlocks: ['Stun']
  },
  NatureSpirit3: {
    unlocks: ['Snare']
  },
  NatureSpirit4: {
    unlocks: ['Augury', 'FindFamiliar']
  },

  IrresistibleStuns0: {
    unlocks: ['IrresistibleStuns1']
  },
  IrresistibleStuns1: {
    unlocks: ['IrresistibleStuns2']
  },
  IrresistibleStuns2: {

  },

  StrongerSnare0: {

  },

  CripplingPlague0: {

  },

  DebilitatingDisease0: {

  },

  FindFamiliarNature0: {

  },

  FindFamiliarLight0: {

  },

  FindFamiliarWater0: {

  },

  // SKILLS
  Antidote: {
    unlocks: ['Plague', 'Disease']
  },

  Plague: {
    unlocks: ['CripplingPlague0']
  },

  Disease: {
    unlocks: ['DebilitatingDisease0']
  },

  Vision: {
    unlocks: ['Blind']
  },

  Blind: {

  },

  Stun: {
    unlocks: ['IrresistibleStuns0']
  },

  Snare: {
    unlocks: ['StrongerSnare0']
  },

  Augury: {

  },

  FindFamiliar: {
    unlocks: ['FindFamiliarNature0', 'FindFamiliarLight0', 'FindFamiliarWater0']
  },
};

const BARD_TREE = {
  Bard: {
    icon: 'abstract-047',
    desc: 'The Bard is a class focused on buffing allies, using a wide array of protection and healing-related spells.',
    unbuyable: true,
    root: true,
    unlocks: ['EffectiveSupporter0', 'TrueSight']
  },

  // TRAITS
  EffectiveSupporter0: {
    unlocks: ['EffectiveSupporter1', 'Aid']
  },
  EffectiveSupporter1: {
    unlocks: ['EffectiveSupporter2']
  },
  EffectiveSupporter2: {
    unlocks: ['Secondwind']
  },

  RegenerativeRefrain0: {

  },

  ImprovedAutoheal0: {

  },

  // SKILLS
  TrueSight: {
    unlocks: ['BarNecro', 'BarFrost', 'BarFire', 'Regen']
  },

  BarNecro: {
    unlocks: ['PowerwordBarNecro']
  },

  PowerwordBarNecro: {

  },

  BarFire: {
    unlocks: ['PowerwordBarFire']
  },

  PowerwordBarFire: {

  },

  BarFrost: {
    unlocks: ['PowerwordBarFrost']
  },

  PowerwordBarFrost: {

  },

  Regen: {
    unlocks: ['Autoheal', 'RegenerativeRefrain0']
  },

  Autoheal: {
    unlocks: ['ImprovedAutoheal0']
  },

  Aid: {

  },

  Secondwind: {

  }
};

const DIVINER_TREE = {
  Diviner: {
    icon: 'abstract-010',
    desc: 'The Diviner is a class focused on holy retribution. It is able to deal damage effectively while bringing light to the darkness.',
    unbuyable: true,
    root: true,
    unlocks: ['Afflict', 'TotemSpecialty0']
  },

  NecroticFocus0: {
    unlocks: ['NecroticFocus1']
  },
  NecroticFocus1: {
    unlocks: ['NecroticFocus2']
  },
  NecroticFocus2: {
    unlocks: ['NecroticFocus3']
  },
  NecroticFocus3: {
    unlocks: ['NecroticFocus4', 'Light']
  },
  NecroticFocus4: {
    unlocks: ['NecroticFocus5', 'Push']
  },
  NecroticFocus5: {
    unlocks: ['NecroticFocus6']
  },
  NecroticFocus6: {
    unlocks: ['NecroticFocus7', 'HolyAura']
  },
  NecroticFocus7: {
    unlocks: ['Dispel']
  },

  TotemSpecialty0: {
    unlocks: ['TotemSpecialty1']
  },
  TotemSpecialty1: {
    unlocks: ['TotemSpecialty2']
  },
  TotemSpecialty2: {

  },

  HolyIllumination0: {

  },

  HolyAffliction0: {
    unlocks: ['HolyAffliction1']
  },

  HolyAffliction1: {
    unlocks: ['HolyAffliction2']
  },

  HolyAffliction2: {

  },

  SearingPurification0: {

  },

  // SKILLS
  Afflict: {
    unlocks: ['NecroticFocus0']
  },

  Light: {
    unlocks: ['HolyFire', 'HolyAffliction0']
  },

  HolyAura: {

  },

  HolyFire: {
    unlocks: ['HolyIllumination0', 'SearingPurification0']
  },

  Push: {

  },

  Dispel: {

  }
};

export const AllTrees = [
  HEALER_TREE,
  DRUID_TREE,
  BARD_TREE,
  DIVINER_TREE
];
