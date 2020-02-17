import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowTemplateSelectComponent } from './workflow-template-select.component';

describe('WorkflowTemplateSelectComponent', () => {
  let component: WorkflowTemplateSelectComponent;
  let fixture: ComponentFixture<WorkflowTemplateSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowTemplateSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowTemplateSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
