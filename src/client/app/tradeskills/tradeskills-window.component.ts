import { Component, Input } from '@angular/core';

import { SkillNames } from './skill-names';
import { IPlayer } from '../../../shared/interfaces/character';

@Component({
  selector: 'app-tradeskills-window',
  templateUrl: './tradeskills-window.component.html',
  styleUrls: ['./tradeskills-window.component.scss']
})
export class TradeSkillsWindowComponent {

  @Input()
  public currentPlayer: IPlayer;

  constructor() { }

  getSkillName(skill) {
    if(!this.currentPlayer) return '';

    const level = this.currentPlayer.calcBaseSkillLevel(skill);
    return `${SkillNames.getName(level, skill)} (${level})`;
  }

}
