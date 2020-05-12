import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceIdentifierComponent } from './workspace-identifier.component';

describe('WorkspaceIdentifierComponent', () => {
  let component: WorkspaceIdentifierComponent;
  let fixture: ComponentFixture<WorkspaceIdentifierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceIdentifierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceIdentifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
