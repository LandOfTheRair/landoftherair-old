
import * as swal from 'sweetalert2';
import * as d3 from 'd3';
import { Subject } from 'rxjs';
import { startCase, extend, values, minBy, maxBy, last, includes } from 'lodash';

import { SkillTree } from '../../../shared/models/skill-tree';
import { ColyseusGameService } from '../colyseus.game.service';

export interface D3SkillTreeConfig {
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

export class D3SkillTree implements D3SkillTreeConfig {

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

  private svgNodeList: any;

  private _skillTree: SkillTree;

  public set skillTree(val: SkillTree) {
    this._skillTree = val;
    this.updateSVGNodes();
  }

  public get skillTree(): SkillTree {
    return this._skillTree;
  }

  constructor(
    private element: HTMLElement,
    private ttElement: HTMLElement,
    private colyseusGame: ColyseusGameService,
    private assetUrl: string,
    private tree: any,
    opts: D3SkillTreeConfig
  ) {
    extend(this, opts);
    this.init();
  }

  public cleanup() {
    d3.select('svg').remove();
    this.simulation.stop();
  }

  private fixName(name: string): string {
    if(!name) return name;

    if(!isNaN(+last(name.split('')))) {
      name = name.substring(0, name.length - 1);
    }

    return startCase(name);
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
      y: this.maxHeight / 2,
      currentNode: 0,
      totalNodes: 0
    };

    for(let i = minCluster; i <= maxCluster; i++) {
      const RADIAL_LOCATION = (i - minCluster + 1) / (maxCluster - minCluster + 1) * 2 * Math.PI;

      this.clusters[i] = {
        cluster: i,
        radius: this.clusterSize,
        x: (Math.cos(RADIAL_LOCATION) * (this.clusterSize / 2)) + this.maxWidth / 2,
        y: (Math.sin(RADIAL_LOCATION) * (this.clusterSize / 2)) + this.maxHeight / 2,
        currentNode: 0,
        totalNodes: 0
      };
    }

    values(this.tree).forEach(node => {
      const curNodeIndex = this.clusters[node.cluster].currentNode;
      node._index = curNodeIndex + 1;

      this.clusters[node.cluster].currentNode += 1;
      this.clusters[node.cluster].totalNodes += 1;
    });
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
      } else {
        const RADIAL_LOCATION = (node._index) / (this.clusters[node.cluster].totalNodes) * 2 * Math.PI;
        node.x = Math.cos(RADIAL_LOCATION) * (this.clusterSize / 4) + this.clusters[node.cluster].x;
        node.y = Math.sin(RADIAL_LOCATION) * (this.clusterSize / 4) + this.clusters[node.cluster].y;
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

  private getNodeFillColor(d) {
    if(d.unbuyable) return '#ddd';

    if(!this.skillTree) return '#555';

    if(this.skillTree.isAvailableToBuy(d.name)) return '#777';
    if(this.skillTree.isBought(d.name))         return '#aaa';

    return '#444';
  };

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
      .strength(1);

    const forceCharge = d3.forceManyBody()
      .strength(d => {
        let force = this.force.normal;
        if(d.root)       force = this.force.root;
        if(d.unbuyable)  force = this.force.unbuyable;
        if(d.capstone)   force = this.force.capstone;
        return force;
      });

    const forceCollide = d3.forceCollide()
      .radius(d => {
        return d.radius + this.radiusCollisionRangeExtension;
      })
      .strength(1);

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

    this.svgNodeList = this.svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.nodes)
      .enter()
        .append('circle')
        .attr('r', d => d.radius)
        .style('fill', this.getNodeFillColor)
        .style('stroke', d => d.iconColor)
        .style('stroke-width', '2px')

        .on('click', (d) => {

          if(this.skillTree.isBought(d.name)) {

            (<any>swal)({
              titleText: `Refund ${d.traitName ? 'Trait' : 'Skill'}: ${this.fixName(d.name)}`,
              text: `Are you sure you want to REFUND the trait ${this.fixName(d.name)} for 1 RP?`,
              type: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, REFUND it!'
            }).then(() => {
              this.colyseusGame.sendRawCommand('~trait', d.name);

            }).catch(() => {});

            return;
          }

          if(d.unbuyable) return;
          if(!this.skillTree.isAvailableToBuy(d.name)) return;

          let isUnderMPCost = false;
          if(includes(d.desc, 'Cost: ')) {
            const testStr = d.desc.substring(d.desc.indexOf('Cost:') + 6);
            const [cost, type] = testStr.split(' ');
            if(!isNaN(+cost) && includes(['HP', 'MP'], type)) {
              isUnderMPCost = this.colyseusGame.character[type.toLowerCase()].maximum <= +cost;
            }
          }

          (<any>swal)({
            titleText: `Buy ${d.traitName ? 'Trait' : 'Skill'}: ${this.fixName(d.name)}`,
            text: `Are you sure you want to buy the trait ${this.fixName(d.name)} for ${d.cost} ${d.isParty ? 'PP' : 'TP'}? 
            ${isUnderMPCost ? 'YOU MAY NOT BE ABLE TO CAST THIS SPELL CURRENTLY!' : ''}`,
            showCancelButton: true,
            confirmButtonText: 'Yes, buy it!'
          }).then(() => {
            this.colyseusGame.sendRawCommand('~trait', d.name);

          }).catch(() => {});
        })

        .on('mouseover', (d, i, nodes) => {

          this.onHover.next(d);

          if(this.skillTree.isAvailableToBuy(d.name)) {
            d3.select(nodes[i])
              .style('stroke-width', '5px')
              .style('fill', '#888');
          }

          tooltip
            .transition()
            .duration(200)
            .style('opacity', 0.9);

          tooltip
            .style('left', (d3.event.layerX - (tooltip.node().getBoundingClientRect().width / 2)) + 'px')
            .style('top', (d3.event.layerY + 30) + 'px');

          tooltip
            .attr('transform', d3.zoomTransform(tooltip.node()));
        })

        .on('mouseout', (d, i, nodes) => {

          if(this.skillTree.isAvailableToBuy(d.name)) {
            d3.select(nodes[i])
              .style('stroke-width', '1px')
              .style('fill', this.getNodeFillColor.bind(this));
          }

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
      this.svgNodeList
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

    for(let i = 0; i < n; ++i) {
      this.simulation.tick();
    }
  }

  private updateSVGNodes() {
    this.svgNodeList
      .style('fill', this.getNodeFillColor.bind(this));
  }

}
