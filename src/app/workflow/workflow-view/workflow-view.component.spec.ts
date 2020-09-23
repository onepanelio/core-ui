import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowViewComponent } from './workflow-view.component';

describe('WorkflowComponent', () => {
  let component: WorkflowViewComponent;
  let fixture: ComponentFixture<WorkflowViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
