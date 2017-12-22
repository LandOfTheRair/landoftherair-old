import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { ColyseusGameService } from '../colyseus.game.service';

import { environment } from '../../environments/environment';
import { MacroService } from '../macros.service';

@Component({
  selector: 'app-command-line',
  templateUrl: './command-line.component.html',
  styleUrls: ['./command-line.component.scss']
})
export class CommandLineComponent implements OnInit, OnDestroy {

  @Input()
  public rightClickSend: boolean;

  @ViewChild('cmdEntry')
  public cmdEntryInput;

  @LocalStorage()
  public isSay: boolean;

  private listener: any;
  private sendListener: any;

  private curIndex = -1;

  constructor(public colyseusGame: ColyseusGameService, public macroService: MacroService) {}

  ngOnInit() {
    this.listener = (ev) => {
      if(document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      if(this.macroService.hasMacroMatching(ev.key)) return;
      this.cmdEntryInput.nativeElement.focus();
    };

    document.addEventListener('keypress', this.listener);

    this.sendListener = (ev) => {
      if(environment.production) {
        ev.preventDefault();
      }
      if(!this.rightClickSend) return;
      this.sendCommand();
    };

    document.addEventListener('contextmenu', this.sendListener);
  }

  ngOnDestroy() {
    document.removeEventListener('keypress', this.listener);
    document.removeEventListener('contextmenu', this.sendListener);
  }

  sendCommand() {
    if(!this.colyseusGame.currentCommand || !this.colyseusGame.currentCommand.trim()) return;

    if(this.isSay) {
      this.colyseusGame.sendCommandString(`~say ${this.colyseusGame.currentCommand}`);
      this.colyseusGame.currentCommand = '';
      return;
    }

    this.curIndex = -1;

    if(this.colyseusGame.currentCommand === '.' && this.colyseusGame.lastCommands[0]) {
      this.colyseusGame.sendCommandString(this.colyseusGame.lastCommands[0]);
      this.colyseusGame.currentCommand = '';
      return;
    }

    this.colyseusGame.sendCommandString(this.colyseusGame.currentCommand);

    if(this.colyseusGame.currentCommand !== '.') {
      this.colyseusGame.doCommand(this.colyseusGame.currentCommand);
    }

    this.colyseusGame.currentCommand = '';

    (<HTMLElement>document.activeElement).blur();
  }

  setCommandFromIndex() {
    if(this.curIndex === -1) this.colyseusGame.currentCommand = '';
    if(!this.colyseusGame.lastCommands[this.curIndex]) return;
    this.colyseusGame.currentCommand = this.colyseusGame.lastCommands[this.curIndex];
  }

  prevCommand($event) {
    $event.preventDefault();
    if(this.curIndex >= this.colyseusGame.lastCommands.length) return;
    this.curIndex++;
    this.setCommandFromIndex();
  }

  nextCommand($event) {
    $event.preventDefault();
    if(this.curIndex <= -1) return;
    this.curIndex--;
    this.setCommandFromIndex();
  }
}
