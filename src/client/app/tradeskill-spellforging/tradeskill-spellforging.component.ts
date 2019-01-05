import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import { capitalize, startCase, get, sortBy } from 'lodash';
import { toRoman } from 'roman-numerals';
import { Item } from '../../../shared/models/item';
import { SpellforgingHelper } from '../../../server/helpers/tradeskill/spellforging-helper';
import { ItemUpgrade } from '../../../shared/interfaces/item';
import * as _ from 'lodash';

@Component({
  selector: 'app-tradeskill-spellforging',
  templateUrl: './tradeskill-spellforging.component.html',
  styleUrls: ['./tradeskill-spellforging.component.scss']
})
export class TradeskillSpellforgingComponent {

  public disenchantType = 'Single';

  get player() {
    return this.colyseusGame.character;
  }

  get items() {
    return get(this.player, 'tradeSkillContainers.spellforging.items', []);
  }

  get item() {
    return this.player.tradeSkillContainers.spellforging.modifyItem;
  }

  get slots() {
    const item = this.item;
    return Array.from(Array(item.maxEnchantLevel || 0).keys());
  }

  get brickTypes(): string[] {
    if(!this.player) return [];
    return Object.keys(this.player.tradeSkillContainers.spellforging.dustValues).map(x => capitalize(x));
  }

  get disenchantDisabled(): boolean {
    return (!this.player.tradeSkillContainers.spellforging.modifyItem || !!this.player.tradeSkillContainers.spellforging.reagent) && this.disenchantType === 'Single';
  }

  get enchantDisabled(): boolean {
    return !this.player.tradeSkillContainers.spellforging.reagent;
  }

  get showInfo(): boolean {
    const item = this.item;
    const reagent = this.player.tradeSkillContainers.spellforging.reagent;
    return !!(item && reagent);
  }

  get hasWarning(): boolean {
    if(!this.showInfo) return false;
    const item = this.item;
    const reagent = this.player.tradeSkillContainers.spellforging.reagent;
    if(!item.trait || !reagent.trait) return false;
    return reagent.itemClass === 'Scroll' && (item.trait.name !== reagent.trait.name || item.trait.level !== reagent.trait.level);
  }

  get hasEffectWarning(): boolean {
    if(!this.showInfo) return false;
    const item = this.item;
    const reagent = this.player.tradeSkillContainers.spellforging.reagent;
    if(!item.effect || !reagent.effect) return false;
    return item.effect.name !== reagent.effect.name || item.effect.potency !== reagent.effect.potency;
  }

  get successChance(): number {
    return SpellforgingHelper.successPercent(this.player);
  }

  get allSackItemTypes() {
    if(!this.colyseusGame.character) return [];

    return _(this.colyseusGame.character.sack.allItems)
      .map('itemClass')
      .uniq()
      .sort()
      .value();
  }

  constructor(public colyseusGame: ColyseusGameService) { }

  dustValue(dustType) {
    return this.player.tradeSkillContainers.spellforging.dustValues[dustType.toLowerCase()];
  }

  formatTrait(item: Item) {
    if(!item.trait) return '';
    return `${startCase(item.trait.name)} ${toRoman(item.trait.level)}`;
  }

  formatTooltip(upgrade: ItemUpgrade) {

    return sortBy(Object.keys(upgrade.stats))
      .map(key => `${key.toUpperCase()} ${upgrade.stats[key] > 0 ? '+' : ''}${upgrade.stats[key]}`)
      .join(', ');
  }

  canBuyBrick(dustType): boolean {
    return this.dustValue(dustType) >= 100;
  }

  forge(type: string) {
    this.colyseusGame.sendRawCommand('forge', `${this.colyseusGame.showSpellforging.uuid} ${type}`);
  }

  disenchant() {
    this.colyseusGame.sendRawCommand('disenchant', this.colyseusGame.showSpellforging.uuid);
  }

  enchant() {
    this.colyseusGame.sendRawCommand('enchant', this.colyseusGame.showSpellforging.uuid);
  }

  disenchantall() {
    this.colyseusGame.sendRawCommand('disenchantall', `${this.colyseusGame.showSpellforging.uuid} ${this.disenchantType}`);
  }

}
