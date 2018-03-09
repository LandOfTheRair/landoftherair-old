
import { extend } from 'lodash';

const level1 = {
  Head: 'Antanian Helm',
  Neck: 'Antanian Amulet',
  Waist: 'Antanian Sash',
  Bracers: 'Antanian Bracers',
  Ring1: 'Antanian Ring',
  Ring2: 'Antanian Ring',
  Hands: 'Antanian Leather Gloves',
  Feet: 'Antanian Leather Boots',
  Armor: 'Antanian Tunic',
  Robe1: 'Antanian Cloak',
  Robe2: 'Antanian Cloak'
};

const level3 = {
  Head: 'Rylt Renegade Helm',
  Neck: 'Antanian Amulet',
  Waist: 'Rylt Renegade Sash',
  Bracers: 'Rylt Renegade Bracers',
  Hands: 'Rylt Renegade Leather Gloves',
  Feet: 'Rylt Renegade Leather Boots',
  Robe1: 'Rylt Renegade Cloak',
  Robe2: 'Rylt Renegade Cloak',
  Belt: [
    'Rylt Renegade Staff', 'Rylt Renegade Shortsword', 'Rylt Renegade Dagger', 'Rylt Renegade Shortsword', 'Rylt Renegade Greatmace',
    'Rylt Renegade Longsword', 'Rylt Renegade Mace', 'Rylt Renegade Greatsword', 'Rylt Renegade Shortbow', 'Rylt Renegade Iron Shield'
  ]
};

const level5 = {
  Armor: 'Rylt Werebear Fur',
  Head: 'Rylt Renegade Helm',
  Neck: 'Antanian Amulet',
  Waist: 'Rylt Renegade Sash',
  Bracers: 'Rylt Renegade Bracers',
  Hands: 'Werebear Claws',
  Feet: 'Rylt Renegade Leather Boots',
  Robe1: 'Weredeer Robe',
  Robe2: 'Saraxa Robe',
  Belt: [
    'Rylt Renegade Staff', 'Rylt Renegade Shortsword', 'Rylt Renegade Dagger', 'Rylt Renegade Shortsword', 'Saraxa Wand',
    'Rylt Renegade Longsword', 'Rylt Renegade Mace', 'Rylt Renegade Greatsword', 'Rylt Renegade Shortbow', 'Rylt Renegade Iron Shield'
  ]
};

const level7 = {
  Armor: 'Yzalt RatGuard Fur',
  Head: 'Steffen Crown',
  Neck: 'Yzalt Combat Amulet',
  Waist: 'Yzalt Basic Sash',
  Bracers: 'Yzalt MagicResist Bracers',
  Hands: 'Yzalt Defensive Claws',
  Feet: 'Yzalt Combat Boots',
  Ring1: 'Yzalt Armor Ring',
  Ring2: 'Yzalt Armor Ring',
  Robe1: 'Yzalt Fungus Cloak',
  Robe2: 'Yzalt Fungus Cloak',
  Belt: [
    'Yzalt Heniz Staff', 'Heniz FireMist Wand', 'Heniz Poison Shortbow', 'Antanian Steffen Flail', 'Antanian Steffen Nodachi',
    'Antanian Steffen Katana', 'Heniz IceMist Wand', 'Yzalt RatGuard Axe'
  ]
};

export const Loadouts = {
  Mage: {
    1: extend({}, level1, { Belt: ['Antanian Staff', 'Antanian Shortsword'] }),
    3: extend({}, level3, {
      Armor: 'Antanian Ringmail Tunic',
      Ring1: 'Antanian Defense Ring',
      Ring2: 'Antanian Defense Ring'
    }),
    5: extend({}, level5, {
      Neck: 'Saraxa Regen Amulet',
      Ring1: 'Antanian Defense Ring',
      Ring2: 'Antanian Defense Ring'
    }),
    7: extend({}, level7, {
      Hands: 'Heniz Battlemage Gloves',
      Ring1: 'Heniz Intelligence Ring',
      Ring2: 'Heniz Intelligence Ring'
    })
  },
  Thief: {
    1: extend({}, level1, { Belt: ['Antanian Dagger', 'Antanian Shortsword'] }),
    3: extend({}, level3, {
      Armor: 'Rylt Renegade Breastplate',
      Ring1: 'Antanian Offense Ring',
      Ring2: 'Antanian Offense Ring'
    }),
    5: extend({}, level5, {
      Ring1: 'Antanian Offense Ring',
      Ring2: 'Antanian Offense Ring'
    }),
    7: extend({}, level7, {
      Ring1: 'Heniz Intelligence Ring',
      Ring2: 'Heniz Intelligence Ring',
      Waist: 'Heniz Agility Sash',
      Wrists: 'Heniz Dexterity Bracers',
      Hands: 'Steffen Strength Gloves'
    })
  },
  Warrior: {
    1: extend({}, level1, { Belt: ['Antanian Longsword', 'Antanian Mace', 'Antanian Greatsword', 'Antanian Shortbow', 'Antanian Wooden Shield'] }),
    3: extend({}, level3, {
      Armor: 'Rylt Renegade Breastplate',
      Ring1: 'Antanian Offense Ring',
      Ring2: 'Antanian Offense Ring'
    }),
    5: extend({}, level5, {
      Ring1: 'Antanian Offense Ring',
      Ring2: 'Antanian Offense Ring'
    }),
    7: extend({}, level7, {
      Ring1: 'Steffen DamageResist Ring',
      Ring2: 'Steffen DamageResist Ring',
      Waist: 'Steffen Offensive Sash',
      Hands: 'Steffen Strength Gloves'
    })
  },
  Healer: {
    1: extend({}, level1, { Belt: ['Antanian Mace', 'Antanian Shield'] }),
    3: extend({}, level3, {
      Armor: 'Antanian Ringmail Tunic',
      Ring1: 'Antanian Defense Ring',
      Ring2: 'Antanian Defense Ring'
    }),
    5: extend({}, level5, {
      Neck: 'Saraxa Regen Amulet',
      Ring1: 'Antanian Defense Ring',
      Ring2: 'Antanian Defense Ring'
    }),
    7: extend({}, level7, {
      Ring1: 'Steffen Mana Ring',
      Ring2: 'Steffen Mana Ring',
      Neck: 'Steffen Wisdom Amulet'
    })
  }
};
