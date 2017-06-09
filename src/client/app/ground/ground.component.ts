import { Component, Input } from '@angular/core';
import { includes, pull } from 'lodash';

@Component({
  selector: 'app-ground',
  templateUrl: './ground.component.html',
  styleUrls: ['./ground.component.scss']
})
export class GroundComponent {

  @Input()
  public colyseusGame: any;

  public selectedType: string;

  get player() {
    return this.colyseusGame.character;
  }

  get currentGround() {
    const ground = this.colyseusGame.clientGameState.groundItems;
    const player = this.player;

    if(!ground[player.x]) return [];
    if(!ground[player.x][player.y]) return [];

    return ground[player.x][player.y];
  }

  get itemTypes() {
    const ground = this.currentGround;
    let sorted = Object.keys(ground).sort();
    if(includes(sorted, 'Coin')) {
      pull(sorted, 'Coin');
      sorted.unshift('Coin');
    }
    sorted = sorted.filter(type => ground[type].length > 0);
    return sorted;
  }

}
