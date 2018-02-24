import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import { capitalize } from 'lodash';
import { MetalworkingHelper } from '../../../server/helpers/metalworking-helper';

@Component({
  selector: 'app-tradeskill-metalworking',
  templateUrl: './tradeskill-metalworking.component.html',
  styleUrls: ['./tradeskill-metalworking.component.scss']
})
export class TradeskillMetalworkingComponent {

  get player() {
    return this.colyseusGame.character;
  }

  get ingotTypes(): string[] {
    return Object.keys(this.player.tradeSkillContainers.metalworking.oreValues).map(x => capitalize(x));
  }

  get successChance(): number {
    return MetalworkingHelper.successPercent(this.player);
  }

  get craftDisabled(): boolean {
    return false;
  }

  get upgradeDisabled(): boolean {
    return false;
  }

  get showInfo(): boolean {
    const item = this.player.tradeSkillContainers.metalworking.upgradeItem;
    const reagent = this.player.tradeSkillContainers.metalworking.upgradeReagent;
    return item && reagent;
  }

  constructor(public colyseusGame: ColyseusGameService) { }

  oreValue(oreType) {
    return this.player.tradeSkillContainers.metalworking.oreValues[oreType.toLowerCase()];
  }

  canSmeltIngot(oreType): boolean {
    return this.oreValue(oreType) >= 100;
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

}
