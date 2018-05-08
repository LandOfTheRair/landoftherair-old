
const MAGE_TREE = {
  Mage: {
    icon: 'abstract-024',
    desc: 'The Mage is a versatile energy-focused class. It can do damage while providing some utility for itself and allies.',
    unbuyable: true,
    root: true,
    unlocks: ['MagicMissile', 'CarefulTouch0', 'DeathGrip0', 'NaturalArmor0', 'PartyManaRegeneration0']
  },

  // TRAITS
  PartyManaRegeneration0: {
    unlocks: ['PartyManaRegeneration1']
  },
  PartyManaRegeneration1: {
    unlocks: ['PartyManaRegeneration2']
  },
  PartyManaRegeneration2: {

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

  MagicFocus0: {
    unlocks: ['MagicFocus6']
  },
  MagicFocus1: {
    unlocks: ['Transmute']
  },
  MagicFocus2: {
    unlocks: ['EnergyWave']
  },
  MagicFocus3: {
    unlocks: ['EnergyWaveWiden0', 'MagicFocus4']
  },
  MagicFocus4: {

  },
  MagicFocus5: {
    unlocks: ['Drain', 'Asper']
  },
  MagicFocus6: {

  },
  MagicFocus7: {
    unlocks: ['Teleport']
  },

  EnergyWaveWiden0: {

  },

  LingeringDrain0: {

  },

  LingeringAsper0: {

  },

  // SKILLS
  MagicMissile: {
    unlocks: ['MagicFocus0', 'Identify', 'ManaPool0']
  },
  Identify: {
    unlocks: ['MagicFocus1', 'MagicFocus2', 'CalmMind0'],
  },
  Transmute: {

  },
  EnergyWave: {
    unlocks: ['MagicFocus3', 'Push']
  },
  Push: {
    unlocks: ['MagicFocus7', 'MagicFocus5', 'MagicBolt']
  },
  MagicBolt: {

  },
  Teleport: {
    unlocks: ['MassTeleport']
  },
  MassTeleport: {

  },
  Drain: {
    unlocks: ['LingeringDrain0']
  },
  Asper: {
    unlocks: ['LingeringAsper0']
  }
};

const PROTECTOR_TREE = {
  Protector: {
    icon: 'abstract-038',
    desc: 'The Protector focuses on learning useful reinforcement spells for itself and allies.',
    unbuyable: true,
    root: true,
    unlocks: ['TrueSight', 'WandSpecialty0']
  },

  // TRAITS
  DarknessWiden0: {

  },

  WandSpecialty0: {
    unlocks: ['WandSpecialty1']
  },

  WandSpecialty1: {
    unlocks: ['WandSpecialty2']
  },

  WandSpecialty2: {

  },

  // SKILLS
  TrueSight: {
    unlocks: ['BarFrost', 'BarFire', 'BarWater']
  },
  BarWater: {
    unlocks: ['Darkness']
  },
  BarFire: {
    unlocks: ['MagicShield']
  },
  BarFrost: {
    unlocks: ['Absorption']
  },
  MagicShield: {
    unlocks: ['Invisibility']
  },
  Absorption: {
    unlocks: ['Invisibility']
  },
  Darkness: {
    unlocks: ['DarknessWiden0', 'DarkVision']
  },
  DarkVision: {

  },
  Invisibility: {
    unlocks: ['Haste']
  },
  Haste: {

  }
};

const ELEMENTALIST_TREE = {
  Elementalist: {
    icon: 'abstract-011',
    unbuyable: true,
    root: true,
    desc: 'The Elementalist focuses on the dichotomous fire and ice magics.',
    unlocks: ['FireMist', 'IceMist']
  },

  // TRAITS
  FireMistWiden0: {

  },

  IceMistWiden0: {

  },

  ForgedFire0: {
    unlocks: ['ForgedFire2']
  },
  ForgedFire1: {
    unlocks: ['FireMistWiden0', 'ThermalBarrier0', 'FriendlyFire1']
  },
  ForgedFire2: {
    unlocks: ['Firethorns', 'FriendlyFire2']
  },

  FrostedTouch0: {
    unlocks: ['FrostedTouch2']
  },
  FrostedTouch1: {
    unlocks: ['IceMistWiden0', 'ThermalBarrier1', 'FriendlyFire0']
  },
  FrostedTouch2: {
    unlocks: ['Frostspikes', 'ThermalBarrier2']
  },

  ThermalBarrier0: {

  },
  ThermalBarrier1: {

  },
  ThermalBarrier2: {

  },

  FriendlyFire0: {

  },
  FriendlyFire1: {

  },
  FriendlyFire2: {

  },

  // SKILLS
  FireMist: {
    unlocks: ['ForgedFire0', 'ForgedFire1']
  },

  IceMist: {
    unlocks: ['FrostedTouch0', 'FrostedTouch1']
  },

  Firethorns: {

  },

  Frostspikes: {

  }
};

const BATTLEMAGE_TREE = {
  Battlemage: {
    icon: 'abstract-034',
    unbuyable: true,
    root: true,
    desc: 'The Battlemage applies their extensive magic knowledge to physical combat, and they are also capable of conjuring familiars to help.',
    unlocks: ['LightenArmor0', 'BladedWands0', 'StrongMind0', 'FindFamiliar', 'VolcanoStance', 'GlacierStance']
  },

  // TRAITS
  LightenArmor0: {

  },

  BladedWands0: {

  },

  StrongMind0: {

  },

  FindFamiliarBear0: {

  },

  FindFamiliarWolf0: {

  },

  FindFamiliarChillspider0: {

  },

  FindFamiliarSalamander0: {

  },

  VolcanoStanceImproved0: {
    unlocks: ['VolcanoStanceImproved1']
  },

  VolcanoStanceImproved1: {

  },

  GlacierStanceImproved0: {
    unlocks: ['GlacierStanceImproved1']
  },

  GlacierStanceImproved1: {

  },


  // SKILLS
  VolcanoStance: {
    unlocks: ['VolcanoStanceImproved0', 'ImbueFlame', 'ImbueEnergy']
  },

  GlacierStance: {
    unlocks: ['GlacierStanceImproved0', 'ImbueFrost', 'ImbueEnergy']
  },

  ImbueFrost: {

  },

  ImbueFlame: {

  },

  ImbueEnergy: {

  },

  FindFamiliar: {
    unlocks: ['FindFamiliarBear0', 'FindFamiliarSalamander0', 'FindFamiliarWolf0', 'FindFamiliarChillspider0']
  }
};

export const AllTrees = [
  MAGE_TREE,
  PROTECTOR_TREE,
  ELEMENTALIST_TREE,
  BATTLEMAGE_TREE
];
