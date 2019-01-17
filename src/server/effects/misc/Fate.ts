
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';

import { LootHelper } from '../../helpers/world/loot-helper';

import { SpellLearned, StatName } from '../../../shared/interfaces/character';

import { Stun, Poison } from '../';
import { Currency } from '../../../shared/interfaces/holiday';
import { XPHelper } from '../../helpers/character/xp-helper';
import { Player } from '../../../shared/models/player';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class Fate extends SpellEffect {

  private statTable = [
    { chance: 10000, result: { stat: 'hp', divisor: 2,
      antimessage: 'Your health is declining.',
      message: 'You feel more healthy!' } },

    { chance: 9000,  result: { stat: 'accuracy', divisor: 20,
      antimessage: 'You feel like a crooked arrow.',
      message: 'You feel like an arrow flying true!' } },

    { chance: 8000,  result: { stat: 'perception', divisor: 10,
      antimessage: 'Your perception dulls.',
      message: 'Your eyes get a tiny bit sharper!' } },

    { chance: 8000,  result: { stat: 'offense', divisor: 20,
      antimessage: 'You feel less outgoing.',
      message: 'You feel more outgoing!' } },

    { chance: 5000,  result: { stat: 'mp', divisor: 2,
      antimessage: 'Your mental capabilities have shrunk.',
      message: 'Your mental capabilities have expanded!' } },

    { chance: 4000,  result: { stat: 'defense', divisor: 20,
      antimessage: 'You feel more vulnerable.',
      message: 'You feel more guarded!' } },

    { chance: 3000,  result: { stat: 'fireResist', divisor: 2,
      antimessage: 'You feel like warmth would overwhelm you.',
      message: 'You feel more heat-resistant!' } },

    { chance: 3000,  result: { stat: 'iceResist', divisor: 2,
      antimessage: 'You feel like chill would overwhelm you.',
      message: 'You feel more ice-resistant!' } },

    { chance: 3000,  result: { stat: 'necroticResist', divisor: 2,
      antimessage: 'You feel like the undead would overwhelm you.',
      message: 'You feel more undead-resistant!' } },

    { chance: 3000,  result: { stat: 'energyResist', divisor: 2,
      antimessage: 'You feel like energy would overwhelm you.',
      message: 'You feel more energy-resistant!' } },

    { chance: 2500,  result: { stat: 'physicalDamageBoost', divisor: 1,
      antimessage: 'You don\'t seem too sure of your weapons.',
      message: 'You feel like a whetstone would help you greatly!' } },

    { chance: 2500,  result: { stat: 'magicalDamageBoost', divisor: 1,
      antimessage: 'Your mind feels like it was battered a bit.',
      message: 'Your mind feels like it was ground to a sharp point!' } },

    { chance: 2500,  result: { stat: 'healingBoost', divisor: 1,
      antimessage: 'You feel less supportive.',
      message: 'You feel like more supportive!' } },

    { chance: 2000,  result: { stat: 'poisonResist', divisor: 4,
      antimessage: 'You feel like poison would overwhelm you.',
      message: 'You feel more poison-resistant!' } },

    { chance: 2000,  result: { stat: 'diseaseResist', divisor: 4,
      antimessage: 'You feel like disease would overwhelm you.',
      message: 'You feel more disease-resistant!' } },

    { chance: 1000,  result: { stat: 'armorClass', divisor: 20,
      antimessage: 'Your skin softens.',
      message: 'Your skin feels more solid!' } },

    { chance: 200,   result: { stat: 'stealth', divisor: 10,
      antimessage: 'You feel incredibly obvious.',
      message: 'You feel more sneaky!' } }
  ];

  private resultTable = [
    { chance: 100000  , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1 } } },
    { chance: 75000   , result: { message: 'You feel revitalized!',
        stats: { con: 3 } } },

    { chance: 65000   , result: { message: 'Wowza!',
        effectProto: Stun, effect: { name: 'Stun', duration: 3, potency: 50 } } },
    { chance: 65000   , result: { message: 'You feel nasty inside!',
        effectProto: Poison, effect: { name: 'Poison', duration: 100, potency: 15 } } },

    { chance: 55000   , result: { statBoost: 1 } },

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

    { chance: 45000   , result: { message: 'You feel your sack get lighter!',
        gold: -30000 } },
    { chance: 40000   , result: { message: 'You feel your sack get heavier!',
        gold: 30000 } },

    { chance: 40000   , result: { message: 'You feel your experience being drained away!',
        xp: -5 } },
    { chance: 35000   , result: { message: 'You feel more experienced!',
        xp: 5 } },

    { chance: 30000   , result: { message: 'You have a sudden craving for gold!',
        allegiance: 'Pirates' } },
    { chance: 30000   , result: { message: 'You feel nostalgic for the simple Rylt life!',
        allegiance: 'Townsfolk' } },
    { chance: 30000   , result: { message: 'You feel like going on an adventure!',
        allegiance: 'Adventurers' } },
    { chance: 30000   , result: { message: 'You feel posh!',
        allegiance: 'Royalty' } },
    { chance: 30000   , result: { message: 'The smell of trees pervades your mind!',
        allegiance: 'Wilderness' } },
    { chance: 30000   , result: { message: 'The sound of rocks pervades your mind!',
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


    { chance: 35000   , result: { message: 'You feel your experience being drained away!',
        xp: -10 } },
    { chance: 30000   , result: { message: 'You feel your sack get lighter!',
        gold: -100000 } },
    { chance: 25000   , result: { message: 'You feel your sack get heavier!',
        gold: 100000 } },
    { chance: 25000   , result: { message: 'You feel your experience being drained away!',
        xp: -10 } },
    { chance: 25000   , result: { message: 'You feel more experienced!',
        xp: 10 } },
    { chance: 25000   , result: { message: 'You feel like you met your maker!',
        fate: 25 } },

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

    { chance: 15000   , result: { message: 'You feel your experience being drained away!',
        xp: -20 } },

    { chance: 10000   , result: { statBoost: 2 } },

    { chance: 5000    , result: { message: 'You feel like you can do anything!',
        stats: { wil: 1 } } },
    { chance: 5000    , result: { message: 'You feel like a four-leaf clover!',
        stats: { luk: 1 } } },
    { chance: 5000    , result: { message: 'You feel pretty!',
        stats: { cha: 1 } } },

    { chance: 4000    , result: { message: 'You feel your experience being drained away!',
        xp: -1, megaXp: true } },

    { chance: 3000    , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1, wil: -1 } } },
    { chance: 3000    , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1, luk: -1 } } },
    { chance: 3000    , result: { message: 'Your chest feels like it\'s on fire!',
        stats: { con: -1, cha: -1 } } },

    { chance: 2500    , result: { message: 'You feel a magical energy fade from you!',
        unlearnSpell: 'Identify' } },

    { chance: 2500    , result: { message: 'You feel a magical energy fade from you!',
        unlearnSpell: 'Succor' } },

    { chance: 2500    , result: { message: 'You feel like you met your maker!',
        fate: 100 } },

    { chance: 1000    , result: { message: 'You feel a surge of pain shoot through your entire body!',
        fate: 25,
        stats: { con: -1, str: -1, dex: -1, agi: -1, int: -1, wis: -1, wil: -1, cha: -1, luk: -1 } } },

    { chance: 500     , result: { statBoost: 3 } },

    { chance: 10      , result: { message: 'You feel a magical energy encompass you!',
        learnSpell: 'Identify' } },

    { chance: 10      , result: { message: 'You feel a magical energy encompass you!',
        learnSpell: 'Succor' } },
  ];

  async cast(char: Player, target: Player) {

    if(!target.isPlayer()) return char.sendClientMessage('That target is not valid for Fate.');

    if(char !== target) {
      this.casterEffectMessage(char, `You cast Fate on ${target.name}.`);
    }

    const res = await LootHelper.rollAnyTable(this.resultTable);
    let { message } = res[0];
    const { stats, alignment, sex, allegiance, effect, effectProto, fate, xp, megaXp, gold, learnSpell, unlearnSpell, statBoost } = res[0];

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
        if(base + stats[stat] < 5 || base + stats[stat] > 25) {
          message = 'Your chest feels like it\'s on fire!';
        } else {
          target.gainBaseStat(<StatName>stat, stats[stat]);
        }
      });
    }

    if(xp) {

      if((target.level === XPHelper.MAX_LEVEL && xp > 0) || target.gainingAP) {
        message = 'You feel like you could have learned something, but didn\'t.';
      } else {

        let xpChange = 0;

        if(megaXp) {
          xpChange = Math.floor(target.exp * (xp / 100));

        } else {
          const baseXp = target.calcLevelXP(target.level);
          const neededXp = target.calcLevelXP(target.level + 1);
          xpChange = Math.floor((neededXp - baseXp) * (xp / 100));
        }

        char.gainExp(xpChange);
      }

    }

    if(gold) {
      if(gold < 0) {
        target.spendGold(-gold, 'Fate');
      } else {
        target.earnGold(gold, 'Fate');
      }
    }

    if(learnSpell) {
      const learnState = char.hasLearned(learnSpell);
      if((learnState !== SpellLearned.FromFate && learnState !== SpellLearned.FromTraits)
      || (learnSpell === 'Succor' && char.baseClass === 'Healer')
      || (learnSpell === 'Identify' && (char.baseClass === 'Mage' || char.baseClass === 'Thief'))) {
        message = 'You feel a magical energy encompass you for a moment, then it fades.';
      } else {
        char.learnSpell(learnSpell, SpellLearned.FromFate);
      }
    }

    if(unlearnSpell) {
      const learnState = char.hasLearned(learnSpell);
      if(learnState === SpellLearned.FromFate) {
        char.learnSpell(learnSpell, SpellLearned.Unlearned);
      }
    }

    if(fate) {
      target.earnCurrency(Currency.Fate, fate);
    }

    if(statBoost) {
      const statRes = await LootHelper.rollAnyTable(this.statTable);
      const statChosen = statRes[0].stat;
      const divisor = statRes[0].divisor;
      const goodMessage = statRes[0].message;
      const badMessage = statRes[0].antimessage;

      const base = target.getBaseStat(statChosen);

      let good = false;
      if(base === 0 || RollerHelper.XInOneHundred(40)) good = true;

      message = good ? goodMessage : badMessage;

      let statBoosting = Math.floor(target.level / divisor) * statBoost;

      if(statChosen === 'mp' && (target.baseClass === 'Warrior' || target.baseClass === 'Thief')) {
        statBoosting = 0;
        message = 'You feel as though you could have learned something new, but didn\'t.';
      }

      if(statChosen === 'hp' && base + statBoosting < 100) {
        statBoosting = 0;
        message = 'You think about it for a moment, then hesitate.';
      }

      if(good) target.gainBaseStat(statChosen, statBoosting);
      else     target.loseBaseStat(statChosen, statBoosting);
    }

    target.earnCurrency(Currency.Fate, 1);
    target.sendClientMessage(message);
  }
}
