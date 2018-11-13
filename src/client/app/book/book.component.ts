import { Component, OnInit } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {

  public pageDisplaySlots: any[] = [];

  public get book() {
    return this.colyseusGame.character.rightHand;
  }

  public get currentPage() {
    return this.book.bookPages[this.book.bookCurrentPage];
  }

  constructor(public colyseusGame: ColyseusGameService) { }

  ngOnInit() {
    this.colyseusGame.updateActiveWindowForGameWindow('book');
    if(!this.book.bookCurrentPage) this.colyseusGame.sendCommandString(`~page right 0`);

    this.pageDisplaySlots = Array(Math.max(this.book.bookPages.length, this.book.bookFindablePages)).fill(null).map((x, i) => i);
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
