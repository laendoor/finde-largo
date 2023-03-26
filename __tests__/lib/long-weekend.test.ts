import dayjs from 'dayjs';
import {
  groupByCloseness,
  longWeekendMap,
  InfoDay,
} from '../../src/long-weekend';

// ----------------------------------------------------------------------------------

const InfoDayBuilder = (options: any): InfoDay => ({
  name: options.name || 'none',
  date: dayjs(options.date || '2022-01-01'),
  type: options.type || 'unknown',
  isRestingDay: options.isRestingDay || false,
});

const HolidayBuilder = (options: any) =>
  InfoDayBuilder({
    name: 'Testing Holiday',
    date: dayjs(options.date || '2022-01-01'),
    type: 'national-holiday',
    isRestingDay: true,
  });

// ----------------------------------------------------------------------------------

describe('Testing module long-weekend', () => {
  describe('longWeekendMap :: Holiday[] -> LongWeekend[]', () => {
    test('return zero Long-Weekends when holidays is empty', () => {
      const holidays: InfoDay[] = [];
      expect(longWeekendMap(holidays)).toEqual([]);
    });

    test('return zero Long-Weekends when holiday is on Tuesday|Wednesday|Thursday', () => {
      const tue = HolidayBuilder({ date: '2022-10-11' });
      const wed = HolidayBuilder({ date: '2022-10-12' });
      const thu = HolidayBuilder({ date: '2022-10-13' });

      expect(longWeekendMap([tue])).toEqual([]);
      expect(longWeekendMap([wed])).toEqual([]);
      expect(longWeekendMap([thu])).toEqual([]);
    });

    test('return Long-Weekend when holiday is on Monday', () => {
      const mon = HolidayBuilder({ date: '2022-10-10' });

      const longWeekends = longWeekendMap([mon]);
      expect(longWeekends).toBeInstanceOf(Array);
      expect(longWeekends.length).toBe(1);
      expect(longWeekends[0].days.length).toBe(3);
      expect(longWeekends[0].name).toBe('Testing Holiday');
      expect(longWeekends[0].start.format('YYYY-MM-DD')).toBe('2022-10-08');
      expect(longWeekends[0].end.format('YYYY-MM-DD')).toBe('2022-10-10');
    });

    test('return Long-Weekend when holiday is on Friday', () => {
      const fri = HolidayBuilder({ date: '2022-10-07' });

      const longWeekends = longWeekendMap([fri]);
      expect(longWeekends).toBeInstanceOf(Array);
      expect(longWeekends.length).toBe(1);
      expect(longWeekends[0].days.length).toBe(3);
      expect(longWeekends[0].name).toBe('Testing Holiday');
      expect(longWeekends[0].start.format('YYYY-MM-DD')).toBe('2022-10-07');
      expect(longWeekends[0].end.format('YYYY-MM-DD')).toBe('2022-10-09');
    });
  });

  describe('groupByCloseness :: TypedDay[] -> TypedDay[][]', () => {
    test('should work', () => {
      const day1 = InfoDayBuilder({ date: '2022-01-01' });
      const day2 = InfoDayBuilder({ date: '2022-01-02' });
      const day4 = InfoDayBuilder({ date: '2022-01-04' });
      const day5 = InfoDayBuilder({ date: '2022-01-05' });
      const day9 = InfoDayBuilder({ date: '2022-01-09' });

      expect(groupByCloseness([day1])).toStrictEqual([[day1]]);
      expect(groupByCloseness([day1, day2])).toStrictEqual([[day1, day2]]);
      expect(groupByCloseness([day1, day2, day4])).toStrictEqual([
        [day1, day2],
        [day4],
      ]);
      expect(groupByCloseness([day1, day2, day4, day5, day9])).toStrictEqual([
        [day1, day2],
        [day4, day5],
        [day9],
      ]);
    });
  });
});
