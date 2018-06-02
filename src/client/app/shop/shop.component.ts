import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent {

  public sellType: string;

  public shopSlots = Array(25).fill(null).map((x, i) => i);
  public buybackSlots = Array(5).fill(null).map((x, i) => i);

  constructor(public colyseusGame: ColyseusGameService) { }

  get allSackItemTypes() {
    return _(this.colyseusGame.character.sack.allItems)
      .map('itemClass')
      .uniq()
      .sort()
      .value();
  }

  public sellItemType() {
    this.colyseusGame.sendCommandString(`${this.colyseusGame.showShop.uuid}, sell ${this.sellType}`);
  }

  public overriddenValueDisplay(slot): number|string {
    const item = this.colyseusGame.showShop.vendorItems[slot];
    if(!item || !item.daily) return null;

    if(!this.colyseusGame.character.canBuyDailyItem(item)) return 'SOLD OUT';
    return null;
  }

}
