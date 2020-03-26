import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelsListViewComponent } from './labels-list-view.component';

describe('LabelsListViewComponent', () => {
  let component: LabelsListViewComponent;
  let fixture: ComponentFixture<LabelsListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelsListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelsListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
