import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { ColyseusGameService } from '../colyseus.game.service';
import { ColyseusLobbyService } from '../colyseus.lobby.service';

import { startsWith } from 'lodash';

import { environment } from '../../environments/environment';
import { MacroService } from '../macros.service';

type Mode = 'cmd' | 'say' | 'party' | 'global';

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
  public cmdMode: Mode;

  private listener: any;
  private sendListener: any;

  private curIndex = -1;

  public get placeholder(): string {
    if(this.cmdMode === 'say') return 'Type your message here...';
    if(this.cmdMode === 'party') return 'Chat to your party here...';
    if(this.cmdMode === 'global') return 'Type your message to share to lobby here...';
    if(this.cmdMode === 'cmd') return 'Enter your command here...';
  }

  public get buttonText(): string {
    if(this.cmdMode === 'say') return 'Say';
    if(this.cmdMode === 'party') return 'Party';
    if(this.cmdMode === 'global') return 'Global';
    if(this.cmdMode === 'cmd') return 'Cmd';
  }

  constructor(
    public colyseusGame: ColyseusGameService,
    public colyseusLobby: ColyseusLobbyService,
    public macroService: MacroService
  ) {}

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

    if(!this.cmdMode) this.cmdMode = 'cmd';
  }

  ngOnDestroy() {
    document.removeEventListener('keypress', this.listener);
    document.removeEventListener('contextmenu', this.sendListener);
  }

  sendCommand() {
    if(!this.colyseusGame.currentCommand || !this.colyseusGame.currentCommand.trim()) return;

    const shouldBypassOthers = startsWith(this.colyseusGame.currentCommand, '#');

    if(!shouldBypassOthers && this.cmdMode === 'say') {
      this.colyseusGame.sendCommandString(`~say ${this.colyseusGame.currentCommand}`);
      this.colyseusGame.currentCommand = '';
      return;
    }

    if(!shouldBypassOthers && this.cmdMode === 'party') {
      this.colyseusGame.sendCommandString(`~partysay ${this.colyseusGame.currentCommand}`);
      this.colyseusGame.currentCommand = '';
      return;
    }

    if(!shouldBypassOthers && this.cmdMode === 'global') {
      this.colyseusLobby.sendMessage(this.colyseusGame.currentCommand);
      this.colyseusGame.currentCommand = '';
      return;
    }

    if(shouldBypassOthers) {
      this.colyseusGame.currentCommand = this.colyseusGame.currentCommand.substring(1);
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

    const cmd = this.colyseusGame.lastCommands[this.curIndex];
    this.colyseusGame.currentCommand = cmd;
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
