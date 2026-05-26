import { TestBed } from '@angular/core/testing';
import { PacienteListComponent } from './paciente-list.component';

describe('PacienteListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteListComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PacienteListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
