
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { EquippableItemClasses, Item } from '../../../shared/models/item';
import { Player } from '../../../shared/models/player';

import { includes, isNumber, startCase, get } from 'lodash';
import { ColyseusGameService } from '../colyseus.game.service';
import { AssetService } from '../asset.service';
import { MaterialSlotInfo, ValidMaterialItems } from '../../../shared/helpers/material-storage-layout';

const POSSIBLE_TRADESKILL_SCOPES = ['Alchemy', 'Spellforging', 'Metalworking'];

export type MenuContext = 'Sack' | 'Belt' | 'Ground' | 'DemiMagicPouch'
                        | 'GroundGroup' | 'Equipment' | 'Left'
                        | 'Right' | 'Coin' | 'Merchant' | 'Potion'
                        | 'Obtainagain' | 'Wardrobe' | 'WardrobeMaterial' | 'Tradeskill';

@Component({
  selector: 'app-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: [
    './item.component.scss',
    './item.cosmetics.scss'
  ],
  template: `    
    <div class="item-container" 
         [ngClass]="[size]"
         [class.transparent]="showOutline"
         draggable
         [dragScope]="scopes"
         [dragEnabled]="item && !displayOnly"
         [dragData]="{ item: item, context: context, contextSlot: contextSlot, containerUUID: containerUUID, isStackableMaterial: isStackableMaterial }"
         (contextmenu)="automaticallyTakeActionBasedOnOpenWindows()"
         (mouseenter)="determineScopes()"
         triggers="hover:mouseleave"
         [placement]="tooltipPlacement"
         container="body"
         delay="750"
         [isDisabled]="!item || !showDesc"
         [tooltip]="desc">
      <img [src]="imgUrl" 
           [style.object-position]="spriteLocation" 
           [class.hidden]="!item" 
           [class.animate]="!colyseusGame.suppressAnimations" 
           [ngClass]="['cosmetic-item-' + cosmeticName]" />
      <img [src]="imgUrl" [style.object-position]="encrustLocation" class="encrust" *ngIf="item && showEncrust && item.encrust" />
      <div class="item-background" *ngIf="item && showBackground"></div>
      <div class="glow-container" [ngClass]="[glowColor]" *ngIf="item && showDesc"></div>
      <div class="animation-container"
           [class.animate]="!colyseusGame.suppressAnimations" 
           [ngClass]="['cosmetic-bg-' + cosmeticName]" 
           *ngIf="item && cosmeticName"></div>
      <span class="count" *ngIf="item && showCount && realCount > 0">{{ realCount }}x</span>
      <span class="ounces" *ngIf="item && showOunces && realOunces > 0">{{ realOunces }}oz</span>
      <span class="value" *ngIf="item && showValue">{{ overrideValue || (item._buybackValue || item.value) + 'g' }}</span>
      <span class="value" *ngIf="item && showOunces && item.succorInfo">{{ item.succorInfo.map }}</span>
      <span class="ounces" *ngIf="item && showDesc && item.effect && item.itemClass === 'Trap'">{{ item.trapUses }}x {{ effectName }}</span>
      
      <ng-template #desc>
        <div [innerHtml]="descText"></div>
      </ng-template>
    </div>
    
  `
})
export class ItemComponent {

  private _item: Item;

  @Input()
  public set item(item: Item) {
    this._item = item;
    this.determineScopes();
  }

  public get item(): Item {
    return this._item;
  }

  @Input()
  public count: number;

  @Input()
  public ounces: number;

  @Input()
  public showDesc = true;

  @Input()
  public showValue = false;

  @Input()
  public showOunces = false;

  @Input()
  public showCount = true;

  @Input()
  public showBackground: boolean;

  @Input()
  public showEncrust = true;

  @Input()
  public showOutline = false;

  @Input()
  public context: MenuContext;

  @Input()
  public contextSlot: number|string;

  @Input()
  public containerUUID: string;

  @Input()
  public overrideValue: number|string;

  @Input()
  public tooltipPlacement = 'auto';

  @Input()
  public size: 'xsmall' | 'small' | 'normal' = 'normal';

  public scopes: string[] = [];

  get displayOnly(): boolean {
    return !this.context;
  }

  get isEquippable(): boolean {
    if(!this.item) return false;
    return includes(EquippableItemClasses, this.item.itemClass);
  }

  get player(): Player {
    return this.colyseusGame.character;
  }

  get realOunces() {
    return this.ounces || this.item.ounces;
  }

  get realCount() {
    return this.count || this.item.shots;
  }

  get imgUrl() {
    if(this.item && this.item.itemClass === 'Corpse') {
      return this.assetService.creaturesUrl;
    }

    return this.assetService.itemsUrl;
  }

  get cosmeticName(): string {
    if(!this.item) return '';
    if(this.item.searchItems) return 'UnsearchedCorpse';

    if(!this.item.cosmetic) return '';
    if(this.item.condition <= 10000) return '';

    return this.item.cosmetic.name;
  }

