import { getTimeOfDayCode, getTimeOfDayNumber } from './date-utils.js';

describe('date-utils', () => {
  describe('getTimeOfDayNumber', () => {
    it('should return the correct time of day number for midnight', () => {
      const date = new Date('2023-10-01T00:00:00Z');
      expect(getTimeOfDayNumber(date)).toBe(0);
    });

    it('should return the correct time of day number for noon', () => {
      const date = new Date('2023-10-01T12:00:00Z');
      expect(getTimeOfDayNumber(date)).toBe(500);
    });

    it('should return the correct time of day number for 6 PM', () => {
      const date = new Date('2023-10-01T18:00:00Z');
      expect(getTimeOfDayNumber(date)).toBe(750);
    });

    it('should return the correct time of day number for 11:59 PM', () => {
      const date = new Date('2023-10-01T23:59:59Z');
      expect(getTimeOfDayNumber(date)).toBe(999);
    });

    it('should handle a custom date input', () => {
      const date = new Date('2023-10-01T03:30:00Z');
      expect(getTimeOfDayNumber(date)).toBe(145);
    });
  });
  describe('getTimeOfDayCode', () => {
    it('should return the correct time of day code for midnight', () => {
      const date = new Date('2023-10-01T00:00:00Z');
      expect(getTimeOfDayCode(date)).toBe('000');
    });

    it('should return the correct time of day code for noon', () => {
      const date = new Date('2023-10-01T12:00:00Z');
      expect(getTimeOfDayCode(date)).toBe('500');
    });

    it('should return the correct time of day code for 6 PM', () => {
      const date = new Date('2023-10-01T18:00:00Z');
      expect(getTimeOfDayCode(date)).toBe('750');
    });

    it('should return the correct time of day code for 11:59 PM', () => {
      const date = new Date('2023-10-01T23:59:59Z');
      expect(getTimeOfDayCode(date)).toBe('999');
    });

    it('should handle a custom date input', () => {
      const date = new Date('2023-10-01T00:30:00Z');
      expect(getTimeOfDayCode(date)).toBe('030');
    });
  });
});
