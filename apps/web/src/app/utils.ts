import { FormInput } from './form-schema';

const SANDAY = 0;
const SATURDAY = 6;

export const getTableContents = (year: number, month: number): FormInput['attendance'] => {
  const daysInMonth = new Date(Number(year), Number(month), 0).getDate();

  const newTableContents: FormInput['attendance'] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(Number(year), Number(month) - 1, day);

    const dayOfWeek = date.getDay();
    if (dayOfWeek !== SANDAY && dayOfWeek !== SATURDAY) {
      newTableContents.push({
        day: day.toString(),
        start: '09:00',
        end: '17:30',
        rest: '00:45',
      });
    } else {
      newTableContents.push({
        day: day.toString(),
        start: '',
        end: '',
        rest: '',
      });
    }
  }

  return newTableContents;
};