  get glowColor() {
    if(this.item.condition <= 0)     return 'glow-black';
    if(this.item.condition <= 5000)  return 'glow-red';
    if(this.item.condition <= 10000) return 'glow-yellow';
    return 'glow-none';
  }

  get spriteLocation() {
    if(!this.item) return '0px 0px';
    const divisor = this.item.itemClass === 'Corpse' ? 40 : 32;
    const y = Math.floor(this.item.sprite / divisor);
    const x = this.item.sprite % divisor;
    return `-${x * 64}px -${y * 64}px`;
  }

  get encrustLocation() {
    if(!this.item) return '0px 0px';
    const divisor = 32;
    const y = Math.floor(this.item.encrust.sprite / divisor);
    const x = this.item.encrust.sprite % divisor;
    return `-${x * 64}px -${y * 64}px`;
  }

  get descText() {
    if(!this.item) return '';
    const item = new Item(this.item);
    return item.descTextFor(this.player, 0, true);
  }

  get isStackableMaterial(): boolean {
    if(!this.item) return false;
    if(!isNumber(ValidMaterialItems[this.item.name])) return false;
    return MaterialSlotInfo[ValidMaterialItems[this.item.name]].withdrawInOunces;
  }

  get effectName(): string {
    return startCase(get(this.item, 'effect.name'));
  }

  constructor(public colyseusGame: ColyseusGameService, private assetService: AssetService) {}

  doColyseusMoveAction(choice) {
    this.colyseusGame.buildAction(this.item, {
      context: this.context,
      contextSlot: this.contextSlot,
      containerUUID: this.containerUUID,
      isStackableMaterial: this.isStackableMaterial
    }, choice);
  }

  doColyseusUseAction() {
    this.colyseusGame.buildUseAction(this.item, this.context, this.contextSlot);
  }

  determineScopes() {
    if(!this.context || !this.item) return [];

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
    && this.context !== 'GroundGroup'
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
      || this.context === 'DemiMagicPouch'
      || this.context === 'Ground'
      || this.context === 'Right'
      || this.context === 'Left')) {
      scopes.push('potion');
    }

    if(this.item.isSackable) scopes.push('sack', 'demimagicpouch');
    if(this.item.isBeltable) scopes.push('belt', 'demimagicpouch');

    if(
      ((this.item.canUse && this.item.canUse(this.player)) || this.item.itemClass === 'Bottle')
    && this.context !== 'GroundGroup'
    && this.context !== 'Equipment') scopes.push('use');

    this.scopes = scopes;
  }

  automaticallyTakeActionBasedOnOpenWindows() {

    if(!this.context || !this.item) return;

    if(this.context === 'Potion') {
      this.colyseusGame.sendCommandString('~drink');
      return;
    }

    if(this.colyseusGame.showShop.uuid) {

      if(this.context === 'Sack' || this.context === 'Belt' || this.context === 'DemiMagicPouch') {
        this.doColyseusMoveAction('M');
        return;

      } else if(this.context === 'Merchant' || this.context === 'Obtainagain') {

        if(this.item.isBeltable) {
          this.doColyseusMoveAction('B');
          return;

        } else if(this.item.isSackable) {
          this.doColyseusMoveAction('S');
          return;

        } else {
          this.doColyseusMoveAction('R');
          return;
        }
      }

    }

    if(this.colyseusGame.showLocker.length) {
      if(this.context === 'Wardrobe') {
        if(this.isEquippable) {

          const slot = (<any>this.colyseusGame.character).getItemSlotToEquipIn(this.item);
          if(slot === false) {
            this.doColyseusMoveAction('S');
            return;
          }

          this.doColyseusMoveAction('E');
          return;
        }

        if(this.item.isBeltable) {
          this.doColyseusMoveAction('B');
          return;
        }

        if(this.item.isSackable) {
          this.doColyseusMoveAction('S');
          return;
        }

      } else if(this.context === 'WardrobeMaterial') {
        this.doColyseusMoveAction('S');
        return;

      } else {
        this.doColyseusMoveAction('W');
        return;
      }
    }

    if(this.item.canUse && this.item.canUse(this.colyseusGame.character) && (this.context === 'Right' || this.context === 'Left')) {
      this.colyseusGame.buildUseAction(this.item, this.context);
      return;

    } else if(this.context !== 'Ground' && this.context !== 'GroundGroup') {
      this.doColyseusMoveAction('G');
      return;

    } else if(this.context === 'Ground' || this.context === 'GroundGroup') {

      if(this.isEquippable) {

        const slot = (<any>this.colyseusGame.character).getItemSlotToEquipIn(this.item);
        if(slot !== false) {
          this.doColyseusMoveAction('E');
          return;
        }

      }

      if(this.item.isBeltable) {
        this.doColyseusMoveAction('B');
        return;

      } else if(this.item.isSackable) {
        this.doColyseusMoveAction('S');
        return;
      }

    }

  }

}
