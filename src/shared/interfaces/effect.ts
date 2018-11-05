import { ICharacter, StatName } from './character';
import { Item } from '../models/item';

export const Maxes = {
  Lesser: 10,
  Bradley: 13,
  Minor: 15,
  Basic: 18,
  Greater: 21,
  Major: 24,
  Advanced: 27,
  Pure: 30
};

export interface EffectInfo {
  damage?: number;
  damageFactor?: number;
  caster: string;
  casterName?: string;
  isPermanent?: boolean;
  isFrozen?: boolean;
  canManuallyUnapply?: boolean;
  enrageTimer?: number;
}

export interface IEffect {
  name: string;
  iconData: any;
  duration: number;
  charges?: number;
  autocast: boolean;

  allBoosts: { [key: string]: number };
  setPotency: number;

  effectInfo: EffectInfo;
  casterRef: any;

  shouldNotShowMessage: boolean;
  hasEnded: boolean;

  gainStat(char: ICharacter, stat: StatName, value: number): void;
  loseStat(char: ICharacter, stat: StatName, value: number): void;
  canBeUnapplied(): boolean;

  tick(char: ICharacter): void;
  effectTick(char: ICharacter): void;
  effectStart(char: ICharacter): void;
  effectEnd(char: ICharacter): void;

  effectMessage(char: ICharacter, message: string|any, shouldQueue: boolean): void;
  effectMessageRadius(char: ICharacter, message: string|any, radius: number, ignore: string[]): void;

  skillFlag(caster: ICharacter): void;
  magicalAttack(caster: ICharacter, ref: any, opts: any): void;
}


export interface AugmentSpellEffect extends IEffect {
  augmentAttack(attacker: ICharacter, defender: ICharacter, opts: { damage: number, damageClass: string });
}

export interface AttributeEffect extends IEffect  {
  modifyDamage(attacker: ICharacter, defender: ICharacter, opts: { attackerWeapon: Item, damage: number, damageClass: string });
}

export interface OnHitEffect extends IEffect  {
  onHit(attacker: ICharacter, defender: ICharacter, opts: { damage: number, damageClass: string });
}
