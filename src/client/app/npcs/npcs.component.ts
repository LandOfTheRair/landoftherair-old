import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import { compact, find, pull, findIndex, sortBy, cloneDeep, isBoolean } from 'lodash';
import { NPC } from '../../../shared/models/npc';
import { MacroService } from '../macros.service';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-npcs',
  templateUrl: './npcs.component.html',
  styleUrls: ['./npcs.component.scss']
})
export class NpcsComponent implements OnInit, OnDestroy {

  @Input()
  public windowSize;

  private pinOption$: any;
  private shouldPin: boolean;
  private sortFriendly$: any;
  private shouldSortFriendly: boolean;
  private sortDistance$: any;
  private shouldSortDistance: boolean;

  private pinUUID: string;
  private pinPos: number;

  public visibleNPCList: NPC[] = [];

  private move$;
  private timer$;

  constructor(
    private colyseusGame: ColyseusGameService,
    private macroService: MacroService,
    private localStorage: LocalStorageService
  ) { }

  ngOnInit() {
    this.shouldPin = this.localStorage.retrieve('pinLastTarget');

    this.pinOption$ = this.localStorage.observe('pinLastTarget')
      .subscribe((value) => {
        this.shouldPin = value;
      });

    this.shouldSortFriendly = this.localStorage.retrieve('shouldSortFriendly');

    this.sortFriendly$ = this.localStorage.observe('shouldSortFriendly')
      .subscribe((value) => {
        this.shouldSortFriendly = value;
      });

    this.shouldSortDistance = this.localStorage.retrieve('sortNPCsByDistance');

    this.sortDistance$ = this.localStorage.observe('sortNPCsByDistance')
      .subscribe((value) => {
        this.shouldSortDistance = value;
      });

    this.timer$ = Observable.timer(0, 500)
      .subscribe(() => this.updateNPCList());

    this.move$ = this.colyseusGame.myLoc$.subscribe(() => this.updateNPCList());
  }

  ngOnDestroy() {
    this.pinOption$.unsubscribe();
    this.sortFriendly$.unsubscribe();
    this.timer$.unsubscribe();
    this.move$.unsubscribe();
  }

  private updateNPCList() {
    this.visibleNPCList = this.visibleNPCS();
  }

  private visibleNPCS() {
    if(!this.colyseusGame.character) return [];

    const fov = this.colyseusGame.clientGameState.fov;
    const npcs: any[] = this.colyseusGame.clientGameState.allCharacters;

    if(!fov) return [];
    const me = this.colyseusGame.character;

    let unsorted = compact(npcs.map(npc => {
      if((<any>npc).username === me.username) return false;
      if(npc.dir === 'C') return false;
      if(!me.canSeeThroughStealthOf(npc)) return false;
      const diffX = npc.x - me.x;
      const diffY = npc.y - me.y;

      if(!fov[diffX]) return false;
      if(!fov[diffX][diffY]) return false;
      return npc;
    }));

    if(this.shouldSortDistance) {
      unsorted = sortBy(unsorted, npc => npc.distFrom(me));
    }

    if(isBoolean(this.shouldSortFriendly)) {
      const sortOrder = this.shouldSortFriendly ? { neutral: 0, friendly: 1, hostile: 2 } : { hostile: 0, neutral: 1, friendly: 2 };
      unsorted = sortBy(unsorted, npc => sortOrder[this.colyseusGame.hostilityLevelFor(npc)]);
    }

    if(!this.pinUUID || !this.shouldPin) return unsorted;

    const npc = find(unsorted, { uuid: this.pinUUID });
    const index = findIndex(unsorted, npc);

    if(!npc || index === this.pinPos) return unsorted;

    pull(unsorted, npc);

    if(this.pinPos > unsorted.length) {
      const difference = this.pinPos - unsorted.length;
      if(difference > 0) {
        for(let i = 0; i < difference; i++) {
          unsorted.push(null);
        }
      }
      unsorted.push(npc);
    } else {
      unsorted.splice(this.pinPos, 0, npc);
    }

    return unsorted;
  }

  public doAction(npc: NPC, $event, index) {

    // always set target, but if you hold ctrl, don't do anything else
    this.colyseusGame.clientGameState.activeTarget = npc;
    if($event.ctrlKey) return;

    this.pinUUID = npc.uuid;
    this.pinPos = index;

    if(npc.hostility === 'Never') {
      this.colyseusGame.sendCommandString(`${npc.uuid}, hello`);

    } else if((<any>npc).username && !this.colyseusGame.currentCommand && this.colyseusGame.hostilityLevelFor(npc) !== 'hostile') {
      this.colyseusGame.currentCommand = `${npc.uuid}, `;

    } else if(this.colyseusGame.currentCommand) {
      this.colyseusGame.sendCommandString(this.colyseusGame.currentCommand, npc.uuid);
      this.colyseusGame.currentCommand = '';

    } else {
      this.colyseusGame.sendCommandString(this.macroService.activeMacro.macro, npc.uuid);
    }
  }

  public doAltAction(target) {
    if(target.isPlayer()) {
      this.tryViewEquipment(target);
      return;
    }

    this.trySendAltAction(target);
  }

  public tryViewEquipment(target) {
    this.colyseusGame.currentViewTarget = cloneDeep(target);
  }

  public trySendAltAction(target) {
    if(target.name === 'Alchemist') this.colyseusGame.sendCommandString('Alchemist, alchemy');
    if(target.name === 'Smith')     this.colyseusGame.sendCommandString('Smith, metalwork');
    if(target.name === 'Zarn')      this.colyseusGame.sendCommandString('Zarn, spellforge');
  }

}
