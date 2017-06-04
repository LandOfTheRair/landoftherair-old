import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-command-line',
  templateUrl: './command-line.component.html',
  styleUrls: ['./command-line.component.scss']
})
export class CommandLineComponent {

  @Input()
  public colyseusGame;

  public command: string = '';

  constructor() { }

  sendCommand() {
    if(!this.command || !this.command.trim()) return;

    this.colyseusGame.sendCommandString(this.command);
    this.command = '';
  }
}
