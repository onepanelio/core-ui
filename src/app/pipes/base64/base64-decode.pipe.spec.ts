import { Base64DecodePipe } from './base64-decode.pipe';

describe('DecodePipe', () => {
  it('create an instance', () => {
    const pipe = new Base64DecodePipe();
    expect(pipe).toBeTruthy();
  });
});
