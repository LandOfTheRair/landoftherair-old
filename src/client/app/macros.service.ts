
import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

import { extend, values, sortBy } from 'lodash';

export class MacroGroup {
  macroNames: string[];
  name: string;
}

export class Macro {
  key: string;
  modifiers = { shift: false, alt: false, ctrl: false };

  autoActivate: boolean;
  lockActivation: boolean;
  clickToTarget: boolean = true;

  appendTargetToEachMacro: boolean = true;
  macro: string = '';

  name: string;
  icon: string;

  foreground: string = '#000';
  background: string = '#ccc';

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

  constructor(private localStorage: LocalStorageService) {
    this.loadMacros();
  }

  public addCustomMacro(macro) {
    while(this.macroExists(macro.name)) {
      macro.name = `${macro.name} 2`;
    }
    this.customMacros[macro.name] = macro;
    this.allMacros[macro.name] = macro;
    this.saveMacros();
  }

  public replaceCustomMacro(oldMacro, newMacro) {
    this.removeMacro(oldMacro);
    this.addCustomMacro(newMacro);
  }

  public removeMacro(macro) {
    delete this.customMacros[macro.name];
    delete this.allMacros[macro.name];
    this.saveMacros();
  }

  public saveMacros() {
    this.localStorage.store('customMacros', this.customMacros);
    this.localStorage.store('visibleMacroGroups', this.visibleMacroGroups);
    this.localStorage.store('allMacroGroups', this.allMacroGroups);
    this.resetUsableMacros();
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
    this.customMacros = this.localStorage.retrieve('customMacros');
    this.visibleMacroGroups = this.localStorage.retrieve('visibleMacroGroups');
    this.allMacroGroups = this.localStorage.retrieve('allMacroGroups');
    this.hasLoaded = true;

    extend(this.allMacros, this.customMacros);
    this.resetUsableMacros();
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
