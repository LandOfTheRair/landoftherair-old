import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent {

  public shopSlots = Array(25).fill(null).map((x, i) => i);
  public buybackSlots = Array(5).fill(null).map((x, i) => i);

  constructor(public colyseusGame: ColyseusGameService) { }

}
