import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowTemplateComponent } from './workflow-template.component';

describe('WorkflowTemplateComponent', () => {
  let component: WorkflowTemplateComponent;
  let fixture: ComponentFixture<WorkflowTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
