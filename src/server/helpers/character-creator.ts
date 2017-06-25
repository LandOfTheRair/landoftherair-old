
import { includes, truncate, capitalize } from 'lodash';

export class CharacterCreator {

  static alleiganceMods = {
    None:         {},
    Pirates:      { str: 4,  dex: 2,           int: -2, wis: -3, wil: -1,          cha: -1, gold: 500  },
    Townsfolk:    { str: -1, dex: -1, agi: 1,                    wil: 1,                    gold: -300 },
    Royalty:      { str: -2, dex: -4, agi: -2, int: 2,  wis: 2,                    cha: 2,  gold: 3500 },
    Adventurers:  { str: 2,  dex: 2,  agi: -2, int: 1,  wis: 1,  wil: -2, luk: 1,  cha: 1 },
    Wilderness:   { str: -2, dex: -2, agi: -2, int: 3,  wis: 3,  wil: 2 },
    Underground:  { str: 3,  dex: 3,  agi: 3,  int: -1, wis: -1,          luk: -2, cha: -2 }
  };

  static allegianceDesc = {
    None:         'You have no particular affiliation. You specialize in nothing in particular, and are all-around fairly average.',
    Pirates:      'Yarr. Ye be strong and dextrous, but what ye make up in physical, ye lack in the mental. At least ye get some gold, aye?',
    Townsfolk:    'You happen to be a person of the town. You may not be used to defending your town, but you can dodge a thrown milk can.',
    Royalty:      'You may never have picked up a sword in your life, but you are very well read, knowledgable, and wealthy.',
    Adventurers:  'You get around. You have seen a lot in your travels, and it shaped you to be hardy and knowledgable, even if your reflexes suffer.',
    Wilderness:   'You spend a lot of time in the wilderness, away from society. This gives you lots of time to read, and you happen to like practicing magic with the spellbooks you have found.',
    Underground:  'You live underground. You train daily by punching rocks. It is not the smartest choice, but you do it anyway. You have not seen yourself since you were young, so your appearance is lacking.'
  };

  static validAllegiances() {
    return Object.keys(this.alleiganceMods);
  }

  static getDefaultCharacter() {
    return {
      name: '',
      allegiance: 'None',
      sex: 'Male',
      _validAllegiances: this.validAllegiances(),
      _allegianceDesc: 'Placeholder',

      str: 10,
      dex: 10,
      agi: 10,

      int: 10,
      wis: 10,
      wil: 10,

      con: 10,
      luk: 10,
      cha: 10,

      gold: 500
    };
  }

  static getCustomizedCharacter({ allegiance, sex, name }) {
    const char = this.getDefaultCharacter();
    char.allegiance = allegiance;
    char.sex = sex;

    if(!name) name = '';

    if(!includes(this.validAllegiances(), char.allegiance)) {
      char.allegiance = 'None';
    }

    if(!includes(['Male', 'Female'], char.sex)) {
      char.sex = 'Male';
    }

    char.name = capitalize(truncate(name.replace(/[^a-zA-Z]/g, ''), { length: 20, omission: '' }));

    char._allegianceDesc = this.allegianceDesc[char.allegiance];

    const allegianceMod = this.alleiganceMods[char.allegiance] || {};

    Object.keys(allegianceMod).forEach(key => {
      char[key] += allegianceMod[key];
    });

    return char;
  }
}
