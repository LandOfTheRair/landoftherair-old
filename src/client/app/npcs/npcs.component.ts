import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import { compact } from 'lodash';
import { Character } from '../../../models/character';
import { NPC } from '../../../models/npc';

@Component({
  selector: 'app-npcs',
  templateUrl: './npcs.component.html',
  styleUrls: ['./npcs.component.scss']
})
export class NpcsComponent {

  constructor(private colyseusGame: ColyseusGameService) { }

  public visibleNPCS() {
    const fov = this.colyseusGame.character.$fov;
    const npcs: Character[] = (<Character[]>this.colyseusGame.clientGameState.mapNPCs)
                                    .concat(this.colyseusGame.clientGameState.players);

    if(!fov) return [];
    const me = this.colyseusGame.character;

    return compact(npcs.map(npc => {
      if((<any>npc).username === me.username) return false;
      const diffX = npc.x - me.x;
      const diffY = npc.y - me.y - 1;

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
    const diffY = npc.y - me.y - 1;

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
    const me = this.colyseusGame.character;

    if(npc.hostility === 'Never') return 'friendly';
    if(npc.hostility === 'Always' || npc.agro[me.username]) return 'angry';
    return 'neutral';
  }

  public doAction(npc: NPC) {
    this.colyseusGame.sendCommandString(`${npc.uuid}, hello`);
  }

}
