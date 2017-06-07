import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ground',
  templateUrl: './ground.component.html',
  styleUrls: ['./ground.component.scss']
})
export class GroundComponent {

  @Input()
  public colyseusGame: any;

}
