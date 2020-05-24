import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManifestDagEditorComponent } from './manifest-dag-editor.component';

describe('ManifestDagEditorComponent', () => {
  let component: ManifestDagEditorComponent;
  let fixture: ComponentFixture<ManifestDagEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManifestDagEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManifestDagEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
