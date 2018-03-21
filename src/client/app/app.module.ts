import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { NgxAutoScrollDirective } from './ngx-auto-scroll.directive';
import { DraggableWindowDirective } from './draggable.directive';

import { Ng2Webstorage } from 'ngx-webstorage';
import { VirtualScrollModule } from 'angular2-virtual-scroll';

import {
  TooltipModule,
  ButtonsModule,
  PopoverModule,
  TabsModule,
  ModalModule,
  BsDropdownModule
} from 'ngx-bootstrap';
import { NgDragDropModule } from 'ng-drag-drop';
import { WalkthroughModule } from 'angular-walkthrough';
import { ColorPickerModule } from 'ngx-color-picker';
import { StripeCheckoutModule } from 'ng-stripe-checkout';
import { ResizableModule } from 'angular-resizable-element';

import { AppComponent } from './app.component';

import { AuthService } from './auth.service';
import { ColyseusService } from './colyseus.service';
import { ColyseusLobbyService } from './colyseus.lobby.service';
import { ColyseusGameService } from './colyseus.game.service';
import { MacroService } from './macros.service';
import { AssetService } from './asset.service';
import { WindowManagerService } from './windowmanager.service';

import { NavbarComponent } from './app.navbar.component';

import { CloseButtonComponent } from './_shared/close-button.component';
import { MinimizeButtonComponent } from './_shared/minimize-button.component';
import { PlayerTaglineComponent } from './_shared/character-tagline.component';
import { LifeHeartComponent } from './_shared/life-heart.component';
import { ItemComponent } from './_shared/item.component';
import { IconComponent } from './_shared/icon.component';
import { SkillIconComponent } from './_shared/skill-icon.component';
import { StatusEffectComponent } from './_shared/status-effect.component';
import { LogMessageComponent } from './_shared/log-message.component';
import { WindowComponent } from './_shared/window.component';
import { NpcCardComponent } from './npcs/npccard.component';

import { LobbyComponent } from './lobby/lobby.component';
import { CharacterSelectComponent } from './character-select/character-select.component';
import { MapComponent } from './map/map.component';
import { StatsWindowComponent } from './stats/stats-window.component';
import { SkillsWindowComponent } from './skills/skills-window.component';
import { TradeSkillsWindowComponent } from './tradeskills/tradeskills-window.component';
import { CommandLineComponent } from './command-line/command-line.component';
import { LogWindowComponent } from './log/log-window.component';
import { StatusWindowComponent } from './status/status-window.component';
import { GroundComponent } from './ground/ground.component';
import { InventorySackComponent } from './inventory-sack/inventory-sack.component';
import { InventoryBeltComponent } from './inventory-belt/inventory-belt.component';
import { InventoryPouchComponent } from './inventory-pouch/inventory-pouch.component';
import { EquipmentComponent } from './equipment/equipment.component';
import { EquipmentViewOnlyComponent } from './equipment-viewonly/equipment-viewonly.component';
import { NpcsComponent } from './npcs/npcs.component';
import { MacroBarsComponent } from './macro-bars/macro-bars.component';
import { TrainerComponent } from './trainer/trainer.component';
import { ShopComponent } from './shop/shop.component';
import { BankComponent } from './bank/bank.component';
import { LockersComponent } from './lockers/lockers.component';
import { LinkifyPipe } from './_shared/linkify.pipe';
import { MacroComponent } from './macro/macro.component';
import { ActiveTargetComponent } from './active-target/active-target.component';
import { PartyComponent } from './party/party.component';
import { TraitsComponent } from './traits/traits.component';

import { TradeskillAlchemyComponent } from './tradeskill-alchemy/tradeskill-alchemy.component';
import { TradeskillSpellforgingComponent } from './tradeskill-spellforging/tradeskill-spellforging.component';
import { TradeskillMetalworkingComponent } from './tradeskill-metalworking/tradeskill-metalworking.component';

(<any>window).PhaserGlobal = { hideBanner: true };

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LobbyComponent,

    LinkifyPipe,

    DraggableWindowDirective,
    NgxAutoScrollDirective,

    CharacterSelectComponent,
    MapComponent,
    StatsWindowComponent,
    SkillsWindowComponent,
    TradeSkillsWindowComponent,
    CommandLineComponent,
    CloseButtonComponent,
    MinimizeButtonComponent,
    PlayerTaglineComponent,
    LifeHeartComponent,
    ItemComponent,
    IconComponent,
    SkillIconComponent,
    StatusEffectComponent,
    LogMessageComponent,
    WindowComponent,
    NpcCardComponent,

    LogWindowComponent,
    StatusWindowComponent,
    GroundComponent,
    InventorySackComponent,
    InventoryBeltComponent,
    InventoryPouchComponent,
    EquipmentComponent,
    EquipmentViewOnlyComponent,
    NpcsComponent,
    MacroBarsComponent,
    TrainerComponent,
    ShopComponent,
    BankComponent,
    LockersComponent,
    MacroComponent,
    ActiveTargetComponent,
    PartyComponent,
    TraitsComponent,

    TradeskillAlchemyComponent,
    TradeskillSpellforgingComponent,
    TradeskillMetalworkingComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

    ResizableModule,
    ColorPickerModule,
    VirtualScrollModule,
    WalkthroughModule.forRoot(),
    NgDragDropModule.forRoot(),
    Ng2Webstorage.forRoot(),
    BsDropdownModule.forRoot(),
    PopoverModule.forRoot(),
    ModalModule.forRoot(),
    ButtonsModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),

    StripeCheckoutModule
  ],
  providers: [
    AuthService,
    ColyseusService,
    ColyseusLobbyService,
    ColyseusGameService,
    MacroService,
    AssetService,
    WindowManagerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
