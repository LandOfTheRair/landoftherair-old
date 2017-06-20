
import { Component, Input, OnInit } from '@angular/core';

import { environment } from '../../environments/environment';
import { Item, WeaponClasses } from '../../../models/item';
import { Player } from '../../../models/player';

import { includes } from 'lodash';
import { ColyseusGameService } from '../colyseus.game.service';

export type MenuContext = 'Sack' | 'Belt' | 'Ground' | 'GroundGroup' | 'Equipment' | 'Left' | 'Right' | 'Coin' | 'Merchant' | 'Obtainagain';

@Component({
  selector: 'app-item',
  styles: [`    
    .item-container {
      position: relative;
      height: 64px;
      width: 64px;
    }
    
    .item-container.small {
      transform: scale(0.75, 0.75) translate(-15%, -15%);
    }
    
    .item-container.xsmall {      
      transform: scale(0.5, 0.5) translate(-50%, -50%);
    }

    img {
      width: 64px;
      height: 64px;
      object-fit: none;
      z-index: 550;
      position: absolute;
      top: 0;
    }
    
    .count, .value, .ounces {
      position: absolute;
      color: #000;
      text-shadow: -1px 0 #fff, 0 1px #fff, 1px 0 #fff, 0 -1px #fff;
      font-size: 0.6rem;
      z-index: 560;
    }
    
    .count {
      top: 5px;
      right: 5px;
    }
    
    .value {
      bottom: 5px;
      left: 5px;
    }
    
    .ounces {
      top: 5px;
      left: 5px;
    }
    
    .glow-container {
      border-radius: 50%;
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
    
    <div [contextMenu]="contextMenu">
    
      <div class="item-container" [ngClass]="[size]"
           [isDisabled]="!showDesc" 
           triggers="dblclick:mouseleave" 
           [dragScope]="scopes"
           draggable 
           container="body"
           [dragEnabled]="!displayOnly"
           (mouseenter)="determineScopes()"
           [dragData]="{ item: item, context: context, contextSlot: contextSlot, count: count, containerUUID: containerUUID }"
           [tooltip]="descText">
        <img [src]="imgUrl" [style.object-position]="spriteLocation" />
        <div class="item-background" *ngIf="showBackground"></div>
        <div class="glow-container" [ngClass]="[glowColor]" *ngIf="showDesc"></div>
        <span class="count" *ngIf="realCount > 0">{{ realCount }}x</span>
        <span class="ounces" *ngIf="showOunces && item.ounces > 0">{{ item.ounces }}oz</span>
        <span class="value" *ngIf="showValue">{{ item._buybackValue || item.value }}gp</span>
      </div>
      
    </div>
    
    <context-menu #contextMenu [disabled]="displayOnly">
      <ng-template *ngFor="let action of menuOptions" contextMenuItem let-item
        [visible]="action.visible && action.visible()"
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
  public showDesc = true;

  @Input()
  public showValue = false;

  @Input()
  public showOunces = false;

  @Input()
  public showBackground: boolean;

  @Input()
  public context: MenuContext;

  @Input()
  public contextSlot: number|string;

  @Input()
  public containerUUID: string;

  @Input()
  public size: 'xsmall' | 'small' | 'normal' = 'normal';

  public scopes: string[] = [];

  public menuOptions = [
    { label: 'Sense',         },
    { label: 'Consume',       },
    { label: 'Enchant',       },
    { label: 'Imbue',         },

    { label: 'Equip',         visible: () => this.context !== 'Equipment'
                                          && this.context !== 'GroundGroup'
                                          && (!this.item.owner || this.item.owner === this.player.username)
                                          && this.isEquippable,
                              execute: () => this.doColyseusMoveAction('E') },

    { label: 'To Right Hand', visible: () => this.context === 'Left' || !this.player.rightHand,
                              execute: () => this.doColyseusMoveAction('R')  },

    { label: 'To Left Hand',  visible: () => this.context === 'Right' || !this.player.leftHand,
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
                              execute: () => this.doColyseusMoveAction('B')  },

    { label: 'Use',           visible: () => this.item.canUse && this.item.canUse(this.player)
                                          && this.context !== 'Ground'
                                          && this.context !== 'Equipment',
                              execute: () => this.doColyseusUseAction()  }
  ];

  get displayOnly(): boolean {
    return this.context === 'GroundGroup' || !this.context;
  }

  get isEquippable(): boolean {
    return this.player.canEquip(this.item) && !includes(WeaponClasses, this.item.itemClass);
  }

  get player(): Player {
    return this.colyseusGame.character;
  }

  get realCount() {
    return this.count;
  }

  get imgUrl() {
    if(this.item.itemClass === 'Corpse') {
      return `${environment.client.protocol}://${environment.client.domain}:${environment.client.port}/assets/creatures.png`;
    }
    return `${environment.client.protocol}://${environment.client.domain}:${environment.client.port}/assets/items.png`;
  }

  get glowColor() {
    if(this.item.condition <= 0)     return 'glow-black';
    if(this.item.condition <= 5000)  return 'glow-red';
    if(this.item.condition <= 10000) return 'glow-yellow';
    return '';
  }

  get spriteLocation() {
    const divisor = this.item.itemClass === 'Corpse' ? 40 : 32;
    const y = Math.floor(this.item.sprite / divisor);
    const x = this.item.sprite % divisor;
    return `-${x * 64}px -${y * 64}px`;
  }

  get descText() {
    const item = new Item(this.item);
    return item.descTextFor(this.player);
  }

  constructor(private colyseusGame: ColyseusGameService) {}

  ngOnInit() {
    this.item = new Item(this.item);
  }

  doColyseusMoveAction(choice) {
    this.colyseusGame.buildAction(this.item, { context: this.context, count: this.count, contextSlot: this.contextSlot, containerUUID: this.containerUUID }, choice);
  }

  doColyseusUseAction() {
    this.colyseusGame.buildUseAction(this.item, this.context, this.contextSlot);
  }

  determineScopes() {
    const scopes = [];
    if(this.context !== 'Obtainagain' && this.context !== 'Merchant') {
      scopes.push('ground', 'mapground');

      const itemType = this.player.determineItemType(this.item.itemClass);
      if(itemType !== this.item.itemClass) {
        scopes.push(itemType.toLowerCase());
      }
    }

    if(!this.player.leftHand || !this.player.rightHand || this.context === 'Left' || this.context === 'Right') {
      scopes.push('right', 'left');
    }

    if(this.item.itemClass === 'Coin') scopes.push('coin');

    if(this.item.itemClass !== 'Coin'
    && this.item.itemClass !== 'Corpse'
    && this.context !== 'Obtainagain'
    && this.context !== 'Equipment'
    && this.context !== 'Ground') scopes.push('merchant');

    if(this.item.isSackable) scopes.push('sack');
    if(this.item.isBeltable) scopes.push('belt');

    this.scopes = scopes;
  }

}
