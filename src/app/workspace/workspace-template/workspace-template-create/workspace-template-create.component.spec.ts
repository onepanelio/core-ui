import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceTemplateCreateComponent } from './workspace-template-create.component';

describe('WorkspaceTemplateCreateComponent', () => {
  let component: WorkspaceTemplateCreateComponent;
  let fixture: ComponentFixture<WorkspaceTemplateCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceTemplateCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceTemplateCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
