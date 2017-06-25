
import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

import { extend, values, sortBy } from 'lodash';
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

  name: string;
  icon: string;

  foreground = '#000';
  background = '#ccc';

  isSystem: boolean;

  constructor(opts = {}) {
    extend(this, opts);
  }
}

@Injectable()
export class MacroService {
  public visibleMacroGroups: string[] = ['default', null, null];

  public allMacros: any = {};

  public customMacros: any = {};

  public allMacroGroups: any = {};

  public allUsableMacros: Macro[] = [];

  public hasLoaded = false;

  public currentlySelectedMacro: string;

  public macroMap: any = {};

  constructor(private localStorage: LocalStorageService, private colyseusGame: ColyseusGameService) {
    this.loadMacros();
    this.watchActiveMacro();
    this.watchForMacros();
  }

  get activeMacro(): Macro {
    return this.allMacros[this.currentlySelectedMacro];
  }

  private watchForMacros() {
    document.addEventListener('keydown', (ev) => {
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
    });
  }

  private watchActiveMacro() {
    this.currentlySelectedMacro = this.localStorage.retrieve('selectedMacro');
    this.localStorage.observe('selectedMacro')
      .subscribe(macro => {
        this.currentlySelectedMacro = macro;
      });
  }

  public updateMacroKeys() {
    this.macroMap = {};
    values(this.allMacros).forEach(macro => {
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
    this.localStorage.store('customMacros', this.customMacros);
    this.localStorage.store('visibleMacroGroups', this.visibleMacroGroups);
    this.localStorage.store('allMacroGroups', this.allMacroGroups);
    this.resetUsableMacros();
    this.updateMacroKeys();
  }

  public addMacroGroup(name) {
    this.allMacroGroups[name] = [];
    this.saveMacros();
  }

  public removeMacroGroup(name) {
    if(name === 'default') return;
    delete this.allMacroGroups[name];
    this.saveMacros();
  }

  public loadMacros() {
    this.customMacros = this.localStorage.retrieve('customMacros') || {};
    this.visibleMacroGroups = this.localStorage.retrieve('visibleMacroGroups') || ['default', null, null];
    this.allMacroGroups = this.localStorage.retrieve('allMacroGroups') || ['default'];
    this.hasLoaded = true;

    extend(this.allMacros, this.customMacros);
    this.resetUsableMacros();
    this.updateMacroKeys();
  }

  public allMacroNames() {
    return Object.keys(this.allMacros).sort();
  }

  public allMacroGroupNames() {
    return Object.keys(this.allMacroGroups).sort();
  }

  public macroExists(name) {
    return this.allMacros[name];
  }

  public resetUsableMacros() {
    this.allUsableMacros = sortBy(values(this.allMacros), x => x.name.toLowerCase());
  }
}
