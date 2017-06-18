import { Component, Input } from '@angular/core';
import { Player } from '../../../models/player';

import { SkillNames } from './skill-names';

@Component({
  selector: 'app-skills-window',
  templateUrl: './skills-window.component.html',
  styleUrls: ['./skills-window.component.scss']
})
export class SkillsWindowComponent {

  @Input()
  public currentPlayer: Player = new Player({});

  constructor() { }

  getSkillName(skill) {
    const level = this.currentPlayer.calcSkillLevel(skill);
    return `${SkillNames.getName(level, skill)} (${level})`;
  }

}
