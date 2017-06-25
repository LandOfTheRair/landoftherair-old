import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { NgxAutoScrollDirective } from './ngx-auto-scroll.directive';
import { DraggableWindowDirective } from './draggable.directive';

import { Ng2Webstorage } from 'ngx-webstorage';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Ng2DragDropModule } from 'ng2-drag-drop';
import { ColorPickerModule } from 'ngx-color-picker';

import { AppComponent } from './app.component';

import { AuthService } from './auth.service';
import { ColyseusService } from './colyseus.service';
import { ColyseusLobbyService } from './colyseus.lobby.service';
import { ColyseusGameService } from './colyseus.game.service';
import { MacroService } from './macros.service';

import { CloseButtonComponent } from './_shared/close-button.component';
import { MinimizeButtonComponent } from './_shared/minimize-button.component';
import { PlayerTaglineComponent } from './_shared/character-tagline.component';
import { LifeHeartComponent } from './_shared/life-heart.component';
import { ItemComponent } from './_shared/item.component';
import { IconComponent } from './_shared/icon.component';
import { SkillIconComponent } from './_shared/skill-icon.component';
import { StatusEffectComponent } from './_shared/status-effect.component';

import { LobbyComponent } from './lobby/lobby.component';
import { CharacterSelectComponent } from './character-select/character-select.component';
import { MapComponent } from './map/map.component';
import { StatsWindowComponent } from './stats/stats-window.component';
import { SkillsWindowComponent } from './skills/skills-window.component';
import { CommandLineComponent } from './command-line/command-line.component';
import { LogWindowComponent } from './log/log-window.component';
import { StatusWindowComponent } from './status/status-window.component';
import { GroundComponent } from './ground/ground.component';
import { InventorySackComponent } from './inventory-sack/inventory-sack.component';
import { InventoryBeltComponent } from './inventory-belt/inventory-belt.component';
import { EquipmentComponent } from './equipment/equipment.component';
import { NpcsComponent } from './npcs/npcs.component';
import { MacroBarsComponent } from './macro-bars/macro-bars.component';
import { TrainerComponent } from './trainer/trainer.component';
import { ShopComponent } from './shop/shop.component';
import { BankComponent } from './bank/bank.component';
import { LockersComponent } from './lockers/lockers.component';

(<any>window).PhaserGlobal = { hideBanner: true };

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,

    DraggableWindowDirective,
    NgxAutoScrollDirective,

    CharacterSelectComponent,
    MapComponent,
    StatsWindowComponent,
    SkillsWindowComponent,
    CommandLineComponent,
    CloseButtonComponent,
    MinimizeButtonComponent,
    PlayerTaglineComponent,
    LifeHeartComponent,
    ItemComponent,
    IconComponent,
    SkillIconComponent,
    StatusEffectComponent,

    LogWindowComponent,
    StatusWindowComponent,
    GroundComponent,
    InventorySackComponent,
    InventoryBeltComponent,
    EquipmentComponent,
    NpcsComponent,
    MacroBarsComponent,
    TrainerComponent,
    ShopComponent,
    BankComponent,
    LockersComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

    ColorPickerModule,
    Ng2DragDropModule,
    Ng2Webstorage.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    ButtonsModule.forRoot(),
    TooltipModule.forRoot()
  ],
  providers: [
    AuthService,
    ColyseusService,
    ColyseusLobbyService,
    ColyseusGameService,
    MacroService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
