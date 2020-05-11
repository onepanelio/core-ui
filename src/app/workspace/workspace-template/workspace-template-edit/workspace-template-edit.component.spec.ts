import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceTemplateEditComponent } from './workspace-template-edit.component';

describe('WorkspaceTemplateEditComponent', () => {
  let component: WorkspaceTemplateEditComponent;
  let fixture: ComponentFixture<WorkspaceTemplateEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceTemplateEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceTemplateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
