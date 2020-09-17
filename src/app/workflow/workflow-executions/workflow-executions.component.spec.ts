import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowExecutionsComponent } from './workflow-executions.component';

describe('WorkflowExecutionsComponent', () => {
  let component: WorkflowExecutionsComponent;
  let fixture: ComponentFixture<WorkflowExecutionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowExecutionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowExecutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
