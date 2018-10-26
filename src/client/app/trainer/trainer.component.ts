import * as swal from 'sweetalert2';

import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

const classTrainerInfo = {
  Mage: `The Mage excels at magical combat, and can focus on elemental or energy damage to best destroy its foes. It can specialize in the following ways:
  <br><br>
  <strong>Protector</strong>: Learn strong spells to buff allies physically, or protect them from elemental harm.
  <br><br>
  <strong>Elementalist</strong>: Learn fire and ice spells to inflict a variety of status ailments on foes.
  <br><br>
  <strong>Battlemage</strong>: Take to the field and do physical combat, learning all sorts of spellsword-like skills.
  `,
  Thief: `The Thief excels in sneaking around and fighting stealthily. It has many ways to approach combat that are atypical. It can specialize in the following ways:
  <br><br>
  <strong>Ninja</strong>: Focus on stealth, creating darkness, and melding with the shadows.
  <br><br>
  <strong>Rogue</strong>: Emphasize setting traps for unsuspecting foes, lockpicking, and increasing gold gain.
  <br><br>
  <strong>Assassin</strong>: Enhance deadly arts, such as applying poison to its weapon, inflicting it directly upon foes, or backstabbing them.
  `,
  Healer: `The Healer excels in the restorative arts, but is also capable of using the dark arts to damage foes. It can specialize in the following ways:
  <br><br>
  <strong>Druid</strong>: Focus on debuffing foes and summoning nature spirits to aid in combat.
  <br><br>
  <strong>Bard</strong>: Learn and enhance support skills to aid allies in combat.
  <br><br>
  <strong>Diviner</strong>: Enhance and learn magical attacks to bring down foes using the dark arts and fire arts.
  `,
  Warrior: `The Warrior excels in physical combat: both dealing and taking damage. It can specialize in the following ways:
  <br><br>
  <strong>Duelist</strong>: Focus on dual-wielding weapons and taking stances to change between combat styles.
  <br><br>
  <strong>Monk</strong>: Focus on using your fists to approach combat using martial skills.
  <br><br>
  <strong>Paladin</strong>: Focus on dealing more damage, increasing the number of targets you can hit, and gaining holy protection.
  `
};

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

    const curClass = this.colyseusGame.showTrainer.classTrain;

    (<any>swal)({
      titleText: `Join ${curClass} Brotherhood`,
      html: `${classTrainerInfo[curClass]}
      <br><br>
      Are you sure you wish to join the ${curClass} brotherhood? This decision is permanent!`,
      showCancelButton: true,
      confirmButtonText: `Yes, become a ${curClass}!`,
      type: 'warning'
    }).then(() => {
      this.colyseusGame.join();
    }).catch(() => {});
  }

}
