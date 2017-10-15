import { Component, OnInit, ViewChild } from '@angular/core';
import { ColyseusService } from './colyseus.service';

import * as swal from 'sweetalert2';
import { LocalStorage } from 'ngx-webstorage';
import { MacroService, Macro } from './macros.service';

import * as macicons from '../macicons/macicons.json';

import { includes, isNull, cloneDeep } from 'lodash';
import { AuthService } from './auth.service';

type Size = 'normal' | 'small' | 'xsmall';
type XSizeMax = 'max' | 'xlarge' | 'large' | 'normal' | 'small' | 'xsmall';
type XSize = 'xlarge' | 'large' | 'normal' | 'small' | 'xsmall';
type Theme = 'Light' | 'Dark';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('viewMacro')
  public viewMacroModal;

  @ViewChild('macroGroups')
  public macroGroupsModal;

  @ViewChild('options')
  public optionsModal;

  @ViewChild('macros')
  public macrosModal;

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

  public optionsModalVisible = false;
  public macroModalVisible = false;
  public macroEditModalVisible = false;
  public macroGroupModalVisible = false;

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
  public showCommandLine: boolean;

  @LocalStorage()
  public showInventorySack: boolean;

  @LocalStorage()
  public showInventoryBelt: boolean;

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
  public suppressZeroDamage: boolean;

  @LocalStorage()
  public showActiveTarget: boolean;

  @LocalStorage()
  public pinLastTarget: boolean;

  @LocalStorage()
  public playBackgroundMusic: boolean;

  @LocalStorage()
  public playSoundEffects: boolean;

  get loggedIn() {
    return this.colyseus.lobby.myAccount;
  }

  get inGame() {
    return this.colyseus.game.inGame;
  }

  get preloadImageAssets(): string[] {
    return ['decor', 'walls', 'items', 'creatures', 'swimming', 'terrain',  'effects'];
  }

  private imagesLoaded = 0;

  get resourcesLoaded() {
    return {
      done: this.imagesLoaded >= this.preloadImageAssets.length,
      current: this.imagesLoaded,
      total: this.preloadImageAssets.length
    };
  }

  constructor(public colyseus: ColyseusService, public macroService: MacroService, public authService: AuthService) {
    this.authService.handleAuthentication();
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

    this.initDefaultOptions();
  }

  imageLoaded() {
    this.imagesLoaded++;
    // TODO increment and check and enable buttons (a global "loaded" state) when all iamges have loaded
  }

  initDefaultOptions() {
    ['sack', 'belt', 'equipment', 'ground', 'logFont', 'logWindow', 'npcWindow'].forEach(opt => {
      if(this[`${opt}Size`]) return;
      this[`${opt}Size`] = 'normal';
    });

    const defaultOptions = [
      'showInventoryBelt', 'showInventorySack', 'showEquipment', 'showCommandLine',
      'showActiveTarget', 'pinLastTarget',
      'autoHideLobby',
      'playBackgroundMusic', 'playSoundEffects'
    ];

    defaultOptions.forEach(opt => {
      if(isNull(this[opt])) this[opt] = true;
    });

    this.theme = 'Light';
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
          if(name.length < 2 || name.length > 10) reject('Group name is not the right size');
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
    this.macroModalVisible = true;
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
      text: `Are you sure you want to remove the group "${groupName}"? This action is not reversible.`
    }).then(() => {
      this.macroService.removeMacroGroup(groupName);
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
}
