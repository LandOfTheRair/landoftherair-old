import { Component, Input, OnInit } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';
import { Item } from '../../../shared/models/item';
import { IItem } from '../../../shared/interfaces/item';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {

  public pageDisplaySlots: any[] = [];

  private _book: IItem;

  @Input()
  public set book(book: IItem) {
    this._book = book;
    this.recalculatePages();
  }

  public get book() {
    return this._book;
  }

  public get currentPage() {
    return this.book.bookPages[this.book.bookCurrentPage];
  }

  constructor(public colyseusGame: ColyseusGameService) { }

  private recalculatePages() {
    if(!this.book.bookFindablePages) {
      this.pageDisplaySlots = [];
      return;
    }

    this.pageDisplaySlots = Array(Math.max(this.book.bookPages.length, this.book.bookFindablePages)).fill(null).map((x, i) => i);
  }

  ngOnInit() {
    this.colyseusGame.updateActiveWindowForGameWindow('book');
    if(!this.book.bookCurrentPage) this.colyseusGame.sendCommandString(`~page right 0`);

    this.recalculatePages();
  }

  prevPage() {
    this.colyseusGame.sendCommandString(`~page right ${this.book.bookCurrentPage - 1}`);
    this.book.bookCurrentPage--;
  }

  nextPage() {
    this.colyseusGame.sendCommandString(`~page right ${this.book.bookCurrentPage + 1}`);
    this.book.bookCurrentPage++;
  }

}
