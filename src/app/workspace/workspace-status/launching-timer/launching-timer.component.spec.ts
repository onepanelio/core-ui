import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchingTimerComponent } from './launching-timer.component';

describe('LaunchingTimerComponent', () => {
  let component: LaunchingTimerComponent;
  let fixture: ComponentFixture<LaunchingTimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LaunchingTimerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchingTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
