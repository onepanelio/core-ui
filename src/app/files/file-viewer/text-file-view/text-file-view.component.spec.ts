import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextFileViewComponent } from './text-file-view.component';

describe('TextFileViewComponent', () => {
  let component: TextFileViewComponent;
  let fixture: ComponentFixture<TextFileViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextFileViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextFileViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
