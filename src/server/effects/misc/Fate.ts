
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';

import { LootHelper } from '../../helpers/world/loot-helper';

import { StatName } from '../../../shared/interfaces/character';

import { Stun, Poison } from '../';

export class Fate extends SpellEffect {

  private resultTable = [
    { chance: 100000  , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1 } } },
    { chance: 75000   , result: { message: 'You feel revitalized!',
        stats: { con: 3 } } },

    { chance: 50000   , result: { message: 'Wowza!',
        effectProto: Stun, effect: { name: 'Stun', duration: 3, potency: 50 } } },
    { chance: 50000   , result: { message: 'You feel nasty inside!',
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

  cast(char: Character, target: Character) {

    if(char !== target) {
      this.casterEffectMessage(char, `You cast Fate on ${target.name}.`);
    }

    LootHelper.rollAnyTable(this.resultTable).then((res) => {
      let { message } = res[0];
      const { stats, alignment, sex, allegiance, effect, effectProto } = res[0];

      if(effect && effectProto) {
        const eff = new effectProto(effect);
        eff.shouldShowMessage = false;
        eff.cast(target, target);
        eff.shouldShowMessage = true;
      }

      if(sex) {
        if(sex === target.sex) {
          message = 'There was no effect.';
        }

        target.sex = sex;
      }

      if(allegiance) {
        if(allegiance === target.allegiance) {
          message = 'There was no effect.';
        }

        target.allegiance = allegiance;
      }

      if(alignment) {
        if(alignment === target.alignment) {
          message = 'There was no effect.';
        }

        target.alignment = alignment;
      }

      if(stats) {
        Object.keys(stats).forEach(stat => {
          const base = target.getBaseStat(<StatName>stat);
          if(base + stats[stat] < 5 || base + stats[stat] > 17) {
            message = 'Your chest feels like it\'s on fire!';
          } else {
            target.gainBaseStat(<StatName>stat, stats[stat]);
          }
        });
      }

      target.sendClientMessage(message);
    });
  }
}
