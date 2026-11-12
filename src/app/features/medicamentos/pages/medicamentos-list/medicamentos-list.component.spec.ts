import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MedicamentosListComponent } from './medicamentos-list.component';

describe('MedicamentosListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicamentosListComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MedicamentosListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
