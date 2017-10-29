import { Component, Input, OnInit } from '@angular/core';
import { ClientGameState } from '../clientgamestate';

import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'app-log-window',
  templateUrl: './log-window.component.html',
  styleUrls: ['./log-window.component.scss']
})
export class LogWindowComponent implements OnInit {

  @Input()
  public clientGameState: ClientGameState = new ClientGameState({});

  @Input()
  public windowSize;

  @Input()
  public fontSize;

  @LocalStorage()
  public filters;

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
