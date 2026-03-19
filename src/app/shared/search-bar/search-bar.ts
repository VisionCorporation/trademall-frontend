import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  public placeholder = input<string>('Search...');
  public searchValue = output<string>();

  public onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.emit(value);
  }
}
