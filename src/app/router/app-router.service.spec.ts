import { TestBed } from '@angular/core/testing';

import { AppRouter } from './app-router.service';

describe('AppRouterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppRouter = TestBed.get(AppRouter);
    expect(service).toBeTruthy();
  });
});
