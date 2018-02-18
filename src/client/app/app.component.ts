import { AfterViewInit, Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { StripeCheckoutLoader, StripeCheckoutHandler } from 'ng-stripe-checkout';
import { ColyseusService } from './colyseus.service';

import * as swal from 'sweetalert2';
import { LocalStorage, LocalStorageService } from 'ngx-webstorage';
import { MacroService, Macro } from './macros.service';

import * as macicons from '../macicons/macicons.json';

import { DateTime } from 'luxon';
import { includes, isNull, cloneDeep, get } from 'lodash';
import { AuthService } from './auth.service';
import { AssetService } from './asset.service';
import { Observable } from 'rxjs/Observable';
import { SilverPurchase } from '../../shared/models/account';

import { environment } from '../environments/environment';

type Size = 'normal' | 'small' | 'xsmall';
type XSizeMax = 'max' | 'xlarge' | 'large' | 'normal' | 'small' | 'xsmall';
type XSize = 'xlarge' | 'large' | 'normal' | 'small' | 'xsmall';
type Theme = 'Light' | 'Dark';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('viewMacro')
  public viewMacroModal;

  @ViewChild('macroGroups')
  public macroGroupsModal;

  @ViewChild('options')
  public optionsModal;

  @ViewChild('macros')
  public macrosModal;

  @ViewChild('debugOptions')
  public debugOptionsModal;

  // general utility w/ macros
  public macroArray = Array(10).fill(null).map((x, i) => i);

  // editing a new macro
  private oldMacro: Macro;
  public currentlyEditingMacro: Macro = new Macro();
  public currentIconPage = 0;
  public currentIconsInPage = [];

  // editing macro groups
  public currentlySelectedMacroForMacroGroup: Macro = new Macro();
  public currentMacroPage = 0;
  public currentMacrosInPage = [];
  public currentMacroGroupForEditor: string;
  public currentMacroIdxForEditor: number;

  @LocalStorage()
  public activeWindow: string;

  @LocalStorage()
  public minimized;

  // window visibility
  @LocalStorage()
  public showStatsWindow: boolean;

  @LocalStorage()
  public showSkillsWindow: boolean;

  @LocalStorage()
  public showTradeSkillsWindow: boolean;

  @LocalStorage()
  public showCommandLine: boolean;

  @LocalStorage()
  public showInventorySack: boolean;

  @LocalStorage()
  public showInventoryBelt: boolean;

  @LocalStorage()
  public showInventoryPouch: boolean;

  @LocalStorage()
  public showEquipment: boolean;

  @LocalStorage()
  public showParty: boolean;

  @LocalStorage()
  public showTraits: boolean;

  // options
  @LocalStorage()
  public sackSize: Size;

  @LocalStorage()
  public beltSize: Size;

  @LocalStorage()
  public pouchSize: Size;

  @LocalStorage()
  public equipmentSize: Size;

  @LocalStorage()
  public groundSize: Size;

  @LocalStorage()
  public logFontSize: XSize;

  @LocalStorage()
  public logWindowSize: XSizeMax;

  @LocalStorage()
  public npcWindowSize: XSizeMax;

  @LocalStorage()
  public theme: Theme;

  @LocalStorage()
  public rightClickSend: boolean;

  @LocalStorage()
  public autoHideLobby: boolean;

  @LocalStorage()
  public lockWindowPositions: boolean;

  @LocalStorage()
  public noFantasy: boolean;

  @LocalStorage()
  public suppressZeroDamage: boolean;

  @LocalStorage()
  public showActiveTarget: boolean;

  @LocalStorage()
  public pinLastTarget: boolean;

  @LocalStorage()
  public sortNPCsByDistance: boolean;

  @LocalStorage()
  public playBackgroundMusic: boolean;

  @LocalStorage()
  public playSoundEffects: boolean;

  public windowLocations: any = {
    Lobby: null,
    CharacterSelect: null,
    Map: null,
    Stats: null,
    Skills: null,
    TradeSkills: null,
    CommandLine: null,
    Log: null,
    Status: null,
    Ground: null,
    Sack: null,
    Belt: null,
    Pouch: null,
    Equipment: null,
    NPCs: null,
    Macros: null,
    Trainer: null,
    Shop: null,
    Bank: null,
    Locker: null,
    Party: null,
    Traits: null,
    TradeskillAlchemy: null,
    TradeskillSpellforging: null
  };

  public newMessages = 0;

  get loggedIn() {
    return this.colyseus.lobby.myAccount;
  }

  get inGame() {
    return this.colyseus.game.inGame;
  }

  get hasPouch(): boolean {
    return get(this.colyseus.lobby.myAccount, 'silverPurchases.MagicPouch', 0) > 0;
  }

  private imagesLoaded = 0;

  get resourcesLoaded() {
    return {
      done: this.imagesLoaded >= this.assetService.preloadAssets.length,
      current: this.imagesLoaded,
      total: this.assetService.preloadAssets.length
    };
  }

  public resetTimestamp: number;
  public nowTimestamp: number;
  public timestampDisplay: string;

  get stripeKey(): string {
    return environment.stripe.key;
  }

  private stripeCheckoutHandler: StripeCheckoutHandler;
  private currentlyBuyingItem: any;

  constructor(
    public colyseus: ColyseusService,
    public macroService: MacroService,
    public authService: AuthService,
    public assetService: AssetService,
    private localStorage: LocalStorageService,
    private renderer: Renderer2,
    private stripeCheckoutLoader: StripeCheckoutLoader
  ) {
    this.authService.handleAuthentication();
    this.macroService.ignoreFunction = () => {

      // no macros when modals are up
      if(this.viewMacroModal.isShown
      || this.macroGroupsModal.isShown
      || this.macrosModal.isShown
      || this.optionsModal.isShown) return true;

      if(this.colyseus.game.showBank.bankId) return true;

      if(document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return true;
      if(this.activeWindow === 'cmd' || this.activeWindow === 'lobby' || this.activeWindow === 'bank') return true;

      return false;
    };
  }

  ngOnInit() {
    this.authService.scheduleRenewal();

    if(!this.minimized) this.minimized = {};
    this.colyseus.init();

    this.colyseus.isConnected$.subscribe((isConnected) => {
      if(isConnected) return;

      this.viewMacroModal.hide();
      this.macroGroupsModal.hide();
      this.optionsModal.hide();
      this.macrosModal.hide();
    });

    this.colyseus.lobby.lobbyState.newMessage$.subscribe((numNewMessages) => {
      if(this.activeWindow === 'lobby') return;
      this.newMessages += numNewMessages;
    });

    this.initDefaultOptions();

    this.watchOptions();

    this.watchResetTime();
  }

  logout() {
    (<any>swal)({
      titleText: `Log Out`,
      text: `Are you sure you want to log out?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout!'
    }).then(() => {
      this.colyseus.lobby.logout();

    }).catch(() => {});
  }

  private watchResetTime() {

    const setResetTimestamp = () => {
      let theoreticalResetTime = DateTime.fromObject({ zone: 'utc', hour: 12 });
      if(+theoreticalResetTime < DateTime.fromObject({ zone: 'utc' })) {
        theoreticalResetTime = theoreticalResetTime.plus({ days: 1 });
      }

      this.resetTimestamp = +theoreticalResetTime;
    };

    const formatTimestring = () => {
      const diff = (this.resetTimestamp - this.nowTimestamp) / 1000;
      const hours = Math.floor((diff / 60) / 60) % 60;
      const minutes = Math.floor((diff / 60)) % 60;

      this.timestampDisplay = `${hours > 0 ? hours + 'h' : ''}${minutes}m`;
    };

    setResetTimestamp();
    formatTimestring();

    Observable.timer(0, 60000)
      .subscribe(() => {
        this.nowTimestamp = +DateTime.fromObject({ zone: 'utc' });
        if(this.nowTimestamp > this.resetTimestamp) setResetTimestamp();
        formatTimestring();
      });
  }

  imageLoaded() {
    this.imagesLoaded++;
  }

  private initDefaultOptions() {
    ['sack', 'belt', 'pouch', 'equipment', 'ground', 'logFont', 'logWindow', 'npcWindow'].forEach(opt => {
      if(this[`${opt}Size`]) return;
      this[`${opt}Size`] = 'normal';
    });

    const defaultOptions = [
      'showInventoryBelt', 'showInventoryPouch', 'showInventorySack', 'showEquipment', 'showCommandLine',
      'showActiveTarget', 'pinLastTarget',
      'autoHideLobby',
      'playBackgroundMusic', 'playSoundEffects'
    ];

    defaultOptions.forEach(opt => {
      if(isNull(this[opt])) this[opt] = true;
    });

    if(isNull(this.theme)) {
      this.theme = 'Dark';
    }
  }

  private watchOptions() {

    const adjustFont = (noFantasy: boolean) => {
      const func = noFantasy ? 'addClass' : 'removeClass';
      this.renderer[func](document.body, 'no-fantasy');
    };

    const adjustTheme = (theme: string) => {
      const func = theme === 'Light' ? 'addClass' : 'removeClass';
      this.renderer[func](document.body, 'light-theme');
    };

    adjustFont(this.localStorage.retrieve('noFantasy'));
    adjustTheme(this.localStorage.retrieve('theme'));

    this.localStorage.observe('noFantasy')
      .subscribe(noFantasy => adjustFont(noFantasy));

    this.localStorage.observe('theme')
      .subscribe(theme => adjustTheme(theme));
  }

  minimize(window: string) {
    this.minimized[window] = !this.minimized[window];

    // trigger localstorage memorizing
    this.minimized = this.minimized;
  }

  addMacro() {
    this.currentlyEditingMacro = new Macro();
    this.currentlyEditingMacro.name = 'New Macro';
    this.currentlyEditingMacro.icon = 'acorn';
    this.viewMacroModal.show();

    this.changePage(0);
  }

  editMacro(macro) {
    this.oldMacro = macro;
    this.currentlyEditingMacro = new Macro(macro);
    this.viewMacroModal.show();

    this.findPage(macro.icon);
  }

  copyMacro(macro) {
    const myMacro = cloneDeep(macro);
    myMacro.name = `${myMacro.name} (copy)`;
    delete myMacro.isSystem;
    delete myMacro.requiresLearn;
    this.currentlyEditingMacro = new Macro(myMacro);
    this.viewMacroModal.show();

    this.findPage(myMacro.icon);
  }

  deleteMacro(macro) {
    this.macroService.removeMacro(macro);
  }

  saveMacro() {
    if(this.oldMacro) {
      this.macroService.replaceCustomMacro(this.oldMacro, this.currentlyEditingMacro);
      delete this.oldMacro;
    } else {
      this.macroService.addCustomMacro(this.currentlyEditingMacro);
    }
    this.viewMacroModal.hide();
  }

  addMacroGroup() {
    (<any>swal)({
      titleText: 'Name your macro group.',
      text: 'It must be between 2 and 10 characters.',
      input: 'text',
      preConfirm: (name) => {
        return new Promise((resolve, reject) => {
          if(name.length < 2 || name.length > 10) return reject('Group name is not the right size');
          if(this.macroService.allMacroGroups[name]) return reject('You already have a group named that');
          resolve();
        });
      }
    }).then(name => {
      this.macroService.addMacroGroup(name);
    }).catch(() => {});
  }

  setMacroKey($event) {
    $event.preventDefault();
    $event.stopPropagation();

    const { key, shiftKey, altKey, ctrlKey } = $event;
    if(includes(['Shift', 'Control', 'Alt'], key)) return;

    this.currentlyEditingMacro.key = key.toUpperCase();
    this.currentlyEditingMacro.modifiers.shift = shiftKey;
    this.currentlyEditingMacro.modifiers.ctrl = ctrlKey;
    this.currentlyEditingMacro.modifiers.alt = altKey;
  }

  changeMacroMode(newMode) {
    ['autoActivate', 'lockActivation', 'clickToTarget'].forEach(type => {
      this.currentlyEditingMacro[type] = false;
    });
    this.currentlyEditingMacro[newMode] = true;
  }

  get allMacroIcons() {
    return (<any>macicons).macroNames;
  }

  findPage(iconName) {
    const index = this.allMacroIcons.indexOf(iconName);
    this.currentIconPage = Math.floor(index / 54);
    this.changePage(this.currentIconPage);
  }

  changePage(newPage) {
    if(newPage < 0) return;
    const pageSize = 54;
    const maxPage = Math.floor(this.allMacroIcons.length / pageSize);
    if(newPage > maxPage) return;
    this.currentIconPage = newPage;
    const page = this.currentIconPage * pageSize;
    this.currentIconsInPage = this.allMacroIcons.slice(page, page + pageSize);
  }

  showMacroModal() {
    this.macroService.resetUsableMacros();
  }

  makeActiveGroup(groupName: string, slot: number) {
    this.macroService.visibleMacroGroups[slot] = groupName;
    this.macroService.saveMacros();
  }

  removeActiveGroup(slot: number) {
    if(slot < 1) return;
    this.macroService.visibleMacroGroups[slot] = null;
    this.macroService.saveMacros();
  }

  deleteGroup(groupName: string) {
    (<any>swal)({
      titleText: 'Delete Macro Group',
      text: `Are you sure you want to remove the group "${groupName}"? This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      type: 'warning'
    }).then(() => {
      this.macroService.removeMacroGroup(groupName);
    }).catch(() => {});
  }

  resetDefaultGroup() {
    (<any>swal)({
      titleText: 'Reset Default Macro Group',
      text: `Are you sure you want to reset the default macro group? This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: 'Yes, reset it!',
      type: 'warning'
    }).then(() => {
      this.macroService.resetDefaultMacros();
    }).catch(() => {});
  }

  resetVariablesForMacroPopover(groupName, idx) {
    this.changeMacroPage(0);
    this.currentMacroGroupForEditor = groupName;
    this.currentMacroIdxForEditor = idx;
  }

  changeMacroPage(newPage) {
    if(newPage < 0) return;
    const pageSize = 45;
    const allMacros = this.macroService.allMacroNames();
    const maxPage = Math.floor(allMacros.length / pageSize);
    if(newPage > maxPage) return;
    this.currentMacroPage = newPage;
    const page = this.currentMacroPage * pageSize;
    this.currentMacrosInPage = allMacros.slice(page, page + pageSize);
  }

  selectMacroForSpot(macroName: string) {
    this.macroService.updateMacroGroup(this.currentMacroGroupForEditor, this.currentMacroIdxForEditor, macroName);
  }

  unsetMacro(groupName: string, macroIndex: number) {
    this.macroService.updateMacroGroup(groupName, macroIndex, null);
  }

  public invalidMacro() {
    const macro = this.currentlyEditingMacro;

    return !macro.name
        || !macro.icon
        || !macro.background
        || !macro.foreground
        || !macro.macro;
  }

  public cleanupWindows() {
    this.lockWindowPositions = false;

    Object.keys(this.windowLocations).forEach((key, index) => {
      this.windowLocations[key] = { x: index * 30, y: index * 56 };
    });
  }

  setActiveWindow(win: string) {
    this.activeWindow = win;

    if(win === 'lobby') {
      this.newMessages = 0;
    }

    if(win !== 'cmd' && win !== 'lobby') {
      (<HTMLElement>document.activeElement).blur();
    }
  }

  applyDebug() {
    location.reload();
  }

  getNumSilverItemPurchased(key: SilverPurchase) {
    return get(this.colyseus.lobby.myAccount, `silverPurchases.${key}`, 0);
  }

  unableToPurchase(purchaseItem): boolean {
    return this.getNumSilverItemPurchased(purchaseItem.key) === purchaseItem.maxPurchases
        || purchaseItem.cost > this.colyseus.lobby.myAccount.silver;
  }

  doItemPurchase(purchaseItem) {
    (<any>swal)({
      titleText: `Purchase "${purchaseItem.name}"`,
      text: `Are you sure you want to purchase "${purchaseItem.name}"? 
      It will cost ${purchaseItem.cost.toLocaleString()} silver, leaving you with 
      ${(this.colyseus.lobby.myAccount.silver - purchaseItem.cost).toLocaleString()} silver.`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, buy it!'
    }).then(() => {
      this.colyseus.lobby.buySilverItem(purchaseItem.key);

    }).catch(() => {});
  }

  ngAfterViewInit() {
    (<any>this).stripeCheckoutLoader.createHandler({
      key: this.stripeKey,
      name: 'Land of the Rair',
      allowRememberMe: true,
      zipCode: true,
      billingAddress: true,
      currency: 'USD',
      image: 'https://play.rair.land/android-chrome-512x512.png',
      token: (token) => {
        this.colyseus.lobby.buySilver({ token, item: this.currentlyBuyingItem });
      }
    }).then((handler: StripeCheckoutHandler) => {
      this.stripeCheckoutHandler = handler;
    });
  }

  startPayment(item) {
    if(!this.stripeCheckoutHandler) return;

    this.currentlyBuyingItem = item;

    this.stripeCheckoutHandler.open({
      amount: item.price,
      email: this.colyseus.lobby.myAccount.email,
      description: item.silver ? `${item.silver.toLocaleString()} Silver` : `${item.duration} Month Subscription`
    });
  }

}
