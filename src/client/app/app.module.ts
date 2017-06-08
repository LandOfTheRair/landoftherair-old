import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { Draggable } from './draggable.directive';

import { Ng2Webstorage } from 'ngx-webstorage';
import { Ng2BootstrapModule } from 'ngx-bootstrap';
import { NgxAutoScroll } from 'ngx-auto-scroll';
import { ContextMenuModule } from 'ngx-contextmenu';

import { AppComponent } from './app.component';

import { AuthService } from './auth.service';
import { ColyseusService } from './colyseus.service';
import { ColyseusLobbyService } from './colyseus.lobby.service';
import { ColyseusGameService } from './colyseus.game.service';
import { LobbyComponent } from './lobby/lobby.component';
import { CharacterSelectComponent } from './character-select/character-select.component';
import { MapComponent } from './map/map.component';
import { StatsWindowComponent } from './stats-window/stats-window.component';
import { CommandLineComponent } from './command-line/command-line.component';
import { CloseButtonComponent } from './_shared/close-button.component';
import { MinimizeButtonComponent } from './_shared/minimize-button.component';
import { PlayerTaglineComponent } from './_shared/character-tagline.component';
import { ItemComponent } from './_shared/item.component';
import { LogWindowComponent } from './log-window/log-window.component';
import { StatusWindowComponent } from './status-window/status-window.component';
import { GroundComponent } from './ground/ground.component';
import { InventorySackComponent } from './inventory-sack/inventory-sack.component';
import { InventoryBeltComponent } from './inventory-belt/inventory-belt.component';
import { EquipmentComponent } from './equipment/equipment.component';

(<any>window).PhaserGlobal = { hideBanner: true };

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,

    Draggable,
    NgxAutoScroll,
    CharacterSelectComponent,
    MapComponent,
    StatsWindowComponent,
    CommandLineComponent,
    CloseButtonComponent,
    MinimizeButtonComponent,
    PlayerTaglineComponent,
    ItemComponent,
    LogWindowComponent,
    StatusWindowComponent,
    GroundComponent,
    InventorySackComponent,
    InventoryBeltComponent,
    EquipmentComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,

    ContextMenuModule.forRoot({ useBootstrap4: true }),
    Ng2Webstorage.forRoot({ prefix: 'lotr', separator: '-' }),
    Ng2BootstrapModule.forRoot()
  ],
  providers: [
    AuthService,
    ColyseusService,
    ColyseusLobbyService,
    ColyseusGameService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
