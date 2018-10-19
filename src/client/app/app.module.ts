import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable, ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';

import { NgxAutoScrollDirective } from './ngx-auto-scroll.directive';
import { DraggableWindowDirective } from './draggable.directive';

import { Ng2Webstorage } from 'ngx-webstorage';
import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { NgDragDropModule } from 'ng-drag-drop';
import { WalkthroughModule } from 'angular-walkthrough';
import { ColorPickerModule } from 'ngx-color-picker';
import { StripeCheckoutModule } from 'ng-stripe-checkout';
import { ResizableModule } from 'angular-resizable-element';

import { RollbarModule, RollbarService } from 'angular-rollbar';

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

import { MarketBoardComponent } from './market-board/market-board.component';

import { TradeskillAlchemyComponent } from './tradeskill-alchemy/tradeskill-alchemy.component';
import { TradeskillSpellforgingComponent } from './tradeskill-spellforging/tradeskill-spellforging.component';
import { TradeskillMetalworkingComponent } from './tradeskill-metalworking/tradeskill-metalworking.component';

import { environment } from '../environments/environment';
import { AlertService } from './alert.service';

const envUrl = `${environment.server.protocol}://${environment.server.domain}:${environment.server.port}`;

@Injectable()
export class APIInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const apiReq = req.clone({ url: `${envUrl}/${req.url}` });
    return next.handle(apiReq);
  }
}
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
    MarketBoardComponent,

    TradeskillAlchemyComponent,
    TradeskillSpellforgingComponent,
    TradeskillMetalworkingComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,

    RollbarModule.forRoot({
      accessToken: environment.rollbar.token,
      enabled: !!environment.rollbar.token,
      captureUncaught: true,
      captureUnhandledRejections: true,
      ignoredMessages: [
        'bad checksum',
        'copy extends past end of input',
        'Cannot read property \'getImage\' of null',
        'cannot read property \'readyState\' of undefined',
        'WebSocket is not open: readyState 2 (CLOSING)',
        'Uncaught (in promise): Event: {"isTrusted":true}',
        'Cannot read property \'loadComplete\' of null'
      ]
    }),

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
    { provide: ErrorHandler, useClass: RollbarService },
    AlertService,
    AuthService,
    ColyseusService,
    ColyseusLobbyService,
    ColyseusGameService,
    MacroService,
    AssetService,
    WindowManagerService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: APIInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
