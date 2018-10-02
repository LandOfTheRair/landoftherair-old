import { nonenumerable } from 'nonenumerable';
import { Character } from '../../../../shared/models/character';
import { NPC } from '../../../../shared/models/npc';
import { CrazedTonwinAIBehavior } from '../crazedtonwin';
import { Skill } from '../../../base/Skill';
import { Boost, Haste, VitalEssence } from '../../../effects';
import { AttributeEffect, SpellEffect } from '../../../base/Effect';
import { Item } from '../../../../shared/models/item';

export class Invulnerable extends SpellEffect implements AttributeEffect {
  iconData = {
    name: 'skull-shield',
    bgColor: '#a06',
    color: '#fff',
    tooltipDesc: 'Invulnerable. Cannot receive damage from any source.'
  };

  @nonenumerable
  private aiRef: CrazedTonwinAIBehavior;

  cast(caster: NPC, target: NPC, skillRef?, ai?: CrazedTonwinAIBehavior) {
    this.flagPermanent(caster.uuid);
    this.aiRef = ai;
    target.applyEffect(this);
  }

  effectTick(char: Character) {
    if(this.aiRef.livingBrothers.length > 0) return;

    this.effectEnd(char);
    char.unapplyEffect(this);
  }

  modifyDamage(attacker: Character, defender: Character, opts: { attackerWeapon: Item, damage: number, damageClass: string }) {
    return 0;
  }
}

export class BrotherlySpeed extends Haste {
  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(caster.uuid);
    this.effectInfo.canManuallyUnapply = false;
    super.cast(caster, target, skillRef);
  }
}

export class BrotherlyShield extends VitalEssence {
  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(caster.uuid);
    this.effectInfo.canManuallyUnapply = false;
    this.potency = 30;
    super.cast(caster, target, skillRef);
  }
}

export class BrotherlySword extends Boost {
  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(caster.uuid);
    this.effectInfo.canManuallyUnapply = false;
    this.potency = 5;
    super.cast(caster, target, skillRef);
  }
}
