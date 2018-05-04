import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';
import { HttpClient } from '@angular/common/http';

import { reject } from 'lodash';

import debounce from 'debounce-decorator';
import { Observable } from 'rxjs/Rx';
import { EquippableItemClasses, WeaponClasses } from '../../../shared/models/item';
import { MarketCalculatorHelper } from '../../../shared/helpers/market-calculator-helper';
import * as swal from 'sweetalert2';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-market-board',
  templateUrl: './market-board.component.html',
  styleUrls: ['./market-board.component.scss']
})
export class MarketBoardComponent implements OnInit, OnDestroy {

  @ViewChild('marketBuy')
  public marketBuy;

  @ViewChild('marketSell')
  public marketSell;

  @ViewChild('marketListings')
  public marketListings;

  @ViewChild('marketPickup')
  public marketPickup;

  public activeTab = 'Buy';
  public tabs = ['Buy', 'Sell', 'My Listings', 'Pick Up'];

  public isLoading: boolean;
  public isError: boolean;

  // for buying
  public buyableItemListings: any[] = [];
  public searchText = '';

  // for sell
  public sellValue = 0;

  // for my listings
  public myListings: any[] = [];

  private marketBoardRemoveId$: Subscription;

  public sortOptions = [
    { name: 'Most Recent',        sort: { 'listingInfo.listedAt': -1 } },
    { name: 'Least Recent',       sort: { 'listingInfo.listedAt': 1 } },
    { name: 'Price: Low to High', sort: { 'listingInfo.price': 1 } },
    { name: 'Price: High to Low', sort: { 'listingInfo.price': -1 } }
  ];

  public filterTags: Array<{ name: string, includedTypes: string[], isIncluded?: boolean }> = [
    { name: 'Bottles',        includedTypes: ['Bottle'] },
    { name: 'Food',           includedTypes: ['Food'] },
    { name: 'Gear',           includedTypes: EquippableItemClasses },
    { name: 'Gems',           includedTypes: ['Gem'] },
    { name: 'Misc',           includedTypes: ['Box', 'Book', 'Skull', 'Key'] },
    { name: 'Reagents',       includedTypes: ['Flower', 'Rock'] },
    { name: 'Rings',          includedTypes: ['Ring'] },
    { name: 'Scrolls',        includedTypes: ['Scroll'] },
    { name: 'Traps',          includedTypes: ['Trap'] },
    { name: 'Weapons',        includedTypes: WeaponClasses }
  ];

  public currentSort: any;

  get player() {
    return this.colyseusGame.character;
  }

  get currentTab() {
    switch(this.activeTab) {
      case 'Buy':           return this.marketBuy;
      case 'Sell':          return this.marketSell;
      case 'My Listings':   return this.marketListings;
      case 'Pick Up':       return this.marketPickup;
    }
  }

  get listingFeeRate() {
    return `${Math.floor(MarketCalculatorHelper.getListingFeeForRegion(this.colyseusGame.showMarketBoard.mapRegion) * 100)}%`;
  }

  get listingFee() {
    return MarketCalculatorHelper.calculateListingCostForRegion(this.sellValue, this.colyseusGame.showMarketBoard.mapRegion);
  }

  get sellError() {
    // recently initialized, no need to show an error from the onset (but show an empty string because it also isn't ready)
    if(this.sellValue === 0) return ' ';
    return MarketCalculatorHelper.itemListError(this.player, this.colyseusGame.showMarketBoard.mapRegion, this.player.rightHand, this.sellValue);
  }

  constructor(public colyseusGame: ColyseusGameService, private http: HttpClient) { }

  ngOnInit() {
    this.switchTab('Buy');
    this.marketBoardRemoveId$ = this.colyseusGame.marketboardRemove$.subscribe((listingId) => {
      this.buyableItemListings = reject(this.buyableItemListings, listing => listing._id === listingId);
      this.myListings = reject(this.myListings, listing => listing._id === listingId);
    });
  }

  ngOnDestroy() {
    this.marketBoardRemoveId$.unsubscribe();
  }

  switchTab(newTab) {
    this.activeTab = newTab;

    if(newTab === 'Buy') {
      this.changeSort(this.sortOptions[0].sort);
      this.loadBuyOptions();
    }

    if(newTab === 'My Listings') {
      this.loadMyListings();
    }
  }

  public changeSort(sort) {
    this.currentSort = sort;
    this.loadBuyOptions();
  }

  public toggleFilter(filter) {
    filter.isIncluded = !filter.isIncluded;
    this.loadBuyOptions();
  }

  @debounce(500)
  public changeSearchText() {
    this.loadBuyOptions();
  }

  private loadBuyOptions() {

    this.isError = false;
    this.isLoading = true;

    const searchParams: any = { search: {} };

    if(this.searchText) {
      searchParams.search.itemId = this.searchText;
    }

    if(this.currentSort) {
      searchParams.sort = this.currentSort;
    }

    const includedFilters = this.filterTags.filter(x => x.isIncluded);
    if(includedFilters.length > 0) {
      searchParams.filter = includedFilters.reduce((prev, cur) => {
        prev.push(...cur.includedTypes);
        return prev;
      }, []);
    }

    this.http.post('api/market/all', searchParams)
      .catch(() => {
        this.isLoading = false;
        this.isError = true;
        this.buyableItemListings = [];
        return Observable.empty();
      })
      .subscribe((data: any[]) => {
        this.isLoading = false;
        this.buyableItemListings = data;
      });
  }

  private loadMyListings() {

    this.isError = false;
    this.isLoading = true;

    this.http.post('api/market/mine', { username: this.player.username })
      .catch(() => {
        this.isLoading = false;
        this.isError = true;
        this.myListings = [];
        return Observable.empty();
      })
      .subscribe((data: any[]) => {
        this.isLoading = false;
        this.myListings = data;
      });
  }

  public starTextFor(itemListing) {
    const quality = itemListing.itemInfo.quality;
    return quality - 2 > 0 ? Array(quality - 2).fill('★').join('') : '';
  }

  list() {
    this.colyseusGame.sendRawCommand('listmarketitem', `${this.colyseusGame.showMarketBoard.uuid} ${this.sellValue}`);
  }

  buy(listing: any) {
    (<any>swal)({
      titleText: 'Buy Item',
      text: `Are you sure you want to buy ${listing.itemId} ${this.starTextFor(listing)} for ${listing.listingInfo.price.toLocaleString()} gold?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, buy it!',
      type: 'warning'
    }).then(() => {
      this.colyseusGame.sendRawCommand('buymarketitem', `${this.colyseusGame.showMarketBoard.uuid} ${listing._id}`);
    }).catch(() => {});
  }

  cancel(listing: any) {
    (<any>swal)({
      titleText: 'Cancel Item Listing',
      text: `Are you sure you want to CANCEL the listing for ${listing.itemId} ${this.starTextFor(listing)}? Your listing fee will not be refunded.`,
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      type: 'warning'
    }).then(() => {
      this.colyseusGame.sendRawCommand('buymarketitem', `${this.colyseusGame.showMarketBoard.uuid} ${listing._id}`);
    }).catch(() => {});
  }
}
