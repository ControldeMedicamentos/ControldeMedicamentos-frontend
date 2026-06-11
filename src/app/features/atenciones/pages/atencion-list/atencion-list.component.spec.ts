import { TestBed } from '@angular/core/testing';
import { AtencionListComponent } from './atencion-list.component';

describe('AtencionListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtencionListComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AtencionListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
