import { Component, Input, OnInit } from '@angular/core';
import { ClientGameState } from '../clientgamestate';

import { LocalStorage } from 'ngx-webstorage';
import { ColyseusService } from '../colyseus.service';

@Component({
  selector: 'app-log-window',
  templateUrl: './log-window.component.html',
  styleUrls: ['./log-window.component.scss']
})
export class LogWindowComponent implements OnInit {

  @Input()
  public windowSize;

  @Input()
  public fontSize;

  @LocalStorage()
  public filters;

  public get clientGameState() {
    return this.colyseus.game.clientGameState;
  }

  constructor(public colyseus: ColyseusService) {}

  ngOnInit() {
    if(!this.filters) this.filters = { combat: true, env: true, chatter: true };
  }

  // trigger ngx-webstorage
  saveFilters() {
    this.filters = this.filters;
  }

  formatMessage(message: any) {
    if(message.dirFrom && message.message.toLowerCase().startsWith('you hear')) {
      return message.message.substring(8);
    }
    return message.message;
  }

}
