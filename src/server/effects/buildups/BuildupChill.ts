
import { BuildupEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { Frosted } from '../bursts/Frosted';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class BuildupChill extends BuildupEffect {

  iconData = {
    name: 'cold-heart',
    color: '#004',
    tooltipDesc: 'Frost is building up.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(caster.uuid);
    this.flagCasterName(caster.name);
    target.applyEffect(this);
  }

  buildupProc(char: Character) {
    const caster = char.$$room.state.findCharacter(this.effectInfo.caster);

    let isPermaFrosted: boolean;

    if(caster) {
      isPermaFrosted = RollerHelper.XInOneHundred(caster.getTraitLevelAndUsageModifier('WintersEmbrace'));

      if(isPermaFrosted) {
        caster.sendClientMessage(`You freeze ${char.name} solid!`, true);
      }
    }

    const frozen = new Frosted({ isPermaFrosted });
    frozen.duration = 10;
    frozen.cast(char, char);
    frozen.effectInfo.caster = this.effectInfo.caster;
    frozen.effectInfo.casterName = this.effectInfo.casterName;
  }
}
