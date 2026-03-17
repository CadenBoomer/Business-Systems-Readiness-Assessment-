import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailGate } from './email-gate';

describe('EmailGate', () => {
  let component: EmailGate;
  let fixture: ComponentFixture<EmailGate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailGate],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailGate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
