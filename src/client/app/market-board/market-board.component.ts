import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';
import { HttpClient } from '@angular/common/http';

import { reject, get, startCase, isNumber } from 'lodash';
import { toRoman } from 'roman-numerals';

import debounce from 'debounce-decorator';
import { Observable, Subscription, empty } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EquippableItemClasses, WeaponClasses } from '../../../shared/models/item';
import { MarketCalculatorHelper } from '../../../shared/helpers/market-calculator-helper';
import * as swal from 'sweetalert2';

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
  public currentPage = 0;

  // for sell
  public sellValue = 0;

  // for my listings
  public myListings: any[] = [];

  // for my pickups
  public myPickups: any[] = [];

  private marketBoardRemoveId$: Subscription;

  public sortOptions = [
    { name: 'Most Recent',        sort: { 'listingInfo.listedAt': -1 } },
    { name: 'Least Recent',       sort: { 'listingInfo.listedAt': 1 } },
    { name: 'Price: Low to High', sort: { 'listingInfo.price': 1 } },
    { name: 'Price: High to Low', sort: { 'listingInfo.price': -1 } }
  ];

  public filterTags: Array<{ name: string, includedTypes: string[], isIncluded?: boolean, setSearchKey?: string }> = [
    { name: 'Bottles',        includedTypes: ['Bottle'] },
    { name: 'Cosmetics',      includedTypes: ['Scroll'], setSearchKey: 'Cosmetic' },
    { name: 'Food',           includedTypes: ['Food'] },
    { name: 'Gear',           includedTypes: EquippableItemClasses },
    { name: 'Gems',           includedTypes: ['Gem'] },
    { name: 'Misc',           includedTypes: ['Box', 'Book', 'Skull', 'Key'] },
    { name: 'Reagents',       includedTypes: ['Flower', 'Rock', 'Twig'] },
    { name: 'Rings',          includedTypes: ['Ring'] },
    { name: 'Scrolls',        includedTypes: ['Scroll'] },
    { name: 'Traps',          includedTypes: ['Trap'] },
    { name: 'Weapons',        includedTypes: WeaponClasses }
  ];

  public currentSort: any;

  get player() {
    return this.colyseusGame.character;
  }

  get mapRegion() {
    return this.colyseusGame.showMarketBoard.mapRegion;
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
    return `${Math.floor(MarketCalculatorHelper.getListingFeeForRegion(this.mapRegion) * 100)}%`;
  }

  get taxRate() {
    return `${Math.floor(MarketCalculatorHelper.getTaxForRegion(this.mapRegion) * 100)}%`;
  }

  get listingFee() {
    return MarketCalculatorHelper.calculateListingCostForRegion(this.sellValue, this.mapRegion);
  }

  get sellError() {
    // recently initialized, no need to show an error from the onset (but show an empty string because it also isn't ready)
    if(this.sellValue === 0) return ' ';
    return MarketCalculatorHelper.itemListError(this.player, this.mapRegion, this.player.rightHand, this.sellValue);
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

    if(newTab === 'Pick Up') {
      this.loadMyPickups();
    }
  }

  public changeSort(sort) {
    this.currentSort = sort;
    this.loadBuyOptions();
  }

  public toggleFilter(filter) {
    filter.isIncluded = !filter.isIncluded;

    if(filter.setSearchKey) {
      if(filter.isIncluded) {
        this.filterTags.forEach(tag => tag.isIncluded = tag.setSearchKey === filter.setSearchKey);
        this.searchText = filter.setSearchKey;
      } else {
        this.searchText = '';
      }
    } else {
      this.filterTags.forEach(tag => {
        if(tag.setSearchKey && tag.isIncluded && this.searchText === tag.setSearchKey) {
          this.searchText = '';
          tag.isIncluded = false;
        }
      });
    }

    this.currentPage = 0;
    this.loadBuyOptions();
  }

  @debounce(500)
  public changeSearchText() {
    this.loadBuyOptions();
  }

  public canGoBack() {
    return this.currentPage !== 0;
  }

  public canGoForward() {
    return this.buyableItemListings.length > 0;
  }

  public changePage(delta: number) {
    this.currentPage += delta;
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

    if(isNumber(this.currentPage)) {
      searchParams.page = this.currentPage;
    }

    const includedFilters = this.filterTags.filter(x => x.isIncluded);
    if(includedFilters.length > 0) {
      searchParams.filter = includedFilters.reduce((prev, cur) => {
        prev.push(...cur.includedTypes);
        return prev;
      }, []);
    }

    this.http.post('api/market/all', searchParams)
      .pipe(catchError(() => {
        this.isLoading = false;
        this.isError = true;
        this.buyableItemListings = [];
        return empty();
      }))
      .subscribe((data: any[]) => {
        this.isLoading = false;
        this.buyableItemListings = data;
      });
  }

  private loadMyListings() {

    this.isError = false;
    this.isLoading = true;

    this.http.post('api/market/mine', { username: this.player.username })
      .pipe(catchError(() => {
        this.isLoading = false;
        this.isError = true;
        this.myListings = [];
        return empty();
      }))
      .subscribe((data: any[]) => {
        this.isLoading = false;
        this.myListings = data;
      });
  }

  private loadMyPickups() {

    this.isError = false;
    this.isLoading = true;

    this.http.post('api/market/pickups', { username: this.player.username })
      .pipe(catchError(() => {
        this.isLoading = false;
        this.isError = true;
        this.myPickups = [];
        return empty();
      }))
      .subscribe((data: any) => {
        this.isLoading = false;

        const allItems = [];

        if(data.gold > 0) {
          const totalTaxPaid = MarketCalculatorHelper.calculateTaxCostForRegion(data.gold, this.mapRegion);
          allItems.push({ sprite: 212, value: data.gold, taxes: totalTaxPaid, itemId: `${data.gold.toLocaleString()} Gold`, uuid: 'gold' });
        }

        if(data.items) {
          data.items.forEach(itemData => {
            allItems.push({ sprite: itemData.sprite, quality: itemData.quality, itemId: itemData.itemId, uuid: itemData.uuid, cosmetic: itemData.itemOverride.cosmetic });
          });
        }

        this.myPickups = allItems;
      });
  }

  public enchantTextFor(itemInfo) {
    const el = get(itemInfo, 'itemOverride.enchantLevel', 0);
    if(el > 0) return `+${el} `;
    return '';
  }

  public starTextFor(itemInfo) {
    const quality = get(itemInfo, 'itemOverride.quality', 0);
    return quality - 2 > 0 ? Array(quality - 2).fill('★').join('') : '';
  }

  public statStringFor(itemInfo) {
    const stats = get(itemInfo, 'itemOverride.stats', {});
    const statKeys = Object.keys(stats);
    if(statKeys.length === 0) return '';
    return statKeys.map(stat => `${stats[stat] < 0 ? '' : '+'}${stats[stat]} ${stat.toUpperCase()}`).join(', ');
  }

  public traitStringFor(itemInfo) {
    const trait = get(itemInfo, 'itemOverride.trait', { name: '', level: '' });
    if(!trait || !trait.name || !trait.level) return '';

    return `${startCase(trait.name)} ${toRoman(trait.level)}`;
  }

  list() {
    this.colyseusGame.sendRawCommand('listmarketitem', `${this.colyseusGame.showMarketBoard.uuid} ${this.sellValue}`);
  }

  buy(listing: any) {
    (<any>swal)({
      titleText: 'Buy Item',
      text: `Are you sure you want to buy ${listing.itemId} ${this.starTextFor(listing.itemInfo.quality)} for ${listing.listingInfo.price.toLocaleString()} gold?`,
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
      text: `Are you sure you want to CANCEL the listing for ${listing.itemId} ${this.starTextFor(listing.itemInfo.quality)}? Your listing fee will not be refunded.`,
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      type: 'warning'
    }).then(() => {
      this.colyseusGame.sendRawCommand('buymarketitem', `${this.colyseusGame.showMarketBoard.uuid} ${listing._id}`);
    }).catch(() => {});
  }

  pickUp(uuid: string) {
    this.colyseusGame.sendRawCommand('pickupmarketitem', `${this.colyseusGame.showMarketBoard.uuid} ${uuid}`);
    this.myPickups = reject(this.myPickups, item => item.uuid === uuid);
  }
}
