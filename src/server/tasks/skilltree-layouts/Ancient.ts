
const ANCIENT_TREE = {
  Ancient: {
    icon: 'drakkar',
    desc: 'Expand your ancient knowledge!',
    unbuyable: true,
    root: true,
    unlocks: ['AncientPotions0']
  },

  AncientPotions0: {
    unlocks: ['AncientPotions1']
  },
  AncientPotions1: {
    unlocks: ['AncientPotions2']
  },
  AncientPotions2: {

  }
};

export const AllTrees = [ANCIENT_TREE];