import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import { compact } from 'lodash';
import { NPC } from '../../../models/npc';
import { MacroService } from '../macros.service';

@Component({
  selector: 'app-npcs',
  templateUrl: './npcs.component.html',
  styleUrls: ['./npcs.component.scss']
})
export class NpcsComponent {

  constructor(private colyseusGame: ColyseusGameService, private macroService: MacroService) { }

  public visibleNPCS() {
    const fov = this.colyseusGame.character.$fov;
    const npcs: any[] = (<any[]>this.colyseusGame.clientGameState.mapNPCs).concat(this.colyseusGame.clientGameState.players);

    if(!fov) return [];
    const me = this.colyseusGame.character;

    return compact(npcs.map(npc => {
      if((<any>npc).username === me.username) return false;
      if(npc.dir === 'C') return false;
      const diffX = npc.x - me.x;
      const diffY = npc.y - me.y;

      if(!fov[diffX]) return false;
      if(!fov[diffX][diffY]) return false;
      return npc;
    }));
  }

  public npcArmorItem(npc: NPC) {
    return npc.gear.Robe2 || npc.gear.Robe1 || npc.gear.Armor;
  }

  public directionTo(npc: NPC) {
    const me = this.colyseusGame.character;
    const diffX = npc.x - me.x;
    const diffY = npc.y - me.y;

    if(diffX < 0 && diffY > 0) return '↙';
    if(diffX > 0 && diffY < 0) return '↗';
    if(diffX > 0 && diffY > 0) return '↘';
    if(diffX < 0 && diffY < 0) return '↖';

    if(diffX > 0)              return '→';
    if(diffY > 0)              return '↓';

    if(diffX < 0)              return '←';
    if(diffY < 0)              return '↑';

    return '✧';
  }

  public barClass(npc: NPC) {
    return this.colyseusGame.hostilityLevelFor(npc);
  }

  public doAction(npc: NPC, $event) {

    // always set target, but if you hold ctrl, don't do anything else
    this.colyseusGame.clientGameState.activeTarget = npc;
    if($event.ctrlKey) return;

    if(npc.hostility === 'Never') {
      this.colyseusGame.sendCommandString(`${npc.uuid}, hello`);
    } else if((<any>npc).username && !this.colyseusGame.currentCommand) {
      this.colyseusGame.currentCommand = `${npc.uuid}, `;
    } else if(this.colyseusGame.currentCommand) {
      this.colyseusGame.sendCommandString(this.colyseusGame.currentCommand, npc.uuid);
      this.colyseusGame.currentCommand = '';
    } else {
      this.colyseusGame.sendCommandString(this.macroService.activeMacro.macro, npc.uuid);
    }
  }

}
