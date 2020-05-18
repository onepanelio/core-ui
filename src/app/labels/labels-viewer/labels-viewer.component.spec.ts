import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelsViewerComponent } from './labels-viewer.component';

describe('LabelsViewerComponent', () => {
  let component: LabelsViewerComponent;
  let fixture: ComponentFixture<LabelsViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelsViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
