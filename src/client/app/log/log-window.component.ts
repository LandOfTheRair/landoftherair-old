import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { LocalStorage } from 'ngx-webstorage';
import { ColyseusService } from '../colyseus.service';
import { WindowManagerService } from '../windowmanager.service';

import { get } from 'lodash';

@Component({
  selector: 'app-log-window',
  templateUrl: './log-window.component.html',
  styleUrls: ['./log-window.component.scss']
})
export class LogWindowComponent implements OnInit, OnDestroy {

  @Input()
  public windowSize;

  @Input()
  public fontSize;

  @LocalStorage()
  public filters;

  public visibleLogItems: any[] = [];
  public allFilteredVisibleLogItems: any[] = [];
  public allLogItems: any[] = [];

  private log$: any;
  private globalMsg$: any;

  public get clientGameState() {
    return this.colyseus.game.clientGameState;
  }

  public get containerHeight(): number {
    return get(this.windowManager.getWindow('log'), 'height', 0)        // window height (total)
      - 28                                                                                        // - window bar height
      - 31;                                                                                       // - window button height
  }

  constructor(public colyseus: ColyseusService, private windowManager: WindowManagerService) {}

  ngOnInit() {
    if(!this.filters) this.filters = { combat: true, env: true, chatter: true };
    this.log$ = this.clientGameState.logMessages$.subscribe(data => this.addLogItem(data));
    this.globalMsg$ = this.colyseus.lobby.newMessages$.subscribe(data => this.addGlobalMessage(data));
  }

  ngOnDestroy() {
    this.log$.unsubscribe();
    this.globalMsg$.unsubscribe();
  }

  private addGlobalMessage({ account, message }) {
    this.addLogItem({
      name: `[global] ${account}`,
      message,
      subClass: 'chatter',
      grouping: 'chatter'
    });
  }

  private addLogItem(data) {
    console.log(data);
    this.allLogItems.push(data);
    if(this.allLogItems.length > 500) this.allLogItems.shift();

    this.allFilteredVisibleLogItems = this.allFilteredVisibleLogItems.concat([data]);
  }

  public updateVisibleItems(items) {
    this.visibleLogItems = items;
  }

  // trigger ngx-webstorage
  saveFilters() {
    this.filters = this.filters;
  }

}
