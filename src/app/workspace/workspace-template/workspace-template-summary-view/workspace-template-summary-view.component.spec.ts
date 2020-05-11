import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceTemplateSummaryViewComponent } from './workspace-template-summary-view.component';

describe('WorkspaceTemplateSummaryViewComponent', () => {
  let component: WorkspaceTemplateSummaryViewComponent;
  let fixture: ComponentFixture<WorkspaceTemplateSummaryViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceTemplateSummaryViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceTemplateSummaryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
