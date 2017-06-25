import { Component, OnInit } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';

import { ColyseusGameService } from '../colyseus.game.service';

import * as macros from './macros.json';
import { MacroService, Macro } from '../macros.service';

@Component({
  selector: 'app-macro-bars',
  templateUrl: './macro-bars.component.html',
  styleUrls: ['./macro-bars.component.scss']
})
export class MacroBarsComponent implements OnInit {

  @LocalStorage()
  public selectedMacro;

  public macroArray = Array(10).fill(null).map((x, i) => i);

  constructor(private colyseusGame: ColyseusGameService, public macroService: MacroService) { }

  ngOnInit() {
    this.createDefaultMacros();
  }

  createDefaultMacros() {

    (<any>macros).allMeta.forEach(({ name, macro, icon, mode, color, key, isSystem }) => {
      const macroObject = new Macro();
      macroObject.name = name;
      macroObject.macro = macro;
      macroObject.icon = icon;
      macroObject.foreground = color;
      macroObject[mode] = true;
      macroObject.key = key;
      macroObject.isSystem = isSystem;

      this.macroService.allMacros[name] = macroObject;
    });


    if(!this.macroService.allMacroGroups) this.macroService.allMacroGroups = {};
    // this is manual because there will be more default macros but not all of them get added to group
    this.macroService.allMacroGroups.default = ['Attack', 'Search', 'Drink', 'Stairs', 'Climb', 'Restore'];

    if(!this.selectedMacro) {
      this.selectedMacro = 'Attack';
    }

    this.macroService.saveMacros();
  }

  public operateOnMacro(macro: Macro) {
    if(macro.lockActivation) {
      this.selectedMacro = macro.name;
      return;
    }

    if(macro.autoActivate) {
      this.colyseusGame.sendCommandString(macro.macro);
      return;
    }

    this.colyseusGame.currentCommand = macro.macro;
  }

}
