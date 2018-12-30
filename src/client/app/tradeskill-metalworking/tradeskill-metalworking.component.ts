import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import { capitalize, sortBy, get } from 'lodash';
import { MetalworkingHelper } from '../../../server/helpers/tradeskill/metalworking-helper';
import { ItemUpgrade } from '../../../shared/interfaces/item';

@Component({
  selector: 'app-tradeskill-metalworking',
  templateUrl: './tradeskill-metalworking.component.html',
  styleUrls: ['./tradeskill-metalworking.component.scss']
})
export class TradeskillMetalworkingComponent {

  get items() {
    return get(this.player, 'tradeSkillContainers.metalworking.items', []);
  }

  get item() {
    return this.player.tradeSkillContainers.metalworking.upgradeItem;
  }

  get slots() {
    const item = this.item;
    return Array.from(Array(item.maxEnchantLevel || 0).keys());
  }

  get player() {
    return this.colyseusGame.character;
  }

  get ingotTypes(): string[] {
    if(!this.player || !this.player.tradeSkillContainers) return [];
    return Object.keys(this.player.tradeSkillContainers.metalworking.oreValues).map(x => capitalize(x));
  }

  get successChance(): number {
    return MetalworkingHelper.successPercent(this.player);
  }

  get craftDisabled(): boolean {
    if(!this.player || !this.player.tradeSkillContainers) return true;
    const item = this.player.tradeSkillContainers.metalworking.craftItem;
    const reagent = this.player.tradeSkillContainers.metalworking.craftReagent;
    return !item || !reagent;
  }

  get upgradeDisabled(): boolean {
    if(!this.player || !this.player.tradeSkillContainers) return true;
    const item = this.player.tradeSkillContainers.metalworking.upgradeItem;
    const reagent = this.player.tradeSkillContainers.metalworking.upgradeReagent;
    return !item || !reagent;
  }

  get showInfo(): boolean {
    return !this.upgradeDisabled;
  }

  constructor(public colyseusGame: ColyseusGameService) { }

  oreValue(oreType): number {
    if(!this.player || !this.player.tradeSkillContainers) return 0;
    return this.player.tradeSkillContainers.metalworking.oreValues[oreType.toLowerCase()];
  }

  canSmeltIngot(oreType): boolean {
    return this.oreValue(oreType) >= 50;
  }

  smelt(type: string) {
    this.colyseusGame.sendRawCommand('smelt', `${this.colyseusGame.showMetalworking.uuid} ${type}`);
  }

  craft() {
    this.colyseusGame.sendRawCommand('craft', this.colyseusGame.showMetalworking.uuid);
  }

  upgrade() {
    this.colyseusGame.sendRawCommand('upgrade', this.colyseusGame.showMetalworking.uuid);
  }

  formatTooltip(upgrade: ItemUpgrade) {

    return sortBy(Object.keys(upgrade.stats))
      .map(key => `${key.toUpperCase()} ${upgrade.stats[key] > 0 ? '+' : ''}${upgrade.stats[key]}`)
      .join(', ');
  }

}
