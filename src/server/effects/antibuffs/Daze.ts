
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class RecentlyDazed extends SpellEffect {

  iconData = {
    name: 'knockout',
    color: '#000',
    tooltipDesc: 'Recently dazed and cannot be dazed for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 60;
    target.applyEffect(this);
  }
}

export class Daze extends SpellEffect {

  iconData = {
    name: 'knockout',
    color: '#055',
    tooltipDesc: 'Dazed and periodically failing spell casts.'
  };

  maxSkillForSkillGain = 15;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagCasterName(caster.name);

    this.iconData.tooltipDesc = `Dazeed and failing spell casts ${this.potency}% of the time.`;

    if(target.hasEffect('RecentlyDazed') || target.hasEffect('Daze')) {
      return this.effectMessage(caster, `${target.name} resisted your daze!`);
    } else {
      this.effectMessage(caster, `You daze ${target.name}!`);
    }

    this.duration = 30;

    target.addAgro(caster, 30);
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You are dazed!');
  }

  effectEnd(char: Character) {
    const recently = new RecentlyDazed({});
    recently.cast(char, char);
    this.effectMessage(char, 'You are no longer dazed.');
  }
}
