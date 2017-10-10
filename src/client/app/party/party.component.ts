import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent {

  constructor(
    public colyseusGame: ColyseusGameService
  ) { }

  locationFor(character) {
    if(character.username === this.colyseusGame.character.username) return '✧';
    if(character.map !== this.colyseusGame.character.map)           return character.map;

    const dir = this.colyseusGame.directionTo(character);
    const distance = this.colyseusGame.distanceTo(character);

    if(distance === 0) return '✧';

    return `${distance} ${dir}`;
  }
}
