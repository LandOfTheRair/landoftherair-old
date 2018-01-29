import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { includes, pull, difference, differenceBy, find, reject, pullAll } from 'lodash';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-ground',
  templateUrl: './ground.component.html',
  styleUrls: ['./ground.component.scss']
})
export class GroundComponent implements OnInit, OnDestroy {

  @Input()
  public size;

  private ground$: any;
  private player$: any;

  public selectedType: string;

  public itemTypes: string[] = [];
  public currentGround: any = {};
  private allGround: any = {};

  private oldX: number;
  private oldY: number;
  private player: any;

  constructor(public colyseusGame: ColyseusGameService) {}

  private getCurrentGround(ground) {
    const player = this.player;

    const xKey = `x${player.x}`;
    const yKey = `y${player.y}`;

    if(!ground[xKey]) ground[xKey] = {};
    if(!ground[xKey][yKey]) ground[xKey][yKey] = {};

    return ground[xKey][yKey];
  }

  private setCurrentGround() {
    const myNewGround = this.getCurrentGround(this.allGround);
    const myCurrentGround = this.currentGround;

    const newItemTypes = Object.keys(myNewGround);
    const oldItemTypes = Object.keys(myCurrentGround);
    const removeKeys = difference(newItemTypes, oldItemTypes).concat(difference(oldItemTypes, newItemTypes));
    removeKeys.forEach(key => delete myCurrentGround[key]);

    newItemTypes.forEach(newItemType => {
      const addObject = differenceBy(myNewGround[newItemType], myCurrentGround[newItemType], 'uuid');
      const removeObjects = differenceBy(myCurrentGround[newItemType], myNewGround[newItemType], 'uuid');

      addObject.forEach(addItem => {
        myCurrentGround[newItemType] = myCurrentGround[newItemType] || [];
        myCurrentGround[newItemType].push(addItem);
      });

      pullAll(myCurrentGround[newItemType], removeObjects);

    });

    if(myCurrentGround.Coin && myNewGround.Coin) {
      // myCurrentGround.Coin[0].value = myNewGround.Coin[0].value;
      myCurrentGround.Coin = [];
      myCurrentGround.Coin.push(...myNewGround.Coin);
    }
  }

  get allItemTypes() {
    const ground = this.currentGround;
    let sorted = Object.keys(ground).sort();
    if(includes(sorted, 'Coin')) {
      pull(sorted, 'Coin');
      sorted.unshift('Coin');
    }
    sorted = sorted.filter(type => ground[type].length > 0);
    return sorted;
  }

  private setGround(ground: any) {
    this.allGround = ground;
    this.updateGround();
  }

  private updatePlayer() {
    this.player = this.colyseusGame.character;

    if(this.player.x === this.oldX && this.player.y === this.oldY) return;
    this.oldX = this.player.x;
    this.oldY = this.player.y;
    this.updateGround();

  }

  private updateGround() {
    this.setCurrentGround();
    this.itemTypes = this.allItemTypes;
  }

  ngOnInit() {
    this.updatePlayer();
    this.player$ = this.colyseusGame.clientGameState.playerBoxes$.subscribe(() => this.updatePlayer());
    this.ground$ = this.colyseusGame.clientGameState.updateGround$.subscribe(ground => this.setGround(ground));
  }

  ngOnDestroy() {
    this.player$.unsubscribe();
    this.ground$.unsubscribe();
  }

}
