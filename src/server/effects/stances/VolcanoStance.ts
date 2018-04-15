
import { AugmentSpellEffect, StanceEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { MessageHelper } from '../../helpers/world/message-helper';
import { GenderHelper } from '../../helpers/character/gender-helper';

export class VolcanoStance extends StanceEffect implements AugmentSpellEffect {

  static get skillRequired() { return 0; }
  protected skillRequired = VolcanoStance.skillRequired;

  iconData = {
    name: 'fire-silhouette',
    bgColor: '#000',
    color: '#DC143C',
    tooltipDesc: 'Stance. Acting offensively.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill): boolean {
    const foundSelf = super.cast(caster, target, skillRef);
    if(foundSelf) return foundSelf;
    this.flagPermanent(caster.uuid);
    this.potency = caster.calcSkillLevel(caster.rightHand.type);
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    MessageHelper.sendClientMessageToRadius(char, `${char.name} takes on an explosive stance.`);

    char.loseStat('armorClass', this.potency);
    char.loseStat('defense', Math.floor(this.potency / 4));

    char.gainStat('offense', Math.floor(this.potency / 4));
    char.gainStat('accuracy', Math.floor(this.potency / 4));
  }

  effectEnd(char: Character) {
    MessageHelper.sendClientMessageToRadius(char, `${char.name} breaks ${GenderHelper.hisher(char)} explosive stance.`);

    char.gainStat('armorClass', this.potency);
    char.gainStat('defense', Math.floor(this.potency / 4));

    char.loseStat('offense', Math.floor(this.potency / 4));
    char.loseStat('accuracy', Math.floor(this.potency / 4));
  }

  augmentAttack(attacker: Character, defender: Character, opts: { damage: number, damageClass: string }) {

    if(opts.damageClass !== 'physical') return;

    this.magicalAttack(attacker, defender, {
      atkMsg: `You unleash volcanic fury upon ${defender.name}!`,
      defMsg: `${this.getCasterName(attacker, defender)} struck you with a burst of volcanic heat!`,
      damage: Math.floor(opts.damage * (0.1 + attacker.getTraitLevelAndUsageModifier('VolcanoStanceImproved'))),
      damageClass: 'fire'
    });
  }
}
