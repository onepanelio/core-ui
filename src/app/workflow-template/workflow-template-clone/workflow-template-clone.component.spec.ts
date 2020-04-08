import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowTemplateCloneComponent } from './workflow-template-clone.component';

describe('WorkflowTemplateCloneComponent', () => {
  let component: WorkflowTemplateCloneComponent;
  let fixture: ComponentFixture<WorkflowTemplateCloneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowTemplateCloneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowTemplateCloneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
