import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { ColyseusGameService } from '../colyseus.game.service';

import { environment } from '../../environments/environment';

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
  public lastCommands: string[];

  private listener: any;
  private sendListener: any;

  private curIndex = -1;

  constructor(public colyseusGame: ColyseusGameService) {}

  ngOnInit() {
    this.listener = () => {
      if(document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
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

    if(!this.lastCommands) this.lastCommands = [];
  }

  ngOnDestroy() {
    document.removeEventListener('keypress', this.listener);
    document.removeEventListener('contextmenu', this.sendListener);
  }

  sendCommand() {
    if(!this.colyseusGame.currentCommand || !this.colyseusGame.currentCommand.trim()) return;

    this.curIndex = -1;

    if(this.colyseusGame.currentCommand === '.' && this.lastCommands[0]) {
      this.colyseusGame.sendCommandString(this.lastCommands[0]);
      this.colyseusGame.currentCommand = '';
      return;
    }

    this.colyseusGame.sendCommandString(this.colyseusGame.currentCommand);

    if(this.colyseusGame.currentCommand !== '.') {
      this.lastCommands.unshift(this.colyseusGame.currentCommand);
      if(this.lastCommands.length > 20) this.lastCommands.length = 20;
      // trigger ngx-webstorage writes
      this.lastCommands = this.lastCommands;
    }

    this.colyseusGame.currentCommand = '';
  }

  setCommandFromIndex() {
    if(this.curIndex === -1) this.colyseusGame.currentCommand = '';
    if(!this.lastCommands[this.curIndex]) return;
    this.colyseusGame.currentCommand = this.lastCommands[this.curIndex];
  }

  prevCommand($event) {
    $event.preventDefault();
    if(this.curIndex >= this.lastCommands.length) return;
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
