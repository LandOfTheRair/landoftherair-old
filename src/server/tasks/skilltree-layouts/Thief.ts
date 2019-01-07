
const THIEF_TREE = {
  Thief: {
    icon: 'abstract-005',
    desc: 'The Thief class excels at pickpocketing, mugging, and backstabbing unsuspecting foes.',
    unbuyable: true,
    root: true,
    unlocks: ['PartyOffense0', 'CarefulTouch0', 'DeathGrip0', 'NaturalArmor0', 'NimbleStealing0']
  },

  // ANCIENT
  AncientGrip0: {
    unlocks: ['AncientGrip1']
  },
  AncientGrip1: {
    unlocks: ['AncientGrip2']
  },
  AncientGrip2: {

  },

  AncientArmor3: {
    unlocks: ['AncientArmor4']
  },
  AncientArmor4: {
    unlocks: ['AncientArmor5']
  },
  AncientArmor5: {

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
    unlocks: ['AncientGrip0']
  },

  NaturalArmor0: {
    unlocks: ['NaturalArmor1']
  },
  NaturalArmor1: {
    unlocks: ['NaturalArmor2']
  },
  NaturalArmor2: {
    unlocks: ['AncientArmor3']
  },

  NimbleStealing0: {
    unlocks: ['NimbleStealing1']
  },
  NimbleStealing1: {
    unlocks: ['NimbleStealing2']
  },
  NimbleStealing2: {
    unlocks: ['DoubleStealing0']
  },

  DoubleStealing0: {

  }
};

const NINJA_TREE = {
  Ninja: {
    icon: 'abstract-066',
    desc: 'The Ninja class is one that focuses on the shadows. They are not often seen or heard.',
    unbuyable: true,
    root: true,
    unlocks: ['DarkerShadows0']
  },

  // TRAITS
  ShadowSheath0: {
    unlocks: ['ShadowSheath6']
  },
  ShadowSheath1: {

  },
  ShadowSheath2: {

  },
  ShadowSheath3: {

  },
  ShadowSheath4: {

  },
  ShadowSheath5: {

  },
  ShadowSheath6: {

  },

  DarkerShadows0: {
    unlocks: ['DarkerShadows1', 'ShadowSheath1', 'TrueSight']
  },
  DarkerShadows1: {
    unlocks: ['DarkerShadows2', 'ShadowSheath2']
  },
  DarkerShadows2: {
    unlocks: ['DarkerShadows3', 'ShadowSheath3', 'DarkVision']
  },
  DarkerShadows3: {
    unlocks: ['DarkerShadows4', 'ShadowSheath4']
  },
  DarkerShadows4: {
    unlocks: ['DarkerShadows5', 'ShadowSheath5']
  },
  DarkerShadows5: {
    unlocks: ['DarkerShadows6', 'ShadowSheath0']
  },
  DarkerShadows6: {

  },

  DarknessWiden0: {

  },

  DarknessClones0: {

  },

  // SKILLS
  Darkness: {
    unlocks: ['DarknessWiden0', 'ShadowMeld', 'ShadowClones']
  },

  DarkVision: {
    unlocks: ['Darkness']
  },

  ShadowMeld: {

  },

  ShadowClones: {
    unlocks: ['DarknessClones0']
  },

  TrueSight: {

  }
};

const ROGUE_TREE = {
  Rogue: {
    icon: 'abstract-071',
    desc: 'The Rogue is a class that focuses on the finer thievery arts, such as setting and disarming traps, blending in with enemies, and looting valuable items.',
    unbuyable: true,
    root: true,
    unlocks: ['OffhandFinesse0', 'Identify', 'Set', 'LockpickSpecialty0']
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
    unlocks: ['Vortex']
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

  ReusableTraps0: {
    unlocks: ['ReusableTraps1']
  },
  ReusableTraps1: {

  },

  LockpickSpecialty0: {
    unlocks: ['LockpickSpecialty1']
  },
  LockpickSpecialty1: {
    unlocks: ['LockpickSpecialty2']
  },
  LockpickSpecialty2: {
    unlocks: ['LockpickSpecialty3']
  },
  LockpickSpecialty3: {
    unlocks: ['LockpickSpecialty4']
  },
  LockpickSpecialty4: {

  },

  ThrownTraps0: {

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
    unlocks: ['Disarm', 'ThrownTraps0']
  },

  Disarm: {
    unlocks: ['WiderTraps0', 'StrongerTraps0', 'AdvancedTraps0', 'ReusableTraps0']
  },

  Vortex: {

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

  },

  ShadowRanger0: {
    unlocks: ['ShadowRanger1', 'ShadowSwap2']
  },
  ShadowRanger1: {
    unlocks: ['ShadowRanger2', 'ShadowSwap3']
  },
  ShadowRanger2: {
    unlocks: ['MultiShot']
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

  DegenerativeVenom0: {

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

  BetterBackstab0: {
    unlocks: ['BetterBackstab1', 'ShadowDaggers0']
  },

  BetterBackstab1: {
    unlocks: ['BetterBackstab2']
  },

  BetterBackstab2: {
    unlocks: ['Assassinate']
  },

  EnhancedApplications0: {
    unlocks: ['PotentApplications0']
  },

  PotentApplications0: {

  },

  TripleShot0: {

  },

  // SKILLS
  Apply: {
    unlocks: ['BetterBackstab0', 'Poison', 'Venom', 'Debilitate', 'EnhancedApplications0']
  },

  Assassinate: {

  },

  Debilitate: {
    unlocks: ['RecuperatingDebilitation0']
  },

  Poison: {
    unlocks: ['CorrosivePoison0']
  },

  Venom: {
    unlocks: ['DegenerativeVenom0']
  },

  MultiShot: {
    unlocks: ['TripleShot0']
  }
};

export const AllTrees = [
  THIEF_TREE,
  NINJA_TREE,
  ROGUE_TREE,
  ASSASSIN_TREE
];
