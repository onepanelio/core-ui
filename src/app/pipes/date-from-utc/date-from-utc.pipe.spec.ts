import { DateFromUtcPipe } from './date-from-utc.pipe';

describe('DateFromUtcPipe', () => {
  it('create an instance', () => {
    const pipe = new DateFromUtcPipe();
    expect(pipe).toBeTruthy();
  });
});
