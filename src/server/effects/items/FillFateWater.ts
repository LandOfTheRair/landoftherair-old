
import { Effect } from '../../base/Effect';
import { Character} from '../../../shared/models/character';

import { LootHelper } from '../../helpers/world/loot-helper';

import { StatName } from '../../../shared/interfaces/character';

import { Stun, Poison } from '../';

export class FillFateWater extends Effect {

  private resultTable = [
    { chance: 100000  , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1 } } },
    { chance: 75000   , result: { message: 'You feel revitalized!',
        stats: { con: 3 } } },

    { chance: 50000   , result: { message: 'Wow, that\'s strong!',
      effectProto: Stun, effect: { name: 'Stun', duration: 3, potency: 50 } } },
    { chance: 50000   , result: { message: 'Ugh, the water tastes nasty!',
      effectProto: Poison, effect: { name: 'Poison', duration: 100, potency: 15 } } },

    { chance: 50000   , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1, str: -1 } } },
    { chance: 50000   , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1, dex: -1 } } },
    { chance: 50000   , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1, agi: -1 } } },
    { chance: 50000   , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1, int: -1 } } },
    { chance: 50000   , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1, wis: -1 } } },

    { chance: 30000   , result: { message: 'You feel different!',
        allegiance: 'Pirates' } },
    { chance: 30000   , result: { message: 'You feel different!',
        allegiance: 'Townsfolk' } },
    { chance: 30000   , result: { message: 'You feel different!',
        allegiance: 'Adventurers' } },
    { chance: 30000   , result: { message: 'You feel different!',
        allegiance: 'Royalty' } },
    { chance: 30000   , result: { message: 'You feel different!',
        allegiance: 'Wilderness' } },
    { chance: 30000   , result: { message: 'You feel different!',
        allegiance: 'Underground' } },

    { chance: 30000   , result: { message: 'You feel a strange bulge!',
        sex: 'Male' } },
    { chance: 30000   , result: { message: 'You feel a strange bulge!',
        sex: 'Female' } },

    { chance: 30000   , result: { message: 'You feel more proper!',
        alignment: 'Good' } },
    { chance: 30000   , result: { message: 'You feel indifferent!',
        alignment: 'Neutral' } },
    { chance: 30000   , result: { message: 'You feel more devilish!',
        alignment: 'Evil' } },

    { chance: 20000   , result: { message: 'Your muscles bulge!',
        stats: { str: 1 } } },
    { chance: 20000   , result: { message: 'You feel quick as a bunny!',
        stats: { agi: 1 } } },
    { chance: 20000   , result: { message: 'Your hands feel more steady!',
        stats: { dex: 1 } } },
    { chance: 20000   , result: { message: 'Your mind has expanded!',
        stats: { int: 1 } } },
    { chance: 20000   , result: { message: 'Your world view has expanded!',
        stats: { wis: 1 } } },
    { chance: 5000    , result: { message: 'You feel like you can do anything!',
        stats: { wil: 1 } } },
    { chance: 5000    , result: { message: 'You feel like a four-leaf clover!',
        stats: { luk: 1 } } },
    { chance: 5000    , result: { message: 'You feel pretty!',
        stats: { cha: 1 } } },

    { chance: 3000    , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1, wil: -1 } } },
    { chance: 3000    , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1, luk: -1 } } },
    { chance: 3000    , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1, cha: -1 } } },

    { chance: 1000    , result: { message: 'You feel a surge of pain shoot through your entire body!',
        stats: { con: -1, str: -1, dex: -1, agi: -1, int: -1, wis: -1, wil: -1, cha: -1, luk: -1 } } },
  ];

  effectStart(char: Character) {

    LootHelper.rollAnyTable(this.resultTable).then((res) => {
      let { message } = res[0];
      const { stats, alignment, sex, allegiance, effect, effectProto } = res[0];

      if(effect && effectProto) {
        const eff = new effectProto(effect);
        eff.shouldShowMessage = false;
        eff.cast(char, char);
        eff.shouldShowMessage = true;
      }

      if(sex) {
        if(sex === char.sex) {
          message = 'The water was tasteless.';
        }

        char.sex = sex;
      }

      if(allegiance) {
        if(allegiance === char.allegiance) {
          message = 'The water was tasteless.';
        }

        char.allegiance = allegiance;
      }

      if(alignment) {
        if(alignment === char.alignment) {
          message = 'The water was tasteless.';
        }

        char.alignment = alignment;
      }

      if(stats) {
        Object.keys(stats).forEach(stat => {
          const base = char.getBaseStat(<StatName>stat);
          if(base + stats[stat] < 5 || base + stats[stat] > 17) {
            message = 'Your chest feels like it\'s on fire!';
          } else {
            char.gainBaseStat(<StatName>stat, stats[stat]);
          }
        });
      }

      char.sendClientMessage(message);
    });
  }
}
