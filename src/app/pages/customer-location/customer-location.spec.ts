import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerLocation } from './customer-location';

describe('CustomerLocation', () => {
  let component: CustomerLocation;
  let fixture: ComponentFixture<CustomerLocation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerLocation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerLocation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
