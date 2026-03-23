import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerOrderHistory } from './customer-order-history';

describe('CustomerOrderHistory', () => {
  let component: CustomerOrderHistory;
  let fixture: ComponentFixture<CustomerOrderHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerOrderHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerOrderHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
