import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowParameterComponent } from './workflow-parameter.component';

describe('WorkflowParameterComponent', () => {
  let component: WorkflowParameterComponent;
  let fixture: ComponentFixture<WorkflowParameterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowParameterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
