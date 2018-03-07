
import { BuildupEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { DefensesShattered } from '../bursts/DefensesShattered';

export class BuildupSneakAttack extends BuildupEffect {

  iconData = {
    name: 'on-sight',
    color: '#333',
    tooltipDesc: 'Sneak attacks are building up.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(caster.uuid);
    this.flagCasterName(caster.name);
    target.applyEffect(this);
  }

  buildupProc(char: Character) {
    const shattered = new DefensesShattered({});
    shattered.duration = 15;
    shattered.cast(char, char);
    shattered.effectInfo.caster = this.effectInfo.caster;
    shattered.effectInfo.casterName = this.effectInfo.casterName;
  }
}
