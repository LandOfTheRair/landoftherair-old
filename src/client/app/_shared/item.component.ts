
import { Component, Input } from '@angular/core';

import { environment } from '../../environments/environment';
import { Item } from '../../../models/item';
import { Player } from '../../../models/player';

@Component({
  selector: 'app-item',
  styles: [`
    .item-container {
      position: relative;
    }

    img {
      width: 64px;
      height: 64px;
      object-fit: none;
    }
    
    .count {
      position: absolute;
      color: #000;
      text-shadow: -1px 0 #fff, 0 1px #fff, 1px 0 #fff, 0 -1px #fff;
      top: 5px;
      right: 5px;
      font-size: 0.7rem;
    }
    
    .glow-container {
      border-radius: 32px;
      height: 64px;
      width: 64px;
      position: absolute;
      top: 0;
    }
    
    .glow-yellow {
      box-shadow: inset 0 0 14px #f60;
    }
    
    .glow-red {
      box-shadow: inset 0 0 14px #f00;
    }
    
    .glow-black {
      box-shadow: inset 0 0 14px #000;
    }
  `],
  template: `
    <div class="item-container" [isDisabled]="!showDesc" triggers="dblclick:mouseleave" [tooltip]="descText">
      <img [src]="imgUrl" [style.object-position]="spriteLocation" />
      <div class="glow-container {{ glowColor }}" *ngIf="showDesc"></div>
      <span class="count" *ngIf="realCount > 0">{{ realCount }}</span>
    </div>
  `
})
export class ItemComponent {

  @Input()
  public item: Item;

  @Input()
  public count: number;

  @Input()
  public showDesc: boolean;

  @Input()
  public player: Player;

  get realCount() {
    if(this.item.itemClass === 'Coin') return this.item.value;
    return this.count;
  }

  get imgUrl() {
    return `${environment.client.protocol}://${environment.client.domain}:${environment.client.port}/assets/items.png`;
  }

  get glowColor() {
    if(this.item.condition <= 0)     return 'glow-black';
    if(this.item.condition <= 5000)  return 'glow-red';
    if(this.item.condition <= 10000) return 'glow-yellow';
    return '';
  }

  get spriteLocation() {
    const y = Math.floor(this.item.sprite/32);
    const x = this.item.sprite%32;
    return `-${x*64}px -${y*64}px`;
  }

  get descText() {
    const item = new Item(this.item);
    return item.descTextFor(this.player);
  }

  // TODO draggable, highlight appropriate containers with red border if not usable and green border if usable
}
