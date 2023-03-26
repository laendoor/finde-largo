import axios from 'axios';
import dayjs from 'dayjs';
import { apiHolidays } from './config';
import { DayType, InfoDay } from './long-weekend';

export type HolidayAR = {
  id: string;
  dia: number;
  mes: number;
  motivo: string;
  tipo: string;
  info: string;
  opcional?: string | null;
  religion?: string | null;
  origen?: string | null;
  original?: string | null;
};

const isNationalHoliday = (holiday: HolidayAR) => {
  const isHoliday = ['inamovible', 'trasladable'].includes(holiday.tipo);
  const isCristian =
    holiday.tipo === 'nolaborable' &&
    holiday.opcional === 'religion' &&
    holiday.religion === 'cristianismo';
  return isHoliday || isCristian;
};

const mapTypeDay = (holiday: HolidayAR): DayType => {
  if (holiday.tipo === 'puente') return 'touristic-bridge';
  if (isNationalHoliday(holiday)) return 'national-holiday';
  return 'unknown';
};

const mapWithYear = (holiday: HolidayAR, year: number): InfoDay => {
  const month = holiday.mes.toString().padStart(2, '0');
  const day = holiday.dia.toString().padStart(2, '0');
  const type = mapTypeDay(holiday);
  return {
    name: holiday.motivo,
    date: dayjs(`${year}-${month}-${day}`),
    type,
    isRestingDay: type === 'national-holiday' || type === 'touristic-bridge',
  };
};

const fetchHolidays = async (year: number) => {
  const data = await axios.get(apiHolidays.replace('{year}', `${year}`));
  const holidays: InfoDay[] = data.data.map((holiday: HolidayAR) =>
    mapWithYear(holiday, year)
  );

  return holidays.filter(day => day.isRestingDay);
};

const Holiday = {
  fetchHolidays,
};

export default Holiday;
