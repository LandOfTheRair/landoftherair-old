import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'app-command-line',
  templateUrl: './command-line.component.html',
  styleUrls: ['./command-line.component.scss']
})
export class CommandLineComponent implements OnInit, OnDestroy {

  @ViewChild('cmdEntry')
  public cmdEntryInput;

  @Input()
  public colyseusGame;

  public command: string = '';

  @LocalStorage()
  public lastCommands: string[];

  private listener: any;

  private curIndex = -1;

  ngOnInit() {
    this.listener = () => {
      if(document.activeElement.tagName === 'INPUT') return;
      this.cmdEntryInput.nativeElement.focus();
    };

    document.addEventListener('keypress', this.listener);

    if(!this.lastCommands) this.lastCommands = [];
  }

  ngOnDestroy() {
    document.removeEventListener('keypress', this.listener);
  }

  sendCommand() {
    if(!this.command || !this.command.trim()) return;

    this.curIndex = -1;

    if(this.command === '.' && this.lastCommands[0]) {
      this.colyseusGame.sendCommandString(this.lastCommands[0]);
      this.command = '';
      return;
    }

    this.colyseusGame.sendCommandString(this.command);

    if(this.command !== '.') {
      this.lastCommands.unshift(this.command);
      if(this.lastCommands.length > 20) this.lastCommands.length = 20;
      // trigger ngx-webstorage writes
      this.lastCommands = this.lastCommands;
    }

    this.command = '';
  }

  setCommandFromIndex() {
    if(this.curIndex === -1) this.command = '';
    if(!this.lastCommands[this.curIndex]) return;
    this.command = this.lastCommands[this.curIndex];
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
