import { Component, Input } from '@angular/core';
import { Player } from '../../../models/player';

@Component({
  selector: 'app-character-tagline',
  template: `{{ player.name }} the {{ player.ageString }} level {{ player.level }} {{ player.baseClass }}`
})
export class PlayerTaglineComponent {
  
  @Input()
  public player: Player = new Player({});
}
