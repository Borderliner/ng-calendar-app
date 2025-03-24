import { SplitPipe } from './split.pipe';

describe('SplitPipe', () => {
  let pipe: SplitPipe;

  beforeEach(() => {
    pipe = new SplitPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should split a string into an array of characters', () => {
    const input = 'Hello';
    const result = pipe.transform(input);
    expect(result).toEqual(['H', 'e', 'l', 'l', 'o']);
  });

  it('should handle an empty string', () => {
    const input = '';
    const result = pipe.transform(input);
    expect(result).toEqual([]);
  });

  it('should handle a single character string', () => {
    const input = 'A';
    const result = pipe.transform(input);
    expect(result).toEqual(['A']);
  });

  it('should handle a string with spaces', () => {
    const input = 'Hi There';
    const result = pipe.transform(input);
    expect(result).toEqual(['H', 'i', ' ', 'T', 'h', 'e', 'r', 'e']);
  });

  it('should handle a string with special characters', () => {
    const input = 'H@# $';
    const result = pipe.transform(input);
    expect(result).toEqual(['H', '@', '#', ' ', '$']);
  });
});