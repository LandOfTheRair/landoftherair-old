
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
  Robe2: 'Rylt Renegade Cloak'
};

export const Loadouts = {
  Mage: {
    1: extend({}, level1, { Belt: ['Antanian Staff', 'Antanian Shortsword'] }),
    3: extend({}, level3, {
      Armor: 'Antanian Ringmail Tunic',
      Ring1: 'Antanian Defense Ring',
      Ring2: 'Antanian Defense Ring',
      Belt: ['Rylt Renegade Staff', 'Rylt Renegade Shortsword'] })
  },
  Thief: {
    1: extend({}, level1, { Belt: ['Antanian Dagger', 'Antanian Shortsword'] }),
    3: extend({}, level3, {
      Armor: 'Rylt Renegade Breastplate',
      Ring1: 'Antanian Offense Ring',
      Ring2: 'Antanian Offense Ring',
      Belt: ['Rylt Renegade Dagger', 'Rylt Renegade Shortsword'] })
  },
  Warrior: {
    1: extend({}, level1, { Belt: ['Antanian Longsword', 'Antanian Mace', 'Antanian Greatsword', 'Antanian Shortbow', 'Antanian Wooden Shield'] }),
    3: extend({}, level3, {
      Armor: 'Rylt Renegade Breastplate',
      Ring1: 'Antanian Offense Ring',
      Ring2: 'Antanian Offense Ring',
      Belt: ['Rylt Renegade Longsword', 'Rylt Renegade Mace', 'Rylt Renegade Greatsword', 'Rylt Renegade Shortbow', 'Rylt Renegade Iron Shield'] })
  },
  Healer: {
    1: extend({}, level1, { Belt: ['Antanian Mace', 'Antanian Shield'] }),
    3: extend({}, level3, {
      Armor: 'Antanian Ringmail Tunic',
      Ring1: 'Antanian Defense Ring',
      Ring2: 'Antanian Defense Ring',
      Belt: ['Rylt Renegade Mace', 'Rylt Renegade Greatmace', 'Rylt Renegade Iron Shield'] })
  }
};
