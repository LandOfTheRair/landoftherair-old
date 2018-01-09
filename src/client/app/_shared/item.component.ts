
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { Item, WeaponClasses } from '../../../shared/models/item';
import { Player } from '../../../shared/models/player';

import { includes } from 'lodash';
import { ColyseusGameService } from '../colyseus.game.service';
import { AssetService } from '../asset.service';

const POSSIBLE_TRADESKILL_SCOPES = ['Alchemy', 'Spellforging'];

export type MenuContext = 'Sack' | 'Belt' | 'Ground'
                        | 'GroundGroup' | 'Equipment' | 'Left'
                        | 'Right' | 'Coin' | 'Merchant'
                        | 'Obtainagain' | 'Wardrobe' | 'Tradeskill';

@Component({
  selector: 'app-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`    
    .item-container {
      position: relative;
      height: 64px;
      width: 64px;
    }
    
    .item-container.small {
      max-height: 48px;
      max-width: 48px;
      transform: scale(0.75, 0.75) translate(-15%, -15%);
    }
    
    .item-container.xsmall {   
      max-height: 32px;
      max-width: 32px;   
      transform: scale(0.5, 0.5) translate(-50%, -50%);
    }

    img {
      width: 64px;
      height: 64px;
      object-fit: none;
      z-index: 550;
      position: absolute;
      top: 0;
      pointer-events: none;
    }
    
    .count, .value, .ounces {
      position: absolute;
      color: #000;
      text-shadow: -1px 0 #fff, 0 1px #fff, 1px 0 #fff, 0 -1px #fff;
      font-size: 0.8rem;
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
      animation: glow-yellow 800ms ease-out infinite alternate;
    }
    
    .glow-red {
      animation: glow-red 400ms ease-out infinite alternate;
    }
    
    .glow-black {
      animation: glow-black 200ms ease-out infinite alternate;
    }

    @keyframes glow-yellow {
      0% {
        box-shadow: inset 0 0 10px #f60;
      }
      100% {
        box-shadow: inset 0 0 15px #f60;
      }
    }

    @keyframes glow-red {
      0% {
        box-shadow: inset 0 0 15px #f00;
      }
      100% {
        box-shadow: inset 0 0 20px #f00;
      }
    }

    @keyframes glow-black {
      0% {
        box-shadow: inset 0 0 20px #000;
      }
      100% {
        box-shadow: inset 0 0 30px #000;
      }
    }
    
    .item-background {
      height: 64px;
      width: 64px;
      position: absolute;
      top: 0;
    }
    
    .encrust {
      transform: scale(0.65, 0.65) translate(45%, -45%);
    }
  `],
  template: `    
    <div class="item-container" 
         [ngClass]="[size]"
         [isDisabled]="!showDesc" 
         triggers="dblclick:mouseleave"
         [dragScope]="scopes"
         draggable 
         container="body"
         [dragEnabled]="!displayOnly"
         (mouseenter)="determineScopes()"
         (contextmenu)="automaticallyTakeActionBasedOnOpenWindows()"
         [dragData]="{ item: item, context: context, contextSlot: contextSlot, count: count, containerUUID: containerUUID }"
         [tooltip]="descText">
      <img [src]="imgUrl" [style.object-position]="spriteLocation" />
      <img [src]="imgUrl" [style.object-position]="encrustLocation" class="encrust" *ngIf="showEncrust && item.encrust" />
      <div class="item-background" *ngIf="showBackground"></div>
      <div class="glow-container" [ngClass]="[glowColor]" *ngIf="showDesc"></div>
      <span class="count" *ngIf="realCount > 0">{{ realCount }}x</span>
      <span class="ounces" *ngIf="showOunces && item.ounces > 0">{{ item.ounces }}oz</span>
      <span class="value" *ngIf="showValue">{{ overrideValue || (item._buybackValue || item.value) + 'g' }}</span>
      <span class="value" *ngIf="showOunces && item.succorInfo">{{ item.succorInfo.map }}</span>
    </div>
    
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
  public showEncrust = true;

  @Input()
  public context: MenuContext;

  @Input()
  public contextSlot: number|string;

  @Input()
  public containerUUID: string;

  @Input()
  public overrideValue: number|string;

  @Input()
  public size: 'xsmall' | 'small' | 'normal' = 'normal';

  public scopes: string[] = [];

  get displayOnly(): boolean {
    return !this.context;
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
      return this.assetService.creaturesUrl;
    }

    return this.assetService.itemsUrl;
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

  get encrustLocation() {
    const divisor = 32;
    const y = Math.floor(this.item.encrust.sprite / divisor);
    const x = this.item.encrust.sprite % divisor;
    return `-${x * 64}px -${y * 64}px`;
  }

  get descText() {
    const item = new Item(this.item);
    return item.descTextFor(this.player);
  }

  constructor(private colyseusGame: ColyseusGameService, private assetService: AssetService) {}

  ngOnInit() {
    this.item = new Item(this.item);
  }

  doColyseusMoveAction(choice) {
    this.colyseusGame.buildAction(this.item, {
      context: this.context,
      count: this.count,
      contextSlot: this.contextSlot,
      containerUUID: this.containerUUID
    }, choice);
  }

  doColyseusUseAction() {
    this.colyseusGame.buildUseAction(this.item, this.context, this.contextSlot);
  }

  determineScopes() {
    const scopes = [];

    if(this.context !== 'Obtainagain' && this.context !== 'Merchant') {
      scopes.push('ground', 'mapground');

      const itemType = this.player.determineItemType(this.item.itemClass);
      scopes.push(itemType.toLowerCase());
    }

    if(!this.player.leftHand || !this.player.rightHand || this.context === 'Left' || this.context === 'Right') {
      scopes.push('right', 'left');
    }

    if(this.item.itemClass === 'Coin') {
      scopes.push('coin');
    }

    if(this.item.itemClass !== 'Coin'
    && this.item.itemClass !== 'Corpse'
    && this.context !== 'Obtainagain'
    && this.context !== 'Equipment'
    && this.context !== 'Ground') scopes.push('merchant');

    if(this.item.itemClass !== 'Coin'
    && this.item.itemClass !== 'Corpse') {
      scopes.push('wardrobe');

      if(this.context !== 'GroundGroup') {
        POSSIBLE_TRADESKILL_SCOPES.forEach(skill => {
          if(this.colyseusGame[`show${skill}`].uuid) {
            scopes.push(skill.toLowerCase());
          }
        });
      }
    }

    if(this.item.itemClass === 'Bottle'
    && (this.context === 'Sack'
      || this.context === 'Ground'
      || this.context === 'Right'
      || this.context === 'Left')) {
      scopes.push('potion');
    }

    if(this.item.isSackable) scopes.push('sack');
    if(this.item.isBeltable) scopes.push('belt');

    if(this.item.canUse && this.item.canUse(this.player)
    && this.context !== 'Ground'
    && this.context !== 'Equipment') scopes.push('use');

    this.scopes = scopes;
  }

  automaticallyTakeActionBasedOnOpenWindows() {

    if(this.colyseusGame.showShop.uuid) {

      if(this.context === 'Sack' || this.context === 'Belt') {
        this.doColyseusMoveAction('M');
        return;

      } else if(this.context === 'Merchant' || this.context === 'Obtainagain') {
        if(this.item.isSackable) {
          this.doColyseusMoveAction('S');
          return;
        }
      }

    }

    if(this.colyseusGame.showLocker.length) {
      if(this.context === 'Wardrobe') {
        if(this.item.isSackable) {
          this.doColyseusMoveAction('S');
          return;
        }
      } else {
        this.doColyseusMoveAction('W');
        return;
      }
    }

    if(this.item.canUse(this.colyseusGame.character) && (this.context === 'Right' || this.context === 'Left')) {
      this.colyseusGame.buildUseAction(this.item, this.context);

    } else if(this.context !== 'Ground') {
      this.doColyseusMoveAction('G');
    }

  }

}
