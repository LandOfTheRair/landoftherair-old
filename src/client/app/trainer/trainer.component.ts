import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.scss']
})
export class TrainerComponent {

  selectedSkill: string;

  constructor(public colyseusGame: ColyseusGameService) { }

  train() {
    this.colyseusGame.train();
  }

  learn() {
    this.colyseusGame.learn();
  }

  assess() {
    this.colyseusGame.assessSkill(this.selectedSkill);
  }

  join() {
    this.colyseusGame.join();
  }

}
