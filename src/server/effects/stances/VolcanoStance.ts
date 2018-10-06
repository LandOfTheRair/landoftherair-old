
import { AugmentSpellEffect, StanceEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { GenderHelper } from '../../helpers/character/gender-helper';
import { Item } from '../../../shared/models/item';

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
    this.effectMessageRadius(char, `${char.name} takes on an explosive stance.`);

    this.loseStat(char, 'armorClass', this.potency);
    this.loseStat(char, 'defense', Math.floor(this.potency / 4));

    this.gainStat(char, 'offense', Math.floor(this.potency / 4));
    this.gainStat(char, 'accuracy', Math.floor(this.potency / 4));
  }

  effectEnd(char: Character) {
    this.effectMessageRadius(char, `${char.name} breaks ${GenderHelper.hisher(char)} explosive stance.`);
  }

  augmentAttack(attacker: Character, defender: Character, opts: { damage: number, damageClass: string }) {

    if(opts.damageClass !== 'physical') return;

    this.magicalAttack(attacker, defender, {
      atkMsg: `You unleash volcanic fury upon %0!`,
      defMsg: `%0 struck you with a burst of volcanic heat!`,
      damage: Math.floor(opts.damage * (0.1 + attacker.getTraitLevelAndUsageModifier('VolcanoStanceImproved'))),
      damageClass: 'fire'
    });
  }

  modifyDamage(attacker: Character, defender: Character, opts: { attackerWeapon: Item, damage: number, damageClass: string }) {
    const { damageClass, damage } = opts;

    if(damageClass !== 'fire') return damage;

    let potency = 0.5;
    potency -= attacker.getTraitLevelAndUsageModifier('VolcanoStanceImproved');
    if(potency <= 0) potency = 0.1;

    return Math.floor(damage * potency);
  }
}
