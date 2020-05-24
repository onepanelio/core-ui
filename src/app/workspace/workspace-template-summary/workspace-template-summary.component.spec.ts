import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceTemplateSummaryComponent } from './workspace-template-summary.component';

describe('WorkspaceTemplateSummaryComponent', () => {
  let component: WorkspaceTemplateSummaryComponent;
  let fixture: ComponentFixture<WorkspaceTemplateSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceTemplateSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceTemplateSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
