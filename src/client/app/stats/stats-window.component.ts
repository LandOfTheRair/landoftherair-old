import { Component, Input } from '@angular/core';
import { Player } from '../../../shared/models/player';

@Component({
  selector: 'app-stats-window',
  templateUrl: './stats-window.component.html',
  styleUrls: ['./stats-window.component.scss']
})
export class StatsWindowComponent {

  @Input()
  public currentPlayer: Player = new Player({});

  get stats(): any {
    return (<any>this.currentPlayer).totalStats;
  }

  constructor() { }

}
