import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSignup } from './customer-signup';

describe('CustomerSignup', () => {
  let component: CustomerSignup;
  let fixture: ComponentFixture<CustomerSignup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerSignup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerSignup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
