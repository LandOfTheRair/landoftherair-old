
const MAGE_TREE = {
  Mage: {
    icon: 'acorn',
    unbuyable: true,
    unlocks: ['MagicMissile', 'CarefulTouch0', 'DeathGrip0', 'NaturalArmor0', 'PartyManaRegen0']
  },

  // TRAITS
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

  },
  MagicFocus1: {
    unlocks: ['Transmute']
  },
  MagicFocus2: {
    unlocks: ['EnergyWave']
  },
  MagicFocus3: {
    unlocks: ['EnergyWaveWiden0']
  },
  MagicFocus4: {
    unlocks: ['MagicBolt', 'Teleport']
  },

  EnergyWaveWiden0: {

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
    unlocks: ['MagicFocus4']
  },
  MagicBolt: {

  },
  Teleport: {
    unlocks: ['MassTeleport']
  },
  MassTeleport: {

  }
};

const PROTECTOR_TREE = {
  Protector: {
    icon: 'acorn',
    unbuyable: true,
    unlocks: ['TrueSight']
  },

  // TRAITS
  DarknessWiden0: {

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
    icon: 'acorn',
    unbuyable: true,
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
    unlocks: ['FireMistWiden0']
  },
  ForgedFire2: {
    unlocks: ['Firethorns']
  },

  FrostedTouch0: {
    unlocks: ['FrostedTouch2']
  },
  FrostedTouch1: {
    unlocks: ['IceMistWiden0']
  },
  FrostedTouch2: {

  },

  // SKILLS
  FireMist: {
    unlocks: ['ForgedFire0', 'ForgedFire1']
  },

  IceMist: {
    unlocks: ['FrostedTouch0', 'FrostedTouch1']
  },

  Firethorns: {

  }
};

export const AllTrees = [
  MAGE_TREE,
  PROTECTOR_TREE,
  ELEMENTALIST_TREE
];
