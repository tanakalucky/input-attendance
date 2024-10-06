import { FormInput } from './form-schema';

const SUNDAY = 0;
const SATURDAY = 6;

export const getTableContents = (year: number, month: number): FormInput['attendance'] => {
  if (month < 1 || month > 12) {
    throw new Error('Invalid month. Month must be between 1 and 12.');
  }

  const daysInMonth = new Date(year, month, 0).getDate();

  const newTableContents: FormInput['attendance'] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);

    const dayOfWeek = date.getDay();
    if (dayOfWeek !== SUNDAY && dayOfWeek !== SATURDAY) {
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
