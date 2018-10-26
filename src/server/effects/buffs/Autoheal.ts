
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { CombatHelper } from '../../helpers/world/combat-helper';
import { Skill } from '../../base/Skill';

export class Autoheal extends SpellEffect {

  iconData = {
    name: 'self-love',
    color: '#00a',
    tooltipDesc: 'Restores health when it goes lower than the threshold.'
  };

  maxSkillForSkillGain = 15;

  private isEnhanced: boolean;

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(caster !== target) {
      this.casterEffectMessage(caster, { message: `You cast Autoheal on ${target.name}!`, sfx: 'spell-buff-magical' });
    }

    this.isEnhanced = !!caster.getTraitLevel('ImprovedAutoheal');

    this.aoeAgro(caster, 50);

    const wisCheck = this.getCoreStat(caster);

    this.duration = this.duration || wisCheck * this.potency;
    this.potency = 30;
    if(this.isEnhanced) this.potency = 40;

    this.updateDurationBasedOnTraits(caster);

    this.effectInfo = { damage: 0, caster: caster.uuid };
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, { message: 'Your chest feels unnaturally warmer!', sfx: 'spell-buff-magical' });
    this.iconData.tooltipDesc = `Restores health when it goes lower than ${this.potency}%`;
  }

  effectTick(char: Character) {
    if(char.hp.gtePercent(this.potency)) return;

    const healAmt = -char.hp.maximum;

    const caster = char.$$room.state.findCharacter(this.effectInfo.caster);

    char.sendClientMessage('A warm surge of energy runs through your chest!');

    this.duration = Math.max(1, this.duration - (this.isEnhanced ? 75 : 150));

    CombatHelper.magicalAttack(caster, char, {
      effect: this,
      damage: healAmt,
      damageClass: 'heal'
    });

  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'The unnatural warmth in your chest fades.');
  }
}
