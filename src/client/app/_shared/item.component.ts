
import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { environment } from '../../environments/environment';
import { Item, WeaponClasses } from '../../../models/item';
import { Player } from '../../../models/player';

import { includes } from 'lodash';
import { ColyseusGameService } from '../colyseus.game.service';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';

export type MenuContext = 'Sack' | 'Belt' | 'Ground' | 'GroundGroup' | 'Equipment' | 'Left' | 'Right' | 'Coin';

@Component({
  selector: 'app-item',
  styles: [`
    :host {
      width: 64px;
      height: 64px;
    }
    
    .item-container {
      position: relative;
      height: 64px;
      width: 64px;
    }

    img {
      width: 64px;
      height: 64px;
      object-fit: none;
      z-index: 550;
      position: absolute;
      top: 0;
    }
    
    .count {
      position: absolute;
      color: #000;
      text-shadow: -1px 0 #fff, 0 1px #fff, 1px 0 #fff, 0 -1px #fff;
      top: 5px;
      right: 5px;
      font-size: 0.7rem;
      z-index: 560;
    }
    
    .glow-container {
      border-radius: 32px;
      height: 64px;
      width: 64px;
      position: absolute;
      top: 0;
      z-index: 540;
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
    
    .item-background {
      height: 64px;
      width: 64px;
      position: absolute;
      top: 0;
    }
  `],
  template: `
    
    <div (contextmenu)="onContextMenu($event)">
    
      <div class="item-container" 
           [isDisabled]="!showDesc" 
           triggers="dblclick:mouseleave" 
           [dragScope]="scopes"
           draggable 
           [dragEnabled]="context !== 'GroundGroup'"
           (mouseenter)="determineScopes()"
           [dragData]="{ item: item, context: context, contextSlot: contextSlot, count: count }"
           [tooltip]="descText">
        <img [src]="imgUrl" [style.object-position]="spriteLocation" />
        <div class="item-background" *ngIf="showBackground"></div>
        <div class="glow-container {{ glowColor }}" *ngIf="showDesc"></div>
        <span class="count" *ngIf="realCount > 0">{{ realCount }}</span>
      </div>
      
    </div>
    
    <context-menu #contextMenu>
      <ng-template *ngFor="let action of menuOptions" contextMenuItem let-item
        [visible]="action.visible()"
        (execute)="action.execute()">
        {{ action.label }}
      </ng-template>
    </context-menu>
  `
})
export class ItemComponent implements OnInit {

  @Input()
  public item: Item;

  @Input()
  public count: number;

  @Input()
  public showDesc: boolean;

  @Input()
  public showBackground: boolean;

  @Input()
  public context: MenuContext;

  @Input()
  public contextSlot: number|string;

  @ViewChild('contextMenu')
  public contextMenu: ContextMenuComponent;

  public scopes: string[] = [];

  public menuOptions = [
    { label: 'Sense',         visible: () => false },
    { label: 'Consume',       visible: () => false },
    { label: 'Enchant',       visible: () => false },
    { label: 'Imbue',         visible: () => false },

    { label: 'Equip',         visible: () => this.context !== 'Equipment'
                                          && this.context !== 'GroundGroup'
                                          && (!this.item.owner || this.item.owner === this.player.username)
                                          && this.isEquippable,
                              execute: () => this.doColyseusMoveAction('E') },

    { label: 'To Right Hand', visible: () => !this.player.rightHand,
                              execute: () => this.doColyseusMoveAction('R')  },

    { label: 'To Left Hand',  visible: () => !this.player.leftHand,
                              execute: () => this.doColyseusMoveAction('L')  },

    { label: 'To Ground',     visible: () => this.context !== 'Ground'
                                          && this.context !== 'GroundGroup',
                              execute: () => this.doColyseusMoveAction('G')  },

    { label: 'To Sack',       visible: () => this.context !== 'Sack'
                                          && this.context !== 'Coin'
                                          && this.item.isSackable,
                              execute: () => this.doColyseusMoveAction('S')  },

    { label: 'To Belt',       visible: () => this.context !== 'Belt'
                                          && this.item.isBeltable,
                              execute: () => this.doColyseusMoveAction('B')  }
  ];

  get hasMenu() {
    return this.context !== 'GroundGroup';
  }

  get isEquippable(): boolean {
    return this.player.canEquip(this.item) && !includes(WeaponClasses, this.item.itemClass);
  }

  get player(): Player {
    return this.colyseusGame.character;
  }

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

  constructor(private colyseusGame: ColyseusGameService, public contextMenuService: ContextMenuService) {}

  public onContextMenu($event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();

    if(!this.hasMenu) {
      return false;
    }

    this.contextMenuService.show.next({
      contextMenu: this.contextMenu,
      event: $event,
      item: {}
    });

    return false;
  }

  ngOnInit() {
    this.item = new Item(this.item);
  }

  doColyseusMoveAction(choice) {
    this.colyseusGame.buildAction(this.item, { context: this.context, count: this.count, contextSlot: this.contextSlot }, choice);
  }

  determineScopes() {
    const scopes = ['ground', 'mapground'];
    const itemType = this.player.determineItemType(this.item.itemClass);
    if(itemType !== this.item.itemClass) {
      scopes.push(itemType.toLowerCase());
    }

    if(!this.player.leftHand || !this.player.rightHand) {
      scopes.push('right');
      scopes.push('left');
    }

    if(this.item.itemClass === 'Coin') scopes.push('coin');

    if(this.item.isSackable) scopes.push('sack');
    if(this.item.isBeltable) scopes.push('belt');

    this.scopes = scopes;
  }

}
