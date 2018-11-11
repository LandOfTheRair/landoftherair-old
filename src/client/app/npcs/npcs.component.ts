import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import { compact, isNumber, sortBy, cloneDeep, isBoolean, maxBy } from 'lodash';
import { MacroService } from '../macros.service';
import { LocalStorageService } from 'ngx-webstorage';
import { timer } from 'rxjs';
import { INPC } from '../../../shared/interfaces/character';

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

  private previousPlacements: { [key: string]: number } = {};

  public visibleNPCList: INPC[] = [];

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

    this.timer$ = timer(0, 500)
      .subscribe(() => this.updateNPCList());

    this.move$ = this.colyseusGame.myLoc$.subscribe(() => this.updateNPCList());
  }

  ngOnDestroy() {
    this.pinOption$.unsubscribe();
    this.sortFriendly$.unsubscribe();
    this.sortDistance$.unsubscribe();
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

    let unsorted: any[] = compact(npcs.map(testnpc => {
      if((<any>testnpc).username === me.username) return false;
      if(testnpc.dir === 'C' || testnpc.hp.atMinimum()) return false;
      if(!me.canSeeThroughStealthOf(testnpc)) return false;
      const diffX = testnpc.x - me.x;
      const diffY = testnpc.y - me.y;

      if(!fov[diffX]) return false;
      if(!fov[diffX][diffY]) return false;
      return testnpc;
    }));

    if(unsorted.length === 0) return [];

    const shouldSortDistance = isBoolean(this.shouldSortDistance);
    const shouldSortFriendly = isBoolean(this.shouldSortFriendly);

    // iterate over unsorted, find their place, or find them a new place (only if we are doing no sorting)
    if(!shouldSortDistance && !shouldSortFriendly) {
      const highestOldSpace = this.previousPlacements[maxBy(Object.keys(this.previousPlacements), key => this.previousPlacements[key])];
      const oldPositionSorting = Array(highestOldSpace).fill(null);
      const newPositionHash = {};

      const unfilledSpaces = oldPositionSorting.reduce((prev, cur, idx) => {
        prev[idx] = null;
        return prev;
      }, {});

      const needFill = [];

      // sort old creatures into the array, and if they weren't there before, we mark them as filler
      for(let i = 0; i < unsorted.length; i++) {
        const creature = unsorted[i];

        const oldPos = this.previousPlacements[creature.uuid];
        if(isNumber(oldPos)) {
          oldPositionSorting[oldPos] = creature;
          delete unfilledSpaces[oldPos];
        } else {
          needFill.push(creature);
        }
      }

      // get all the filler spaces, and put the unsorted creatures into them
      const fillKeys = Object.keys(unfilledSpaces);

      for(let i = 0; i < needFill.length; i++) {
        const fillSpot = fillKeys.shift();
        if(fillSpot) {
          oldPositionSorting[+fillSpot] = needFill[i];
        } else {
          oldPositionSorting.push(needFill[i]);
        }
      }

      // create a new position hash
      for(let i = 0; i < oldPositionSorting.length; i++) {
        const creature = oldPositionSorting[i];
        if(!creature) continue;

        newPositionHash[creature.uuid] = i;
      }

      this.previousPlacements = newPositionHash;
      unsorted = oldPositionSorting;
    }

    // sort them by distance
    if(shouldSortDistance) {
      unsorted = sortBy(unsorted, testnpc => testnpc.distFrom(me));

      if(!this.shouldSortDistance) unsorted = unsorted.reverse();
    }

    // sort them by friendly
    if(shouldSortFriendly) {
      const sortOrder = this.shouldSortFriendly ? { neutral: 0, friendly: 1, hostile: 2 } : { hostile: 0, neutral: 1, friendly: 2 };
      unsorted = sortBy(unsorted, testnpc => sortOrder[this.colyseusGame.hostilityLevelFor(testnpc)]);
    }

    return unsorted;
  }

  public doAction(npc: INPC, $event, index) {

    // always set target, but if you hold ctrl, don't do anything else
    this.colyseusGame.clientGameState.activeTarget = npc;
    if($event.ctrlKey) return;

    this.pinUUID = npc.uuid;
    this.pinPos = index;

    if(npc.hostility === 'Never') {
      this.colyseusGame.sendCommandString(`${npc.uuid}, hello`);

    } else if((<any>npc).username && !this.colyseusGame.currentCommand && this.colyseusGame.hostilityLevelFor(npc) !== 'hostile') {
      this.colyseusGame.currentCommand = `#${npc.uuid}, `;

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

    const char = this.colyseusGame.character;
    if(char.rightHand && char.rightHand.name === 'Halloween Basket') {
      this.colyseusGame.sendCommandString(`${target.name}, trick or treat`);
      return;
    }

    if(target.name === 'Alchemist') this.colyseusGame.sendCommandString('Alchemist, alchemy');
    if(target.name === 'Smith')     this.colyseusGame.sendCommandString('Smith, metalwork');
    if(target.name === 'Zarn')      this.colyseusGame.sendCommandString('Zarn, spellforge');
  }

}
