import { TestBed } from '@angular/core/testing';
import { AlertMessageComponent } from './alert-message.component';

describe('AlertMessageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertMessageComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AlertMessageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
