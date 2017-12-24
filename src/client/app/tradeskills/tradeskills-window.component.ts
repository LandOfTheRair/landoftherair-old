import { Component, Input } from '@angular/core';
import { Player } from '../../../shared/models/player';

import { SkillNames } from './skill-names';

@Component({
  selector: 'app-tradeskills-window',
  templateUrl: './tradeskills-window.component.html',
  styleUrls: ['./tradeskills-window.component.scss']
})
export class TradeSkillsWindowComponent {

  @Input()
  public currentPlayer: Player = new Player({});

  constructor() { }

  getSkillName(skill) {
    const level = this.currentPlayer.calcSkillLevel(skill);
    return `${SkillNames.getName(level, skill)} (${level})`;
  }

}
