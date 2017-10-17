import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import { compact, find, pull, findIndex } from 'lodash';
import { NPC } from '../../../shared/models/npc';
import { MacroService } from '../macros.service';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-npcs',
  templateUrl: './npcs.component.html',
  styleUrls: ['./npcs.component.scss']
})
export class NpcsComponent implements OnInit, OnDestroy {

  private pinOption$: any;

  private shouldPin: boolean;

  private pinUUID: string;
  private pinPos: number;

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
  }

  ngOnDestroy() {
    this.pinOption$.unsubscribe();
  }

  public visibleNPCS() {
    const fov = this.colyseusGame.character.$fov;
    const npcs: any[] = this.colyseusGame.clientGameState.allCharacters;

    if(!fov) return [];
    const me = this.colyseusGame.character;

    const unsorted = compact(npcs.map(npc => {
      if((<any>npc).username === me.username) return false;
      if(npc.dir === 'C') return false;
      if(!me.canSeeThroughStealthOf(npc)) return false;
      const diffX = npc.x - me.x;
      const diffY = npc.y - me.y;

      if(!fov[diffX]) return false;
      if(!fov[diffX][diffY]) return false;
      return npc;
    }));

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

  public npcArmorItem(npc: NPC) {
    return npc.gear.Robe2 || npc.gear.Robe1 || npc.gear.Armor;
  }

  public directionTo(npc: NPC) {
    return this.colyseusGame.directionTo(npc);
  }

  public barClass(npc: NPC) {
    return this.colyseusGame.hostilityLevelFor(npc);
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

}
