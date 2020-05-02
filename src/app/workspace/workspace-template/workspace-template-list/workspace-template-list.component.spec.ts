import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceTemplateListComponent } from './workspace-template-list.component';

describe('WorkspaceTemplateListComponent', () => {
  let component: WorkspaceTemplateListComponent;
  let fixture: ComponentFixture<WorkspaceTemplateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceTemplateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceTemplateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
