import { Component, Input } from '@angular/core';
import { MacroService } from '../macros.service';

@Component({
  selector: 'app-macro',
  templateUrl: './macro.component.html',
  styleUrls: ['./macro.component.scss']
})
export class MacroComponent {

  @Input()
  public macroRef: string;

  @Input()
  public isActive: boolean;

  @Input()
  public disableEffects = false;

  constructor(public macroService: MacroService) { }

  get background() {
    if(!this.macroRef || !this.macroService.allMacros[this.macroRef]) return '#ccc';
    return this.macroService.allMacros[this.macroRef].background || '#ccc';
  }

  get foreground() {
    if(!this.macroRef || !this.macroService.allMacros[this.macroRef]) return '';
    return this.macroService.allMacros[this.macroRef].foreground;
  }

  get iconName() {
    if(!this.macroRef || !this.macroService.allMacros[this.macroRef]) return '';
    return this.macroService.allMacros[this.macroRef].icon;
  }

  get macroName() {
    if(!this.macroRef || !this.macroService.allMacros[this.macroRef]) return '';
    return this.macroService.allMacros[this.macroRef].name;
  }
}
