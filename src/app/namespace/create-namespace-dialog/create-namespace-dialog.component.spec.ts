import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNamespaceDialogComponent } from './create-namespace-dialog.component';

describe('CreateNamespaceDialogComponent', () => {
  let component: CreateNamespaceDialogComponent;
  let fixture: ComponentFixture<CreateNamespaceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNamespaceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNamespaceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
