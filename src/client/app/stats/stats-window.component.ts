import { Component, Input } from '@angular/core';
import { IPlayer } from '../../../shared/interfaces/character';

@Component({
  selector: 'app-stats-window',
  templateUrl: './stats-window.component.html',
  styleUrls: ['./stats-window.component.scss']
})
export class StatsWindowComponent {

  @Input()
  public currentPlayer: IPlayer;

  get stats(): any {
    if(!this.currentPlayer) return {};
    return (<any>this.currentPlayer).totalStats;
  }

  get baseStats(): any {
    if(!this.currentPlayer) return {};
    return (<any>this.currentPlayer).stats;
  }

  constructor() { }

}
