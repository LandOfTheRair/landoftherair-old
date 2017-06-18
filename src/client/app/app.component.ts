import { Component, OnInit } from '@angular/core';
import { ColyseusService } from './colyseus.service';

import { LocalStorage } from 'ngx-webstorage';

type Size = 'normal' | 'small' | 'xsmall';
type XSizeMax = 'max' | 'xlarge' | 'large' | 'normal' | 'small' | 'xsmall';
type XSize = 'xlarge' | 'large' | 'normal' | 'small' | 'xsmall';
type Theme = 'Light' | 'Dark';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(public colyseus: ColyseusService) {}

  @LocalStorage()
  public minimized;

  // window visibility
  @LocalStorage()
  public showStatsWindow: boolean;

  @LocalStorage()
  public showCommandLine: boolean;

  @LocalStorage()
  public showInventorySack: boolean;
  
  @LocalStorage()
  public showInventoryKubby: boolean;
  
  @LocalStorage()
  public showInventoryBelt: boolean;

  @LocalStorage()
  public showEquipment: boolean;

  // options
  @LocalStorage()
  public sackSize: Size;
  
  @LocalStorage()
  public kubbySize: Size;
  
  @LocalStorage()
  public beltSize: Size;

  @LocalStorage()
  public equipmentSize: Size;

  @LocalStorage()
  public groundSize: Size;

  @LocalStorage()
  public logFontSize: XSize;

  @LocalStorage()
  public logWindowSize: XSizeMax;

  @LocalStorage()
  public npcWindowSize: XSizeMax;

  @LocalStorage()
  public theme: Theme;

  @LocalStorage()
  public rightClickSend: boolean;

  @LocalStorage()
  public autoHideLobby: boolean;

  get loggedIn() {
    return this.colyseus.lobby.myAccount;
  }

  get inGame() {
    return this.colyseus.game.inGame;
  }

  ngOnInit() {
    if(!this.minimized) this.minimized = {};
    this.colyseus.init();

    this.initDefaultOptions();
  }

  initDefaultOptions() {
    ['kubby', 'sack', 'belt', 'equipment', 'ground', 'logFont', 'logWindow'].forEach(opt => {
      if(this[`${opt}Size`]) return;
      this[`${opt}Size`] = 'normal';
    });

    this.theme = 'Light';
  }

  minimize(window: string) {
    this.minimized[window] = !this.minimized[window];

    // trigger localstorage memorizing
    this.minimized = this.minimized;
  }
}
