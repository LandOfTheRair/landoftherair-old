import { Component, Input } from '@angular/core';
import { ClientGameState } from '../../../models/clientgamestate';

@Component({
  selector: 'app-log-window',
  templateUrl: './log-window.component.html',
  styleUrls: ['./log-window.component.scss']
})
export class LogWindowComponent {

  @Input()
  public clientGameState: ClientGameState = new ClientGameState({});

  constructor() { }

}
