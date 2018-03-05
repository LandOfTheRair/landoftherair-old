
import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { get } from 'lodash';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs/Observable';
import * as swal from 'sweetalert2';

import { ColyseusService } from './colyseus.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-faded">
      <a class="navbar-brand" href="#">
        <span>Land of the Rair</span>
        <span *ngIf="colyseus.lobby.myAccount.username">- {{ colyseus.lobby.myAccount.username }}</span>
      </a>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav">
          <li class="nav-item" dropdown container="body">
            <a class="nav-link" href="#" dropdownToggle>Game {{ colyseus.isConnected ? '' : '(Disconnected)' }}</a>

            <ul *dropdownMenu class="dropdown-menu">
              <li *ngIf="colyseus.lobby.myAccount.username">
                <a class="dropdown-item" (click)="myAccount.show()">My Account</a>
              </li>
              <li *ngIf="colyseus.lobby.myAccount.username">
                <a class="dropdown-item" (click)="gameSettings.show()">Current Events</a>
              </li>
              <li *ngIf="!inGame && colyseus.lobby.myAccount.username">
                <a class="dropdown-item" (click)="silverModal.show()">Manage Silver</a>
              </li>
              <li class="divider dropdown-divider"></li>
              <li>
                <a class="dropdown-item" target="_blank" href="http://rair.land/docs/home/">Help!</a>
              </li>
              <li class="divider dropdown-divider"></li>
              <li *ngIf="inGame">
                <a class="dropdown-item" (click)="colyseus.game.quit()">Quit To Lobby</a>
              </li>
              <li>
                <a class="dropdown-item" (click)="logout()">Logout</a>
              </li>
            </ul>

          </li>
        </ul>

        <ul class="navbar-nav" id="windowList">
          <li class="nav-item" *ngIf="colyseus.lobby.myAccount.username" dropdown container="body">
            <a class="nav-link" href="#" dropdownToggle>Windows</a>

            <ul *dropdownMenu class="dropdown-menu">
              <li *ngIf="inGame">
                <a class="dropdown-item"
                   (click)="openWindow.emit({ key: 'showStatsWindow', window: 'stats' })">Stats</a>
              </li>
              <li *ngIf="inGame">
                <a class="dropdown-item"
                   (click)="openWindow.emit({ key: 'showSkillsWindow', window: 'skills' })">Skills</a>
              </li>
              <li *ngIf="inGame">
                <a class="dropdown-item"
                   (click)="openWindow.emit({ key: 'showTradeSkillsWindow', window: 'tradeSkills' })">Trade Skills</a>
              </li>
              <li *ngIf="inGame">
                <a class="dropdown-item"
                   (click)="openWindow.emit({ key: 'showCommandLine', window: 'commandLine' })">Command Line</a>
              </li>
              <li *ngIf="inGame">
                <a class="dropdown-item"
                   (click)="openWindow.emit({ key: 'showParty', window: 'party' })">Party</a>
              </li>
              <li *ngIf="inGame">
                <a class="dropdown-item"
                   (click)="openWindow.emit({ key: 'showTraits', window: 'traits' })">Traits</a>
              </li>
              <li class="divider dropdown-divider" *ngIf="inGame"></li>
              <li>
                <a class="dropdown-item" (click)="options.show()">Options</a>
              </li>
              <li>
                <a class="dropdown-item" (click)="debugOptions.show()">Debug Options</a>
              </li>
              <li *ngIf="inGame">
                <a class="dropdown-item" (click)="cleanup.emit(null)">Reset Window Positions</a>
              </li>
            </ul>

          </li>
        </ul>

        <ul class="navbar-nav mr-auto" *ngIf="inGame">
          <li class="nav-item" *ngIf="colyseus.lobby.myAccount" dropdown container="body">
            <a class="nav-link" href="#" dropdownToggle>Macros</a>

            <ul *dropdownMenu class="dropdown-menu">
              <li>
                <a class="dropdown-item" (click)="macros.show()">Macros</a>
              </li>
              <li>
                <a class="dropdown-item" (click)="macroGroups.show()">Macro Groups</a>
              </li>
            </ul>

          </li>
        </ul>

        <ul class="navbar-nav mr-auto ml-auto" *ngIf="inGame">
          <li class="nav-item" tooltip="Toggle Sack" placement="auto">
            <a class="nav-link" (click)="openWindow.emit({ key: 'showInventorySack', window: 'sack' })">
              <app-icon name="swap-bag" size="small" fgColor="#ccc" bgColor="transparent"></app-icon>
            </a>
          </li>
          <li class="nav-item" tooltip="Toggle Belt" placement="auto">
            <a class="nav-link" (click)="openWindow.emit({ key: 'showInventoryBelt', window: 'belt' })">
              <app-icon name="belt" size="small" fgColor="#ccc" bgColor="transparent"></app-icon>
            </a>
          </li>
          <li class="nav-item" tooltip="Toggle Pouch" placement="auto" *ngIf="hasPouch">
            <a class="nav-link" (click)="openWindow.emit({ key: 'showInventoryPouch', window: 'pouch' })">
              <app-icon name="knapsack" size="small" fgColor="#ccc" bgColor="transparent"></app-icon>
            </a>
          </li>
          <li class="nav-item" tooltip="Toggle Equipment" placement="auto">
            <a class="nav-link" (click)="openWindow.emit({ key: 'showEquipment', window: 'equipment' })">
              <app-icon name="battle-gear" size="small" fgColor="#ccc" bgColor="transparent"></app-icon>
            </a>
          </li>
        </ul>

        <ul class="navbar-nav ml-auto">
          <li class="nav-item" tooltip="Daily reset is when you can re-do daily quests, and buy new daily items!" placement="bottom">
            <a class="nav-link" href="#">Daily Reset in {{ timestampDisplay }}</a>
          </li>
        </ul>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {

  @Output()
  public openWindow = new EventEmitter();

  @Output()
  public cleanup = new EventEmitter();

  @Input()
  public myAccount;

  @Input()
  public gameSettings;

  @Input()
  public silverModal;

  @Input()
  public options;

  @Input()
  public debugOptions;

  @Input()
  public macros;

  @Input()
  public macroGroups;

  public resetTimestamp: number;
  public nowTimestamp: number;
  public timestampDisplay: string;

  public get inGame(): boolean {
    return this.colyseus.game.inGame;
  }

  public get hasPouch(): boolean {
    return get(this.colyseus.lobby.myAccount, 'silverPurchases.MagicPouch', 0) > 0;
  }

  constructor(
    public colyseus: ColyseusService
  ) {}

  ngOnInit() {
    this.watchResetTime();
  }

  private watchResetTime() {

    const setResetTimestamp = () => {
      let theoreticalResetTime = DateTime.fromObject({ zone: 'utc', hour: 12 });
      if(+theoreticalResetTime < DateTime.fromObject({ zone: 'utc' })) {
        theoreticalResetTime = theoreticalResetTime.plus({ days: 1 });
      }

      this.resetTimestamp = +theoreticalResetTime;
    };

    const formatTimestring = () => {
      const diff = (this.resetTimestamp - this.nowTimestamp) / 1000;
      const hours = Math.floor((diff / 60) / 60) % 60;
      const minutes = Math.floor((diff / 60)) % 60;

      this.timestampDisplay = `${hours > 0 ? hours + 'h' : ''}${minutes}m`;
    };

    setResetTimestamp();
    formatTimestring();

    Observable.timer(0, 60000)
      .subscribe(() => {
        this.nowTimestamp = +DateTime.fromObject({ zone: 'utc' });
        if(this.nowTimestamp > this.resetTimestamp) setResetTimestamp();
        formatTimestring();
      });
  }

  logout() {
    (<any>swal)({
      titleText: `Log Out`,
      text: `Are you sure you want to log out?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout!'
    }).then(() => {
      this.colyseus.lobby.logout();

    }).catch(() => {});
  }
}
