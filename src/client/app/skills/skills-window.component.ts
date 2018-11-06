import { Component, Input } from '@angular/core';

import { SkillNames } from './skill-names';
import { IPlayer } from '../../../shared/interfaces/character';

@Component({
  selector: 'app-skills-window',
  templateUrl: './skills-window.component.html',
  styleUrls: ['./skills-window.component.scss']
})
export class SkillsWindowComponent {

  @Input()
  public currentPlayer: IPlayer;

  constructor() { }

  getSkillName(skill) {
    if(!this.currentPlayer) return '';

    const level = this.currentPlayer.calcBaseSkillLevel(skill);
    return `${SkillNames.getName(level, skill)} (${level})`;
  }

}
