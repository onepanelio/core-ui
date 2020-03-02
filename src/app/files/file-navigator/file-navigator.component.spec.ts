import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileNavigatorComponent } from './file-navigator.component';

describe('FileNavigatorComponent', () => {
  let component: FileNavigatorComponent;
  let fixture: ComponentFixture<FileNavigatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileNavigatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileNavigatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
