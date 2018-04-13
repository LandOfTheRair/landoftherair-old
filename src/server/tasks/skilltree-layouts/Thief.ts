
const THIEF_TREE = {
  Thief: {
    icon: 'abstract-005',
    desc: 'The Thief class excels at pickpocketing, mugging, and backstabbing unsuspecting foes.',
    unbuyable: true,
    root: true,
    unlocks: ['PartyOffense0', 'CarefulTouch0', 'DeathGrip0', 'NaturalArmor0']
  },

  // TRAITS
  PartyOffense0: {
    unlocks: ['PartyOffense1']
  },
  PartyOffense1: {
    unlocks: ['PartyOffense2']
  },
  PartyOffense2: {

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
};

const NINJA_TREE = {
  Ninja: {
    icon: 'abstract-066',
    desc: 'The Ninja class is one that focuses on the shadows. They are not often seen or heard.',
    unbuyable: true,
    root: true,
    unlocks: []
  }
};

const ROGUE_TREE = {
  Rogue: {
    icon: 'abstract-071',
    desc: 'The Rogue is a class that focuses on the finer thievery arts, such as setting and disarming traps, blending in with enemies, and looting valuable items.',
    unbuyable: true,
    root: true,
    unlocks: ['OffhandFinesse0', 'Identify', 'Set']
  },

  // TRAITS
  OffhandFinesse0: {
    unlocks: ['OffhandFinesse1']
  },
  OffhandFinesse1: {
    unlocks: ['OffhandFinesse2']
  },
  OffhandFinesse2: {
    unlocks: ['OffhandFinesse3']
  },
  OffhandFinesse3: {
    unlocks: ['OffhandFinesse4']
  },
  OffhandFinesse4: {

  },

  PhilosophersStone0: {
    unlocks: ['PhilosophersStone1']
  },

  PhilosophersStone1: {
    unlocks: ['PhilosophersStone2']
  },

  PhilosophersStone2: {

  },

  WiderTraps0: {
    unlocks: ['WiderTraps1']
  },
  WiderTraps1: {
    unlocks: ['WiderTraps2']
  },
  WiderTraps2: {

  },

  StrongerTraps0: {
    unlocks: ['StrongerTraps1']
  },
  StrongerTraps1: {
    unlocks: ['StrongerTraps2']
  },
  StrongerTraps2: {

  },

  AdvancedTraps0: {

  },

  // SKILLS
  Identify: {
    unlocks: ['Transmute']
  },

  Transmute: {
    unlocks: ['EagleEye', 'PhilosophersStone0']
  },

  EagleEye: {
    unlocks: ['Disguise']
  },

  Disguise: {

  },

  Set: {
    unlocks: ['Disarm']
  },

  Disarm: {
    unlocks: ['WiderTraps0', 'StrongerTraps0', 'AdvancedTraps0']
  }
};

const ASSASSIN_TREE = {
  Assassin: {
    icon: 'abstract-088',
    desc: 'The Assassin class focuses strongly on lethal thief arts, such as applying poisons to their weapons and inflicting violent diseases on their foes.',
    unbuyable: true,
    root: true,
    unlocks: ['Apply', 'ShadowRanger0', 'ShadowSwap0']
  },

  // TRAITS
  ShadowDaggers0: {
    unlocks: ['ShadowDaggers1', 'ShadowSwap4']
  },
  ShadowDaggers1: {
    unlocks: ['ShadowDaggers2', 'ShadowSwap5']
  },
  ShadowDaggers2: {
    unlocks: ['Assassinate']
  },

  ShadowRanger0: {
    unlocks: ['ShadowRanger1', 'ShadowSwap2']
  },
  ShadowRanger1: {
    unlocks: ['ShadowRanger2', 'ShadowSwap3']
  },
  ShadowRanger2: {

  },

  ShadowSwap0: {
    unlocks: ['ShadowSwap1']
  },
  ShadowSwap1: {
    unlocks: ['ShadowSwap6']
  },
  ShadowSwap2: {

  },
  ShadowSwap3: {

  },
  ShadowSwap4: {

  },
  ShadowSwap5: {

  },
  ShadowSwap6: {
    unlocks: ['ShadowSwap7']
  },
  ShadowSwap7: {

  },

  DegenerativeDisease0: {

  },

  CorrosivePoison0: {

  },

  RecuperatingDebilitation0: {
    unlocks: ['RecuperatingDebilitation1']
  },

  RecuperatingDebilitation1: {
    unlocks: ['RecuperatingDebilitation2']
  },

  RecuperatingDebilitation2: {
    unlocks: ['RecuperatingDebilitation3']
  },

  RecuperatingDebilitation3: {

  },

  // SKILLS
  Apply: {
    unlocks: ['ShadowDaggers0', 'Poison', 'Disease', 'Debilitate']
  },

  Assassinate: {

  },

  Debilitate: {
    unlocks: ['RecuperatingDebilitation0']
  },

  Poison: {
    unlocks: ['CorrosivePoison0']
  },

  Disease: {
    unlocks: ['DegenerativeDisease0']
  }
};

export const AllTrees = [
  THIEF_TREE,
  NINJA_TREE,
  ROGUE_TREE,
  ASSASSIN_TREE
];
