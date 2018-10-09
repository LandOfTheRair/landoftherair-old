
import { Component, AfterViewInit, ViewChild, OnDestroy, OnInit } from '@angular/core';

import { startCase, merge, last, includes } from 'lodash';

import { AllTrees } from '../../../shared/generated/skilltrees';

import { ColyseusGameService } from '../colyseus.game.service';

import { Subscription } from 'rxjs';
import { AssetService } from '../asset.service';

import { D3SkillTree, D3SkillTreeConfig } from './d3skilltree';

const defaultConfig = {
  maxWidth: 1000,
  maxHeight: 1000,
  clusterSize: 750,

  force: {
    root:       -20,
    unbuyable:  -20,
    capstone:   -30,
    normal:     -50
  },

  strength: {
    min: 0,
    max: 0.00005
  },

  radiusCollisionRangeExtension: 15,
  alphaDecay: 0.01
};

const AllConfigs: { [key: string]: D3SkillTreeConfig } = {
  Mage: merge({}, defaultConfig, { }),
  Thief: merge({}, defaultConfig, { }),
  Healer: merge({}, defaultConfig, { force: { root: -30 } }),
  Warrior: merge({}, defaultConfig, { })
};

@Component({
  selector: 'app-traits',
  templateUrl: './traits.component.html',
  styleUrls: ['./traits.component.scss']
})
export class TraitsComponent implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild('container')
  private d3container;

  @ViewChild('tooltip')
  private d3tooltip;

  private treeInstance: D3SkillTree;

  private ttHover$: Subscription;
  private skillTree$: Subscription;

  public ttData: any = {};
  public skillTree: any = {};

  get canSeeTree(): boolean {
    if(!this.player) return false;
    return this.player.baseClass !== 'Undecided';
  }

  get player() {
    return this.colyseusGame.character;
  }

  constructor(private colyseusGame: ColyseusGameService, private assetsService: AssetService) { }

  ngOnInit() {
    this.colyseusGame.requestSkillTree();
  }

  ngAfterViewInit() {
    if(!this.d3container || !this.player) return;

    this.treeInstance = new D3SkillTree(
      this.d3container.nativeElement,
      this.d3tooltip.nativeElement,
      this.colyseusGame,
      this.assetsService.assetUrl,
      AllTrees[this.player.baseClass].default,
      AllConfigs[this.player.baseClass]
    );

    this.ttHover$ = this.treeInstance.onHover.subscribe(data => {
      this.ttData = data;
    });

    this.skillTree$ = this.colyseusGame.skillTree$.subscribe(data => {
      this.skillTree = data;
      this.treeInstance.skillTree = this.skillTree;
    });

  }

  ngOnDestroy() {
    if(this.treeInstance) this.treeInstance.cleanup();
    if(this.ttHover$)   this.ttHover$.unsubscribe();
    if(this.skillTree$) this.skillTree$.unsubscribe();
  }

  public fixName(name: string): string {
    if(!name) return name;

    if(!isNaN(+last(name.split('')))) {
      name = name.substring(0, name.length - 1);
    }

    return startCase(name);
  }

  public fixDesc(desc: string, isCapstone: boolean): string {
    if(!includes(desc, '$')) return desc;
    const split = desc.split('$');

    const target = split[1];

    split[1] = target.split('|')[isCapstone ? 1 : 0];
    return split.join('');
  }

}
