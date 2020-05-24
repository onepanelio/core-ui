import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowTemplateStatusComponent } from './workflow-template-status.component';

describe('WorkflowTemplateStatusComponent', () => {
  let component: WorkflowTemplateStatusComponent;
  let fixture: ComponentFixture<WorkflowTemplateStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowTemplateStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowTemplateStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
