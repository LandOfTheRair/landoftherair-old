import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';

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

  private listener: any;

  ngOnInit() {
    this.listener = () => {
      if(document.activeElement.tagName === 'INPUT') return;
      this.cmdEntryInput.nativeElement.focus();
    };

    document.addEventListener('keypress', this.listener);
  }

  ngOnDestroy() {
    document.removeEventListener('keypress', this.listener);
  }

  sendCommand() {
    if(!this.command || !this.command.trim()) return;

    this.colyseusGame.sendCommandString(this.command);
    this.command = '';
  }
}
