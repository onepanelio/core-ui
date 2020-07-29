import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceViewComponent } from './service-view.component';

describe('ModeldbComponent', () => {
  let component: ServiceViewComponent;
  let fixture: ComponentFixture<ServiceViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
