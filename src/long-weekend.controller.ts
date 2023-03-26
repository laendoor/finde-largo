import { Request, Response } from 'express';

import Holiday from './holiday';
import { longWeekendMap } from './long-weekend';

const longWeekends = async (req: Request<{ year: string }>, res: Response) => {
  const year = Number.parseInt(req.params.year, 10);
  const holidays = await Holiday.fetchHolidays(year);
  const lw = longWeekendMap(holidays);
  res.status(200).json(lw);
};

const LongWeekendController = {
  longWeekends,
};

export default LongWeekendController;
