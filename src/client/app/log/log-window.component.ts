import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VirtualScrollComponent } from 'angular2-virtual-scroll';

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

  @ViewChild(VirtualScrollComponent)
  private chatView: VirtualScrollComponent;

  public visibleLogItems: any[] = [];
  public allFilteredVisibleLogItems: any[] = [];
  public allLogItems: any[] = [];

  private log$: any;
  private globalMsg$: any;
  private lastMessage: { account: string, message: string };

  public get clientGameState() {
    return this.colyseus.game.clientGameState;
  }

  public get containerHeight(): number {
    return get(this.windowManager.getWindow('log'), 'height', 0)        // window height (total)
      - 28                                                              // - window bar height
      - 31;                                                             // - window button height
  }

  constructor(public colyseus: ColyseusService, private windowManager: WindowManagerService) {}

  ngOnInit() {
    if(!this.filters) this.filters = { all: true, combat: true, env: true, chatter: true };
    this.log$ = this.clientGameState.logMessages$.subscribe(data => this.addLogItem(data));
    this.globalMsg$ = this.colyseus.lobby.newMessages$.subscribe(data => this.addGlobalMessage(data));
  }

  ngOnDestroy() {
    this.log$.unsubscribe();
    this.globalMsg$.unsubscribe();
  }

  private addGlobalMessage({ account, message }) {
    if(this.lastMessage && this.lastMessage.account === account && this.lastMessage.message === message) return;

    this.lastMessage = { account, message };
    this.addLogItem({
      name: `[global] ${account}`,
      message,
      subClass: 'chatter',
      grouping: 'chatter'
    });
  }

  private addLogItem(data) {
    this.allLogItems.push(data);
    if(this.allLogItems.length > 500) this.allLogItems.shift();

    if(this.filters.all || this.filters[data.grouping]) {
      this.allFilteredVisibleLogItems = this.allFilteredVisibleLogItems.concat([data]);
    }
  }

  public updateVisibleItems(items) {
    this.visibleLogItems = items;
  }

  saveFilters(newFilter: string) {

    ['all', 'chatter', 'env', 'combat'].forEach(x => this.filters[x] = false);
    this.filters[newFilter] = true;
    this.filters = this.filters;

    this.allFilteredVisibleLogItems = this.allLogItems.filter(msg => {
      return msg.grouping === 'always' || this.filters.all || this.filters[msg.grouping];
    });

    this.chatView.scrollInto(this.visibleLogItems[this.visibleLogItems.length - 1]);
  }

}
