import { Component, OnInit, ViewChild } from '@angular/core';
import { ColyseusService } from './colyseus.service';

import * as swal from 'sweetalert2';
import { LocalStorage } from 'ngx-webstorage';
import { MacroService, Macro } from './macros.service';

import * as macicons from '../macicons/macicons.json';

import { includes } from 'lodash';

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

  constructor(public colyseus: ColyseusService, public macroService: MacroService) {}

  @ViewChild('viewMacro')
  public viewMacroModal;

  private oldMacro: Macro;
  public currentlyEditingMacro: Macro = new Macro();
  public currentIconPage = 0;
  public currentIconsInPage = [];
  public currentMacroGroup = 'default';
  public macroArray = Array(10).fill(null).map((x, i) => i);

  public optionsModalVisible = false;
  public macroModalVisible = false;
  public macroEditModalVisible = false;
  public macroGroupModalVisible = false;

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

  get loggedIn() {
    return this.colyseus.lobby.myAccount;
  }

  get inGame() {
    return this.colyseus.game.inGame;
  }

  ngOnInit() {
    if(!this.minimized) this.minimized = {};
    this.colyseus.init();

    this.initDefaultOptions();
  }

  initDefaultOptions() {
    ['sack', 'belt', 'equipment', 'ground', 'logFont', 'logWindow'].forEach(opt => {
      if(this[`${opt}Size`]) return;
      this[`${opt}Size`] = 'normal';
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
      text: 'It must be between 2 and 20 characters.',
      input: 'text',
      preConfirm: (name) => {
        return new Promise((resolve, reject) => {
          if(name.length < 2 || name.length > 20) reject('Group name is not the right size');
          resolve();
        });
      }
    }).then(name => {
      this.macroService.addMacroGroup(name);
    }).reject(() => {});
  }

  removeMacroGroup() {
    this.macroService.removeMacroGroup(this.currentMacroGroup);
    this.currentMacroGroup = 'default';
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
    this.currentIconsInPage = this.allMacroIcons.slice(page, page+pageSize);
  }
}
