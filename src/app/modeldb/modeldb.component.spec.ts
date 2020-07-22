import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeldbComponent } from './modeldb.component';

describe('ModeldbComponent', () => {
  let component: ModeldbComponent;
  let fixture: ComponentFixture<ModeldbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModeldbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeldbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
