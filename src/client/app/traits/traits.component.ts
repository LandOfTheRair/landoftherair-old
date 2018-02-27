import { Component, OnInit } from '@angular/core';

import { values, startCase } from 'lodash';

import { ColyseusGameService } from '../colyseus.game.service';

import { AllTraits } from '../../../shared/traits/trait-hash';

@Component({
  selector: 'app-traits',
  templateUrl: './traits.component.html',
  styleUrls: ['./traits.component.scss']
})
export class TraitsComponent implements OnInit {

  public activeTraitCategory: string;

  get player() {
    return this.colyseusGame.character;
  }

  get traitCategories(): string[] {
    if(this.player.baseClass === 'Undecided') return ['Basic', 'Combat', 'Party'];

    return ['Basic', 'Combat', 'Class', 'Party'];
  }

  private get realCategory() {
    if(this.activeTraitCategory === 'Class') return this.player.baseClass;
    return this.activeTraitCategory;
  }

  get currentTraitSet() {
    return values(AllTraits[this.realCategory]);
  }

  constructor(private colyseusGame: ColyseusGameService) { }

  ngOnInit() {
    if(!this.activeTraitCategory) this.activeTraitCategory = 'Basic';
  }

  public fixName(name: string): string {
    return startCase(name);
  }

  public buy(traitName: string): void {
    this.colyseusGame.sendRawCommand(`~trait`, `${this.realCategory} ${traitName}`);
  }

}
