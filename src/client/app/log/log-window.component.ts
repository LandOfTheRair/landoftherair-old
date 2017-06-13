import { Component, Input } from '@angular/core';
import { ClientGameState } from '../clientgamestate';

@Component({
  selector: 'app-log-window',
  templateUrl: './log-window.component.html',
  styleUrls: ['./log-window.component.scss']
})
export class LogWindowComponent {

  @Input()
  public clientGameState: ClientGameState = new ClientGameState({});

  @Input()
  public windowSize;

  @Input()
  public fontSize;

  constructor() { }

}
