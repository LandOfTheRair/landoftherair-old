
import { Component, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';

import { startCase, extend, merge, values, minBy, maxBy, last } from 'lodash';
import * as d3 from 'd3';

import { AllTrees } from '../../../shared/generated/skilltrees';

import { ColyseusGameService } from '../colyseus.game.service';

import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { AssetService } from '../asset.service';

interface D3SkillTreeConfig {
  maxWidth: number;
  maxHeight: number;
  clusterSize: number;

  force: {
    root: number,
    unbuyable: number,
    capstone: number,
    normal: number
  };

  strength: {
    min: number,
    max: number
  };

  radiusCollisionRangeExtension: number;
  alphaDecay: number;
}

const defaultConfig = {
  maxWidth: 1000,
  maxHeight: 1000,
  clusterSize: 750,

  force: {
    root:       -500,
    unbuyable:  -500,
    capstone:   -50,
    normal:     -100
  },

  strength: {
    min: 0,
    max: 0.00005
  },

  radiusCollisionRangeExtension: 15,
  alphaDecay: 0.01
};

const AllConfigs: { [key: string]: D3SkillTreeConfig } = {
  Mage: merge({}, defaultConfig, { })
};

@Component({
  selector: 'app-traits',
  templateUrl: './traits.component.html',
  styleUrls: ['./traits.component.scss']
})
export class TraitsComponent implements AfterViewInit, OnDestroy {

  @ViewChild('container')
  private d3container;

  @ViewChild('tooltip')
  private d3tooltip;

  private treeInstance: D3SkillTree;

  private ttHover$: Subscription;

  public ttData: any = {};

  get canSeeTree(): boolean {
    return this.player.baseClass !== 'Undecided';
  }

  get player() {
    return this.colyseusGame.character;
  }

  constructor(private colyseusGame: ColyseusGameService, private assetsService: AssetService) { }

  ngAfterViewInit() {
    if(!this.d3container) return;

    this.treeInstance = new D3SkillTree(
      this.d3container.nativeElement,
      this.d3tooltip.nativeElement,
      AllTrees[this.player.baseClass],
      AllConfigs[this.player.baseClass],
      this.assetsService.assetUrl
    );

    this.ttHover$ = this.treeInstance.onHover.subscribe(data => {
      this.ttData = data;
    });

  }

  ngOnDestroy() {
    this.treeInstance.cleanup();
    if(this.ttHover$) this.ttHover$.unsubscribe();
  }

  public fixName(name: string): string {
    if(!name) return name;

    if(!isNaN(+last(name.split('')))) {
      name = name.substring(0, name.length - 1);
    }
    return startCase(name);
  }

  public buy(traitName: string): void {
    // this.colyseusGame.sendRawCommand(`~trait`, `${this.realCategory} ${traitName}`);
  }

}

class D3SkillTree implements D3SkillTreeConfig {

  maxWidth: number;
  maxHeight: number;
  clusterSize: number;

  force: {
    root: number,
    unbuyable: number,
    capstone: number,
    normal: number
  };

  strength: {
    min: number,
    max: number
  };

  radiusCollisionRangeExtension: number;
  alphaDecay: number;

  public onHover = new Subject<any>();

  private clusters: any[] = [];
  private nodes: any[] = [];
  private links: any[] = [];

  private svg;
  private simulation;

  constructor(
    private element: HTMLElement,
    private ttElement: HTMLElement,
    private tree: any,
    opts: D3SkillTreeConfig,
    private assetUrl: string
  ) {
    extend(this, opts);
    this.init();
  }

  public cleanup() {
    d3.select('svg').remove();
    this.simulation.stop();
  }

  private init() {
    this.initClusters();
    this.initNodes();
    this.initLinks();
    this.initSVG();
  }

  private initClusters() {

    const minCluster = minBy(values(this.tree), node => node.cluster).cluster;
    const maxCluster = maxBy(values(this.tree), node => node.cluster).cluster;

    this.clusters[0] = {
      cluster: 0,
      radius: this.clusterSize,
      x: this.maxWidth / 2,
      y: this.maxHeight / 2
    };

    for(let i = minCluster; i <= maxCluster; i++) {
      const RADIAL_LOCATION = (i - minCluster + 1) / (maxCluster - minCluster + 1) * 2 * Math.PI;

      this.clusters[i] = {
        cluster: i,
        radius: this.clusterSize,
        x: (Math.cos(RADIAL_LOCATION) * (this.clusterSize / 2)) + this.maxWidth / 2,
        y: (Math.sin(RADIAL_LOCATION) * (this.clusterSize / 2)) + this.maxHeight / 2
      };
    }
  }

  private initNodes() {
    this.nodes = values(this.tree);

    this.nodes.forEach(node => {
      node.id = node.name;

      let radius = 15;
      if(node.capstone)  radius = 20;
      if(node.unbuyable) radius = 30;
      if(node.root)      radius = 40;

      node.radius = radius;
      node.iconColor = node.iconColor || '#111';

      if(node.root) {
        node.fx = node.x = this.clusters[node.cluster].x;
        node.fy = node.y = this.clusters[node.cluster].y;

      }
    });
  }

  private initLinks() {
    this.nodes.forEach(node => {
      if(!node.unlocks) return;

      node.unlocks.forEach(unlockNode => {
        this.links.push({
          source: node.name,
          target: unlockNode
        });
      });
    });
  }

  private initSVG() {

    const tooltip = d3.select(this.ttElement);

    const zoom = d3
      .zoom()
      .translateExtent([
        [-this.maxWidth * 0.5, -this.maxHeight * 0.5],
        [this.maxWidth, this.maxHeight]
      ])
      .scaleExtent([0.5, 5])
      .on('zoom', () => {
        this.svg.attr('transform', d3.event.transform);
      });

    const forceLink = d3
      .forceLink()
      .id(l => l.id)
      .strength(2);

    const forceCharge = d3.forceManyBody()
      .strength(d => {
        if(d.pushesHeavy)return -5000;
        if(d.root)       return this.force.root;
        if(d.unbuyable)  return this.force.unbuyable;
        if(d.capstone)   return this.force.capstone;
        return this.force.normal;
      });

    const forceCollide = d3.forceCollide()
      .radius(d => {
        return d.radius + this.radiusCollisionRangeExtension;
      }).iterations(8);

    const forceStrength = (force) => {
      return force.strength(d => d.unlocks ? this.strength.max : this.strength.min);
    };

    this.svg = d3
      .select(this.element)
      .append('svg')
      .attr('viewBox', '0 0 ' + this.maxWidth + ' ' + this.maxHeight)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .on('contextmenu', () => {
        d3.event.preventDefault();
      })
      .call(zoom)
      .append('g');

    this.simulation = d3.forceSimulation()
      .force('link', forceLink)
      .force('charge', forceCharge)
      .force('collide', forceCollide)
      .force('x', forceStrength(d3.forceX()))
      .force('y', forceStrength(d3.forceY()))
      .force('center', d3.forceCenter(this.maxWidth * 0.5, this.maxHeight * 0.5))
      .alphaDecay(this.alphaDecay);

    const link = this.svg
      .append('g')
      .style('stroke', '#aaa')
      .selectAll('line')
      .data(this.links)
      .enter()
        .append('line');

    const getNodeFillColor = (d) => {
      if(d.unbuyable) return '#ddd';
      return '#777';
      // return BOUGHT_SKILLS[d.name] ? '#aaa' : '#555';
    };

    const node = this.svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.nodes)
      .enter()
        .append('circle')
        .attr('r', d => d.radius)
        .style('fill', getNodeFillColor)
        .style('stroke', d => d.iconColor)
        .style('stroke-width', '2px')

        .on('click', (d, i, nodes) => {

          /*
          if(d.unbuyable
            || BOUGHT_SKILLS[d.name]
            || !CAN_BUY[d.name]) return;

          alert('Are you sure you want to buy ' + d.name + '?');

          buy(d.name);
          calculateCanBuy();
          */

          d3.select(nodes[i])
            .style('fill', getNodeFillColor);
        })

        .on('mouseover', (d, i, nodes) => {

          this.onHover.next(d);
          /*
          if(!BOUGHT_SKILLS[d.name]) {
            d3.select(nodes[i])
              .style('stroke-width', '5px')
              .style('fill', '#888');
          }
          */

          tooltip
            .transition()
            .duration(200)
            .style('opacity', 0.9);

          tooltip
            .style('left', (d3.event.layerX + 20) + 'px')
            .style('top', (d3.event.layerY - 20) + 'px');

          tooltip
            .attr('transform', d3.zoomTransform(tooltip.node()));
        })

        .on('mouseout', (d, i, nodes) => {

          /*
          if(!BOUGHT_SKILLS[d.name]) {
            d3.select(nodes[i])
              .style('stroke-width', '1px')
              .style('fill', updateNode);
          }
          */

          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        });

    const image = this.svg
      .append('g')
      .attr('class', 'labels')
      .selectAll('image')
      .data(this.nodes)
      .enter()
        .append('image')
        .attr('xlink:href', d => `${this.assetUrl}/icons/${d.icon}.svg`)
        .attr('width', d => d.radius)
        .attr('height', d => d.radius);

    const onTick = () => {

      // update node positions
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      // update link positions
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      // update label positions
      image
        .attr('x', d => d.x - d.radius / 2)
        .attr('y', d => d.y - d.radius / 2);

    };

    this.simulation
      .nodes(this.nodes)
      .on('tick', onTick);

    this.simulation
      .force('link')
      .links(this.links);

    const n = Math.ceil(
      Math.log(this.simulation.alphaMin()) / Math.log(1 - this.simulation.alphaDecay())
    );

    this.simulation.stop();

    for(let i = 0; i < n; ++i) {
      this.simulation.tick();
    }

    this.simulation.restart();
  }

}
