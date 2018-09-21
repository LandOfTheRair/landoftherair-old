
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

const hash = {
  Onehanded: 'katana',
  Twohanded: 'relic-blade',
  Shortsword: 'gladius',
  Staff: 'bo',
  Polearm: 'sharp-halberd',
  Axe: 'battered-axe',
  Dagger: 'plain-dagger',
  Mace: 'flanged-mace',
  Martial: 'black-belt',
  Ranged: 'high-shot',
  Throwing: 'thrown-spear',
  Thievery: 'two-shadows',
  Wand: 'orb-wand',
  Restoration: 'ankh',
  Conjuration: 'enlightenment',

  Alchemy: 'apothecary',
  Spellforging: 'spell-book',
  Metalworking: 'ore',
  Survival: 'dig-dug',

  Unknown: 'uncertainty'
};

const tooltips = {
  Onehanded: 'One-Handed Swords',
  Twohanded: 'Two-Handed Weapons',
  Shortsword: 'Shortswords',
  Staff: 'Staves',
  Polearm: 'Polearms',
  Axe: 'Axes',
  Dagger: 'Daggers',
  Mace: 'Maces',
  Martial: 'Martial',
  Ranged: 'Ranged Weapons',
  Throwing: 'Thrown Weapons',
  Thievery: 'Thievery',
  Wand: 'Magical Weapons',
  Restoration: 'Restoration Magic',
  Conjuration: 'Conjuration Magic',

  Alchemy: 'Alchemy',
  Spellforging: 'Spellforging',
  Metalworking: 'Metalworking',
  Survival: 'Survival',

  Unknown: 'Unknown'
};

@Component({
  selector: 'app-skill-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-icon [name]="icon" [tooltip]="tooltip" container="body" bgColor="transparent"></app-icon>
  `
})
export class SkillIconComponent {

  @Input()
  public skillName: string;

  get icon() {
    return hash[this.skillName];
  }

  get tooltip() {
    return tooltips[this.skillName];
  }
}
