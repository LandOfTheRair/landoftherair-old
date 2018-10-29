
import { capitalize, includes } from 'lodash';

import { AttributeEffect, SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { Item, SharpWeaponClasses } from '../../../shared/models/item';
import { NPC } from '../../../shared/models/npc';

type AttributeType =

// base types
  'physical'
| 'blunt'
| 'sharp'
| 'magical'
| 'necrotic'
| 'fire'
| 'ice'
| 'water'
| 'energy'
| 'poison'
| 'disease'

// special types
| 'turkey';

const ResistanceShredders = {
  Undead: 'EtherFire',
  Beast: 'BeastRipper',
  Dragon: 'ScaleShredder'
};

export class Attribute extends SpellEffect implements AttributeEffect {

  iconData = {
    name: 'uncertainty',
    color: '#000',
    tooltipDesc: 'Damage is modified.'
  };

  private damageType: AttributeType;
  private unableToShred: boolean;

  private determineColor(attr: AttributeType) {
    switch(attr) {
      case 'physical': return '#000';
      case 'sharp':    return '#000';
      case 'blunt':    return '#000';
      case 'turkey':   return '#000';

      case 'magical':  return '#f0f';
      case 'necrotic': return '#0a0';
      case 'fire':     return '#DC143C';
      case 'ice':      return '#000080';
      case 'water':    return '#1a1aff';
      case 'energy':   return '#f0f';
    }
  }

  cast(caster: Character, target: Character, skillRef?: Skill) {

    if(!this.duration) this.flagPermanent(caster.uuid);
    this.flagCasterName(caster.name);

    // descendant attributes (like ether fire) will not trigger this change, and will work
    if(this.name === 'Attribute') {
      if(target.isPlayer()) throw new Error(`Cannot apply attribute ${this.damageType} to a player ${target.name}!`);
      this.name = `${this.damageType}Attribute`;
    }

    // a potency of 1 means nothing
    if(this.potency === 1) return;

    this.iconData.color = this.determineColor(this.damageType);
    this.iconData.name = this.potency < 1 ? 'edged-shield' : 'gooey-impact';
    this.iconData.tooltipDesc = `${capitalize(this.damageType)} damage is ${Math.floor(this.potency * 100)}% effective.`;

    if(this.potency <= 0) this.potency = 0;
    if(this.potency === 0) this.iconData.tooltipDesc = `Immune to ${capitalize(this.damageType)} damage.`;

    if(this.damageType === 'turkey') {
      this.iconData.name = 'bird-twitter';
      this.iconData.tooltipDesc = 'Immune to all damage, except from blunderbuss-type weapons.';
      this.unableToShred = true;
    }

    if(this.unableToShred) this.iconData.tooltipDesc = `${this.iconData.tooltipDesc} Not bypassable.`;

    target.applyEffect(this);
  }

  modifyDamage(attacker: Character, defender: Character, opts: { attackerWeapon: Item, damage: number, damageClass: string }) {

    const monsterClass = (<NPC>defender).monsterClass;

    const { damageClass, attackerWeapon, damage } = opts;

    if(this.damageType === 'turkey') {
      if(attackerWeapon && attackerWeapon.itemClass === 'Blunderbuss') return damage;
      return 0;
    }

    // if you have something that ignores resistance, then it is ignored
    if(attacker
    && monsterClass
    && !this.unableToShred
    && ResistanceShredders[monsterClass]
    && attacker.hasEffect(ResistanceShredders[monsterClass])
    && this.potency < 1) return damage;

    if(damageClass === this.damageType)                                                             return Math.floor(damage * this.potency);

    if(damageClass === 'physical') {

      // if you have a weapon, it can be classed
      if(attackerWeapon) {
        if(this.damageType === 'blunt' && !includes(SharpWeaponClasses, attackerWeapon.itemClass))  return Math.floor(damage * this.potency);
        if(this.damageType === 'sharp' && includes(SharpWeaponClasses, attackerWeapon.itemClass))   return Math.floor(damage * this.potency);

      // no weapon = blunt
      } else {
        if(this.damageType === 'blunt')                                                             return Math.floor(damage * this.potency);
      }
    }

    const magicClasses = ['necrotic', 'fire', 'ice', 'water', 'energy', 'poison', 'disease'];
    if(this.damageType === 'magical'
    && includes(magicClasses, damageClass))                                                         return Math.floor(damage * this.potency);

    return damage;
  }
}
