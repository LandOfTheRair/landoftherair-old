
import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

import * as _ from 'lodash';
import { ColyseusGameService } from './colyseus.game.service';

export class MacroGroup {
  macroNames: string[];
  name: string;
}

export class Macro {
  key: string;
  modifiers = { shift: false, alt: false, ctrl: false };

  autoActivate: boolean;
  lockActivation: boolean;
  clickToTarget = true;

  appendTargetToEachMacro = true;
  macro = '';

  tooltipDesc: string;

  name: string;
  icon: string;

  foreground = '#000';
  background = '#ccc';

  isSystem: boolean;
  requiresLearn: boolean;

  constructor(opts = {}) {
    _.extend(this, opts);
    if(!this.foreground) this.foreground = '#000';
    if(!this.background) this.background = '#ccc';
  }
}

@Injectable()
export class MacroService {
  public visibleMacroGroups: string[] = ['default', null, null];

  public allMacros: any = {};

  public customMacros: any = {};

  public allMacroGroups: any = {};

  public iterableMacroGroups: any[] = [];

  public allUsableMacros: Macro[] = [];

  public hasLoaded = false;

  public currentlySelectedMacro: string;

  public macroMap: any = {};

  public macroSubscription: any;

  private macroListener: any;

  private loadMutex: boolean;

  private shouldIgnoreKeybinds: Function;

  public set ignoreFunction(func: Function) {
    if(this.shouldIgnoreKeybinds) return;
    this.shouldIgnoreKeybinds = func;
  }

  constructor(private localStorage: LocalStorageService, private colyseusGame: ColyseusGameService) {
    this.watchGameObservables();
  }

  private watchGameObservables() {
    this.colyseusGame.inGame$.subscribe((inGame) => {
      if(inGame) this.init();
      else       this.uninit();
    });

    this.colyseusGame.gameCommand$.subscribe(({ action }) => {
      if(action === 'update_macros') this.resetUsableMacros();
    });
  }

  init() {
    if(this.loadMutex) return;
    this.loadMutex = true;

    this.hasLoaded = false;
    this.allMacros = {};
    this.loadMacros();
    this.watchActiveMacro();
    this.watchForMacros();
    this.hasLoaded = true;
  }

  uninit() {
    if(!this.loadMutex) return;
    this.loadMutex = false;
    document.removeEventListener('keydown', this.macroListener);
  }

  get activeMacro(): Macro {
    return this.allMacros[this.currentlySelectedMacro];
  }

  public hasMacroMatching(key: string) {
    return this.macroMap[key.toUpperCase()];
  }

  private watchForMacros() {
    this.macroListener = (ev) => {
      if(this.shouldIgnoreKeybinds()) return;

      let builtMacro = '';
      if(ev.altKey) builtMacro = 'ALT+';
      if(ev.ctrlKey) builtMacro = `${builtMacro}CTRL+`;
      if(ev.shiftKey) builtMacro = `${builtMacro}SHIFT+`;

      builtMacro = `${builtMacro}${ev.key.toUpperCase()}`;

      const macro = this.macroMap[builtMacro];
      if(!macro) return;

      ev.preventDefault();
      ev.stopPropagation();

      const macroText = macro.macro;

      if(macro.autoActivate) {
        this.colyseusGame.sendCommandString(macroText);
      } else {
        this.colyseusGame.currentCommand = macroText;

      }
    };

    document.addEventListener('keydown', this.macroListener);
  }

  public retrieveForCharacter(key) {
    if(!this.colyseusGame.character) return {};
    const charName = this.colyseusGame.character.name;
    return this.localStorage.retrieve(`${charName}-${key}`);
  }

  public storeForCharacter(key, value) {
    if(!this.colyseusGame.character) return;
    const charName = this.colyseusGame.character.name;
    return this.localStorage.store(`${charName}-${key}`, value);
  }

  private observeForCharacter(key) {
    if(!this.colyseusGame.character) return;
    const charName = this.colyseusGame.character.name;
    return this.localStorage.observe(`${charName}-${key}`);
  }

  private watchActiveMacro() {
    this.currentlySelectedMacro = this.retrieveForCharacter('selectedMacro');
    if(this.macroSubscription) this.macroSubscription.unsubscribe();
    this.macroSubscription = this.observeForCharacter('selectedMacro')
      .subscribe(macro => {
        this.currentlySelectedMacro = macro;
      });
  }

  public updateMacroKeys() {
    this.macroMap = {};
    _.values(this.allMacros).forEach(macro => {
      if(!macro.key) return;

      let macroString = '';
      if(macro.modifiers.alt) macroString = `ALT+`;
      if(macro.modifiers.ctrl) macroString = `${macroString}CTRL+`;
      if(macro.modifiers.shift) macroString = `${macroString}SHIFT+`;

      macroString = `${macroString}${macro.key}`;

      this.macroMap[macroString] = macro;
    });
  }

  public addCustomMacro(macro) {
    while(this.macroExists(macro.name)) {
      macro.name = `${macro.name} 2`;
    }
    this.customMacros[macro.name] = macro;
    this.allMacros[macro.name] = macro;
    this.updateMacroKeys();
    this.saveMacros();
  }

  public replaceCustomMacro(oldMacro, newMacro) {
    this.removeMacro(oldMacro);
    this.addCustomMacro(newMacro);
  }

  public removeMacro(macro) {
    delete this.customMacros[macro.name];
    delete this.allMacros[macro.name];
    this.updateMacroKeys();
    this.saveMacros();
  }

  public saveMacros() {
    this.storeForCharacter('customMacros', this.customMacros);
    this.storeForCharacter('visibleMacroGroups', this.visibleMacroGroups);
    this.storeForCharacter('allMacroGroups', this.allMacroGroups);
    this.resetUsableMacros();
    this.resetIterableMacroGroups();
    this.updateMacroKeys();
  }

  public addMacroGroup(name) {
    this.allMacroGroups[name] = [];
    this.saveMacros();
    this.resetIterableMacroGroups();
  }

  public removeMacroGroup(name) {
    if(name === 'default') return;
    delete this.allMacroGroups[name];
    this.saveMacros();
    this.resetIterableMacroGroups();
  }

  public loadMacros() {
    this.customMacros = this.retrieveForCharacter('customMacros') || {};
    this.visibleMacroGroups = this.retrieveForCharacter('visibleMacroGroups') || ['default', null, null];
    this.allMacroGroups = this.retrieveForCharacter('allMacroGroups') || { default: [] };

    _.extend(this.allMacros, this.customMacros);
    this.resetUsableMacros();
    this.resetIterableMacroGroups();
    this.updateMacroKeys();
  }

  public allMacroNames() {
    return this.allUsableMacros.map(x => x.name);
  }

  public macroExists(name) {
    return this.allMacros[name];
  }

  public updateMacroGroup(macroGroup: string, macroIdx: number, newMacro: string) {
    this.allMacroGroups[macroGroup][macroIdx] = newMacro;
    this.saveMacros();
  }

  private resetIterableMacroGroups() {
    this.iterableMacroGroups = Object.keys(this.allMacroGroups).map(key => ({ key, group: this.allMacroGroups[key] }));
  }

  public resetUsableMacros() {
    this.allUsableMacros = _(this.allMacros)
      .values()
      .reject(x => {
        const learnedSpells = this.colyseusGame.character.learnedSpells || {};
        if(x.requiresLearn) {
          return !learnedSpells[x.name.toLowerCase()];
        }
        return false;
      })
      .sortBy('name')
      .sortBy('isSystem')
      .sortBy('requiresLearn')
      .value();

  }
}
