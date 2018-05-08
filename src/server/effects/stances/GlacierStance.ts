
import { AttributeEffect, AugmentSpellEffect, StanceEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { GenderHelper } from '../../helpers/character/gender-helper';
import { Item } from '../../../shared/models/item';

export class GlacierStance extends StanceEffect implements AugmentSpellEffect, AttributeEffect {

  static get skillRequired() { return 0; }
  protected skillRequired = GlacierStance.skillRequired;

  iconData = {
    name: 'frozen-orb',
    bgColor: '#000',
    color: '#000080',
    tooltipDesc: 'Stance. Acting defensively.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill): boolean {
    const foundSelf = super.cast(caster, target, skillRef);
    if(foundSelf) return foundSelf;
    this.flagPermanent(caster.uuid);
    this.potency = caster.calcSkillLevel(caster.rightHand.type);
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessageRadius(char, `${char.name} takes on a glacial stance.`);

    this.gainStat(char, 'armorClass', this.potency);
    this.gainStat(char, 'defense', Math.floor(this.potency / 4));

    this.loseStat(char, 'offense', Math.floor(this.potency / 4));
    this.loseStat(char, 'accuracy', Math.floor(this.potency / 4));
  }

  effectEnd(char: Character) {
    this.effectMessageRadius(char, `${char.name} breaks ${GenderHelper.hisher(char)} glacial stance.`);
  }

  augmentAttack(attacker: Character, defender: Character, opts: { damage: number, damageClass: string }) {

    if(opts.damageClass !== 'physical') return;

    this.magicalAttack(attacker, defender, {
      atkMsg: `You unleash glacial fury upon ${defender.name}!`,
      defMsg: `${this.getCasterName(attacker, defender)} struck you with a burst of glacial frost!`,
      damage: Math.floor(opts.damage * (0.1 + attacker.getTraitLevelAndUsageModifier('GlacierStanceImproved'))),
      damageClass: 'ice'
    });
  }

  modifyDamage(attacker: Character, defender: Character, opts: { attackerWeapon: Item, damage: number, damageClass: string }) {
    const { damageClass, damage } = opts;

    if(damageClass !== 'ice') return damage;

    let potency = 0.5;
    potency -= attacker.getTraitLevelAndUsageModifier('GlacierStanceImproved');
    if(potency <= 0) potency = 0.1;

    return Math.floor(damage * potency);
  }
}
