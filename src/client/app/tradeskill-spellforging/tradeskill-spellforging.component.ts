import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import { capitalize, startCase } from 'lodash';
import { toRoman } from 'roman-numerals';
import { Item } from '../../../shared/models/item';
import { SpellforgingHelper } from '../../../server/helpers/tradeskill/spellforging-helper';

@Component({
  selector: 'app-tradeskill-spellforging',
  templateUrl: './tradeskill-spellforging.component.html',
  styleUrls: ['./tradeskill-spellforging.component.scss']
})
export class TradeskillSpellforgingComponent {

  get player() {
    return this.colyseusGame.character;
  }

  get items() {
    return (<any>this.player.tradeSkillContainers.spellforging).items;
  }

  get brickTypes(): string[] {
    return Object.keys(this.player.tradeSkillContainers.spellforging.dustValues).map(x => capitalize(x));
  }

  get disenchantDisabled(): boolean {
    return !this.player.tradeSkillContainers.spellforging.modifyItem || !!this.player.tradeSkillContainers.spellforging.reagent;
  }

  get enchantDisabled(): boolean {
    return !this.player.tradeSkillContainers.spellforging.reagent;
  }

  get showInfo(): boolean {
    const item = this.player.tradeSkillContainers.spellforging.modifyItem;
    const reagent = this.player.tradeSkillContainers.spellforging.reagent;
    return !!(item && reagent);
  }

  get hasWarning(): boolean {
    if(!this.showInfo) return false;
    const item = this.player.tradeSkillContainers.spellforging.modifyItem;
    const reagent = this.player.tradeSkillContainers.spellforging.reagent;
    if(!item.trait || !reagent.trait) return false;
    return item.trait.name !== reagent.trait.name || item.trait.level !== reagent.trait.level;
  }

  get hasEffectWarning(): boolean {
    if(!this.showInfo) return false;
    const item = this.player.tradeSkillContainers.spellforging.modifyItem;
    const reagent = this.player.tradeSkillContainers.spellforging.reagent;
    if(!item.effect || !reagent.effect) return false;
    return item.effect.name !== reagent.effect.name || item.effect.potency !== reagent.effect.potency;
  }

  get successChance(): number {
    return SpellforgingHelper.successPercent(this.player);
  }

  constructor(public colyseusGame: ColyseusGameService) { }

  dustValue(dustType) {
    return this.player.tradeSkillContainers.spellforging.dustValues[dustType.toLowerCase()];
  }

  formatTrait(item: Item) {
    if(!item.trait) return '';
    return `${startCase(item.trait.name)} ${toRoman(item.trait.level)}`;
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

}
