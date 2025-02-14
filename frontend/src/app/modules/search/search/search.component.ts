// src/app/modules/search/search/search.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BookService } from '../../../services/book.service';

@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchForm!: FormGroup;
  results: any[] = [];

  constructor(private fb: FormBuilder, private bookService: BookService) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      keyword: [''],
      category: [''],
      author: ['']
    });
  }

  onSearch(): void {
    const { keyword, category, author } = this.searchForm.value;
    this.bookService.searchBooks(keyword, category, author).subscribe((data: any[]) => {
      this.results = data;
    });
  }
}
