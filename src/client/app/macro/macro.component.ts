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
    return this.macroRef ? (this.macroService.allMacros[this.macroRef].background || '#ccc') : '#ccc';
  }

  get foreground() {
    return this.macroRef ? this.macroService.allMacros[this.macroRef].foreground : '';
  }

  get iconName() {
    return this.macroRef ? this.macroService.allMacros[this.macroRef].icon : '';
  }

  get macroName() {
    return this.macroRef ? this.macroService.allMacros[this.macroRef].name : '';
  }
}
