import { TestBed } from '@angular/core/testing';
import { MedicamentosListComponent } from './medicamentos-list.component';

describe('MedicamentosListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicamentosListComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MedicamentosListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
