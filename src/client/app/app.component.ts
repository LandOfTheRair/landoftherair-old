import { Component, OnInit } from '@angular/core';
import { ColyseusService } from './colyseus.service';

import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(public colyseus: ColyseusService) {}

  @LocalStorage()
  public minimized;

  @LocalStorage()
  public showStatsWindow: boolean;

  @LocalStorage()
  public showCommandLine: boolean;

  @LocalStorage()
  public showInventorySack: boolean;

  @LocalStorage()
  public showInventoryBelt: boolean;

  @LocalStorage()
  public showEquipment: boolean;

  get loggedIn() {
    return this.colyseus.lobby.myAccount;
  }

  get inGame() {
    return this.colyseus.game.inGame;
  }

  ngOnInit() {
    if(!this.minimized) this.minimized = {};
    this.colyseus.init();
  }

  minimize(window: string) {
    this.minimized[window] = !this.minimized[window];

    // trigger localstorage memorizing
    this.minimized = this.minimized;
  }
}
