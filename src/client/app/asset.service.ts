import { Injectable } from '@angular/core';

import { environment } from '../environments/environment';
import { LocalStorage } from 'ngx-webstorage';

@Injectable()
export class AssetService {

  @LocalStorage()
  public customURLs: any;

  constructor() {
    if(!this.customURLs) this.customURLs = {};
  }

  get assetUrl(): string {
    return `${environment.client.protocol}://${environment.client.domain}:${environment.client.port}/assets`;
  }

  get terrainUrl(): string {
    return this.customURLs.terrain || `${this.assetUrl}/spritesheets/terrain.png?c=${environment.assetHashes.terrain}`;
  }

  get wallsUrl(): string {
    return this.customURLs.walls || `${this.assetUrl}/spritesheets/walls.png?c=${environment.assetHashes.walls}`;
  }

  get decorUrl(): string {
    return this.customURLs.decor || `${this.assetUrl}/spritesheets/decor.png?c=${environment.assetHashes.decor}`;
  }

  get swimmingUrl(): string {
    return this.customURLs.swimming || `${this.assetUrl}/spritesheets/swimming.png?c=${environment.assetHashes.swimming}`;
  }

  get creaturesUrl(): string {
    return this.customURLs.creatures || `${this.assetUrl}/spritesheets/creatures.png?c=${environment.assetHashes.creatures}`;
  }

  get itemsUrl(): string {
    return this.customURLs.items || `${this.assetUrl}/spritesheets/items.png?c=${environment.assetHashes.items}`;
  }

  get effectsUrl(): string {
    return this.customURLs.effects || `${this.assetUrl}/spritesheets/effects.png?c=${environment.assetHashes.effects}`;
  }

  get customKeys(): string[] {
    return ['decor', 'walls', 'items', 'creatures', 'swimming', 'terrain', 'effects'];
  }

  get preloadAssets(): string[] {
    return [
      this.decorUrl,
      this.wallsUrl,
      this.itemsUrl,
      this.creaturesUrl,
      this.swimmingUrl,
      this.terrainUrl,
      this.effectsUrl
    ];
  }

  // force nglocalstoage to update
  updateURLs() {
    this.customURLs = this.customURLs;
  }

}
