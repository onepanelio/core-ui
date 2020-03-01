import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BigFileViewComponent } from './big-file-view.component';

describe('BigFileViewComponent', () => {
  let component: BigFileViewComponent;
  let fixture: ComponentFixture<BigFileViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BigFileViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BigFileViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
