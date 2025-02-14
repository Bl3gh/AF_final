import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombineBooksComponentComponent } from './combine-books-component.component';

describe('CombineBooksComponentComponent', () => {
  let component: CombineBooksComponentComponent;
  let fixture: ComponentFixture<CombineBooksComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombineBooksComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CombineBooksComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
