import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceTemplateViewComponent } from './workspace-template-view.component';

describe('WorkspaceTemplateViewComponent', () => {
  let component: WorkspaceTemplateViewComponent;
  let fixture: ComponentFixture<WorkspaceTemplateViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceTemplateViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceTemplateViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
