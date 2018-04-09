import { Component, OnInit } from '@angular/core';

import { startCase } from 'lodash';

import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-traits',
  templateUrl: './traits.component.html',
  styleUrls: ['./traits.component.scss']
})
export class TraitsComponent implements OnInit {

  get canSeeTree(): boolean {
    return this.player.baseClass !== 'Undecided';
  }

  get player() {
    return this.colyseusGame.character;
  }

  constructor(private colyseusGame: ColyseusGameService) { }

  ngOnInit() {
  }

  public fixName(name: string): string {
    return startCase(name);
  }

  public buy(traitName: string): void {
    // this.colyseusGame.sendRawCommand(`~trait`, `${this.realCategory} ${traitName}`);
  }

}
