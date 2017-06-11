import { Component, Input } from '@angular/core';
import { Player } from '../../../models/player';

@Component({
  selector: 'app-status-window',
  templateUrl: './status-window.component.html',
  styleUrls: ['./status-window.component.scss']
})
export class StatusWindowComponent {

  @Input()
  public player: Player = new Player({});

  constructor() { }

}
