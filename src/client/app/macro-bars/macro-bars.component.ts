import { Component, OnInit } from '@angular/core';

import { ColyseusGameService } from '../colyseus.game.service';

import * as macros from './macros.json';
import { MacroService, Macro } from '../macros.service';

import { findIndex } from 'lodash';

@Component({
  selector: 'app-macro-bars',
  templateUrl: './macro-bars.component.html',
  styleUrls: ['./macro-bars.component.scss']
})
export class MacroBarsComponent implements OnInit {

  public selectedMacro;

  public macroArray = Array(10).fill(null).map((x, i) => i);

  constructor(private colyseusGame: ColyseusGameService, public macroService: MacroService) { }

  ngOnInit() {
    this.selectedMacro = this.macroService.retrieveForCharacter('selectedMacro');
    this.createDefaultMacros();
  }

  createDefaultMacros() {

    (<any>macros).allMeta.forEach(({ name, macro, icon, mode, color, bgColor, key, isSystem, requiresLearn }) => {
      const macroObject = new Macro();
      macroObject.name = name;
      macroObject.macro = macro;
      macroObject.icon = icon;
      macroObject.foreground = color;
      macroObject.background = bgColor;
      macroObject[mode] = true;
      macroObject.key = key;
      macroObject.isSystem = isSystem;
      macroObject.requiresLearn = requiresLearn;

      this.macroService.allMacros[name] = macroObject;
    });


    if(!this.macroService.allMacroGroups) this.macroService.allMacroGroups = {};
    // this is manual because there will be more default macros but not all of them get added to group
    this.macroService.allMacroGroups.default = ['Attack', 'Search', 'Drink', 'Stairs', 'Climb', 'Restore'];

    if(!this.selectedMacro) {
      this.setSelectedMacro('Attack');
    }

    this.macroService.saveMacros();
  }

  public setSelectedMacro(macro) {
    this.selectedMacro = macro;
    this.macroService.storeForCharacter('selectedMacro', this.selectedMacro);
  }

  public operateOnMacro(macro: Macro) {
    if(!macro) return;

    if(macro.lockActivation) {
      this.setSelectedMacro(macro.name);
      return;
    }

    if(macro.autoActivate) {
      this.colyseusGame.sendCommandString(macro.macro);
      return;
    }

    this.colyseusGame.currentCommand = macro.macro;
  }

  public changeMacroGroup(macroBarIndex, modifier = 0) {
    const currentName = this.macroService.visibleMacroGroups[macroBarIndex];
    const currentIndex = findIndex(this.macroService.iterableMacroGroups, { key: currentName });

    let newIndex = currentIndex + modifier;
    if(newIndex === -1) newIndex = this.macroService.iterableMacroGroups.length - 1;
    if(newIndex === this.macroService.iterableMacroGroups.length) newIndex = 0;
    
    this.macroService.visibleMacroGroups[macroBarIndex] = this.macroService.iterableMacroGroups[newIndex].key;
  }

}
