import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NPC } from '../../../shared/models/npc';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-npc-card',
  template: `
    <div class="char-card">
      
      <div class="char-left-container">

        <div class="char-health d-flex justify-content-center" [ngClass]="[barClass(npc)]">
          <app-life-heart [target]="npc"></app-life-heart>
        </div>

        <div class="char-direction vertical-center">
          {{ directionTo(npc) }}
        </div>
      </div>

      <div class="char-middle">

        <div class="effect-container"
             [class.animate]="effect"
             [ngClass]="[effect]"></div>

        <div class="char-target" *ngIf="npc.uuid === colyseusGame.currentTarget">
          <div class="outer circle"></div>
          <div class="middle circle"></div>
          <div class="inner circle"></div>
          <div class="innermost circle"></div>
        </div>

        <div class="char-title" [ngClass]="[barClass(npc)]">
          <div class="char-name">
            {{ npc.name }}
          </div>

        </div>

        <div class="char-gear">
          <div class="gear-item right">
            <app-item size="xsmall" [showDesc]="false" [showEncrust]="false" [item]="npc.rightHand"></app-item>
          </div>
          <div class="gear-item armor">
            <app-item size="xsmall" [showDesc]="false" [showEncrust]="false" [item]="npcArmorItem(npc)"></app-item>
          </div>
          <div class="gear-item left">
            <app-item size="xsmall" [showDesc]="false" [showEncrust]="false" [item]="npc.leftHand"></app-item>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`    
  .char-card {
    display: flex;
    flex-direction: row;
    max-height: 50px;
    margin-top: 4px;
    position: relative;
  }

  .char-target {
    position: absolute;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-content: center;
  }
  
  .circle {
    position: absolute;
    border-radius: 50%;
    border: 1px solid #000;
    left: 0;
    right: 0;
    margin: auto;
  
    top: 50%;
    transform: translateY(-50%);
    z-index: 650;
  }
  
  .circle.outer {
     width: 24px;
     height: 24px;
     background-color: #b20000;
  }
  
  .circle.middle {
     width: 18px;
     height: 18px;
     background-color: #fff;
  }
  
  .circle.inner {
     width: 12px;
     height: 12px;
     background-color: #b20000;
  }
  
  .circle.innermost {
     width: 6px;
     height: 6px;
     background-color: #fff;
  }
  
  .char-left-container {
    width: 20px;
    max-width: 20px;
    margin-left: 2px;
    margin-top: 2px;
  }
  
  .char-health {
    border: 1px solid #000;
    border-right: none;
    border-bottom: none;
    min-height: 17px;
    max-height: 17px;
  }
  
  .char-direction {
    border: 1px solid #000;
    border-right: none;
    max-height: 18px;
    font-weight: bold;
  }
  
  .friendly {
    background-color: #003a00;
    color: white;
  }
  
  .hostile {
    background-color: #b20000;
    color: white;
  }
  
  .neutral {
    background-color: #bbb;
    color: black;
  }
  
  .char-middle {
    max-width: 120px;
    max-height: 50px;
    
    position: relative;
  
    display: flex;
    flex-direction: column;
  
    border: 1px solid #000;
    border-left: none;
  
    margin-top: 2px;
  
    cursor: cell;
  }
  
  .char-title {
    height: 18px;
  }
  
  .char-name {
    user-select: none;
    padding-left: 2px;
    padding-right: 2px;
    font-size: 0.9rem;
    letter-spacing: 2px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: clip;
    max-width: 96px;
    line-height: 16px;
    min-height: 17px;
    max-height: 17px;
  
  }
  
  .char-gear {
    display: flex;
    flex-direction: row;
  }
  
  .gear-item {
    width: 32px !important;
    height: 32px !important;
    outline: 1px solid #000;
    background: #b7b19e;
    background: linear-gradient(135deg, #b7b19e 0%, #777466 65%, #36332c 100%);
  }
  
  .effect-container {
    z-index: 25;
    width: 100%;
    height: calc(100% + 3px);
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
  }

  .animate.hit-min {
    animation: hit-min 500ms ease-out alternate;
  }

  @keyframes hit-min {
    0% {
      box-shadow: inset 0 0 10px #f00;
    }
    100% {
      box-shadow: inset 0 0 30px #e00;
    }
  }

  .animate.hit-mid {
    animation: hit-mid 500ms ease-out alternate;
  }

  @keyframes hit-mid {
    0% {
      box-shadow: inset 0 0 10px #900;
    }
    100% {
      box-shadow: inset 0 0 50px #800;
    }
  }

  .animate.hit-max {
    animation: hit-max 500ms ease-out alternate;
  }

  @keyframes hit-max {
    0% {
      box-shadow: inset 0 0 10px #400;
    }
    100% {
      box-shadow: inset 0 0 80px #300;
    }
  }

  .animate.block-dodge, .animate.block-miss {
    animation: block-soft 500ms ease-out alternate;
  }

  @keyframes block-soft {
    0% {
      box-shadow: inset 0 0 10px #ddd;
    }
    100% {
      box-shadow: inset 0 0 50px #ccc;
    }
  }

  .animate.block-armor, .animate.block-weapon, .animate.block-shield, .animate.block-offhand {
    animation: block-hard 500ms ease-out alternate;
  }
  
  @keyframes block-hard {
    0% {
      box-shadow: inset 0 0 10px #aaa;
    }
    100% {
      box-shadow: inset 0 0 80px #888;
    }
  }

  .animate.hit-magic, .animate.hit-buff {
    animation: hit-magic 500ms ease-out alternate;
  }

  @keyframes hit-magic {
    0% {
      box-shadow: inset 0 0 10px #00f;
    }
    100% {
      box-shadow: inset 0 0 60px #00a;
    }
  }

  .animate.hit-heal {
    animation: hit-heal 500ms ease-out alternate;
  }

  @keyframes hit-heal {
    0% {
      box-shadow: inset 0 0 10px #0f0;
    }
    100% {
      box-shadow: inset 0 0 60px #0a0;
    }
  }
  `]
})
export class NpcCardComponent implements OnInit, OnDestroy {
  @Input()
  public npc: NPC;

  public effect = '';
  private cfx$: any;

  constructor(public colyseusGame: ColyseusGameService) {}

  ngOnInit() {
    this.cfx$ = this.colyseusGame.cfx$.subscribe(({ enemyUUID, effect }) => {
      if(enemyUUID !== this.npc.uuid) return;

      this.effect = effect;
      setTimeout(() => {
        this.effect = '';
      }, 900);
    });
  }

  ngOnDestroy() {
    this.cfx$.unsubscribe();
  }

  public npcArmorItem(npc: NPC) {
    return npc.gear.Robe2 || npc.gear.Robe1 || npc.gear.Armor;
  }

  public directionTo(npc: NPC) {
    return this.colyseusGame.directionTo(npc);
  }

  public barClass(npc: NPC) {
    return this.colyseusGame.hostilityLevelFor(npc);
  }
}
