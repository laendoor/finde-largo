import 'dayjs/locale/es';
import weekday from 'dayjs/plugin/weekday';
import dayjs, { Dayjs } from 'dayjs';

dayjs.locale('es');
dayjs.extend(weekday);

export type InfoDay = {
  name: string;
  date: Dayjs;
  type: DayType;
  isRestingDay: boolean;
};

export type DayType =
  | 'working-day'
  | 'weekend'
  | 'national-holiday'
  | 'touristic-bridge'
  | 'unknown';

export type LongWeekend = {
  name: string;
  start: Dayjs;
  end: Dayjs;
  days: InfoDay[];
};

type ConfigType = {
  from: Dayjs;
  to?: Dayjs;
  holidays: InfoDay[];
};

// -------------------------------------------------------------------------

const LONG_WEEKEND_MIN_DAYS = Number.parseInt(
  process.env.LONG_WEEKEND_MIN_DAYS || '3',
  10
);

export default class LongWeekendScanner {
  readonly from: Dayjs;
  readonly to: Dayjs;
  readonly holidays: InfoDay[];

  constructor(config?: ConfigType) {
    this.from = config?.from ?? dayjs();
    this.holidays = config?.holidays ?? [];
    const [lastHoliday] = this.holidays.slice(-1);
    this.to = lastHoliday ? lastHoliday.date : this.from;
  }
}

function* daysIterator(from: Dayjs, to: Dayjs) {
  for (let day = from; day <= to; day = day.add(1, 'd')) {
    yield day;
  }
}

function parseHolidayType(date: Dayjs, holidays: InfoDay[]): DayType {
  const holiday = holidays.find(h => date.isSame(h.date, 'day'));
  return (holiday?.type as DayType) ?? 'unknown';
}

function parseWeekdayType(date: Dayjs) {
  return [0, 6].includes(date.day()) ? 'weekend' : 'working-day';
}

function toInfoDay(date: Dayjs, holidays: InfoDay[]): InfoDay {
  const infoDay = holidays.find(holiday => date.isSame(holiday.date, 'day'));
  const name = infoDay ? infoDay.name : date.format('dddd');
  const type: DayType = infoDay
    ? parseHolidayType(date, holidays)
    : parseWeekdayType(date);
  const isRestingDay = [
    'touristic-bridge',
    'national-holiday',
    'weekend',
  ].includes(type);

  return {
    name,
    date,
    type,
    isRestingDay,
  };
}

function toRestingDay(typed: InfoDay): InfoDay {
  return {
    name: typed.name,
    date: typed.date,
    type: typed.type,
    isRestingDay: true,
  };
}

/**
 * Group by Closeness
 */
export function groupByCloseness(days: InfoDay[] = []): InfoDay[][] {
  let subgroup: InfoDay[] = [];
  const groupedDays: InfoDay[][] = [];
  for (let index = 0; index < days.length; index += 1) {
    const current = days[index];
    const isLast = index === days.length - 1;
    const previous = subgroup.slice(-1)[0];

    // if current.day is not "tomorrow" add subgroup to groupedDay and clean var
    if (previous && current.date.diff(previous.date, 'day') > 1) {
      groupedDays.push(subgroup);
      subgroup = [];
    }

    // add current day to new or existing subgroup
    subgroup.push(current);

    // add last subgroup
    if (isLast) groupedDays.push(subgroup);
  }
  return groupedDays;
}

function restingDayPriority(type: string) {
  switch (type) {
    case 'national-holiday':
      return 1;
    case 'touristic-bridge':
      return 2;
    case 'weekend':
      return 3;
    default:
      return 10;
  }
}

function findLongWeekendName(days: InfoDay[]): string {
  if (days.length === 0) return '';

  const restingDays = days.map(day => ({
    name: day.name,
    priority: restingDayPriority(day.type),
  }));
  restingDays.sort((a, b) => a.priority - b.priority);

  return restingDays[0].name;
}

function toLongWeekend(group: InfoDay[]): LongWeekend {
  const name = findLongWeekendName(group);
  const start = group[0].date;
  const end = group.slice(-1)[0].date;
  const days = group.map(toRestingDay);
  return {
    name,
    start,
    end,
    days,
  };
}

/**
 * Long Weekend Map
 */
export const longWeekendMap = (holidays: InfoDay[]): LongWeekend[] => {
  if (holidays.length === 0) return [];

  const from = holidays[0].date.subtract(5, 'days');
  const to = holidays.slice(-1)[0].date.add(5, 'days');

  // input: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
  const restingDays = [...daysIterator(from, to)]
    .map(day => toInfoDay(day, holidays))
    .filter(typedDay => typedDay.isRestingDay);
  // output: [3,4,5,12,13,14,15]

  // input: [3,4,5,12,13,14,15]
  const restingDaysInGroups = groupByCloseness(restingDays);
  // output [[3,4,5], [12,13,14,15]]

  const longWeekends = restingDaysInGroups.filter(
    group => group.length >= LONG_WEEKEND_MIN_DAYS
  );

  return longWeekends.map(toLongWeekend);
};
