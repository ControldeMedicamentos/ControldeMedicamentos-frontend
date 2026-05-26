import { TestBed } from '@angular/core/testing';
import { ReporteSismedComponent } from './reporte-sismed.component';

describe('ReporteSismedComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteSismedComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ReporteSismedComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
