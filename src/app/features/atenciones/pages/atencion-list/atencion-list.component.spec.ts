import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AtencionListComponent } from './atencion-list.component';

describe('AtencionListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtencionListComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AtencionListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
