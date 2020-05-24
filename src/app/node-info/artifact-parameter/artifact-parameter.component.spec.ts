import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtifactParameterComponent } from './artifact-parameter.component';

describe('ArtifactParameterComponent', () => {
  let component: ArtifactParameterComponent;
  let fixture: ComponentFixture<ArtifactParameterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtifactParameterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtifactParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
