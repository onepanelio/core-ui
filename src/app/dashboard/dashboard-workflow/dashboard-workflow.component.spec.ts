import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWorkflowComponent } from './dashboard-workflow.component';

describe('DashboardWorkflowComponent', () => {
  let component: DashboardWorkflowComponent;
  let fixture: ComponentFixture<DashboardWorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardWorkflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
