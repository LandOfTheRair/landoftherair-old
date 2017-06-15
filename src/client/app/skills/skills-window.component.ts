import { Component, Input } from '@angular/core';
import { Player } from '../../../models/player';

@Component({
  selector: 'app-skills-window',
  templateUrl: './skills-window.component.html',
  styleUrls: ['./skills-window.component.scss']
})
export class SkillsWindowComponent {

  @Input()
  public currentPlayer: Player = new Player({});

  constructor() { }

}
