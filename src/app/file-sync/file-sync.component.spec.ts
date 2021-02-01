import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSyncComponent } from './file-sync.component';

describe('FileSyncComponent', () => {
  let component: FileSyncComponent;
  let fixture: ComponentFixture<FileSyncComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileSyncComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
