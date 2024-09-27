'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField } from '@repo/ui/components/ui/form';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@repo/ui/components/ui/select';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@repo/ui/components/ui/table';
import { useState } from 'react';
import { Input } from '@repo/ui/components/ui/input';
import { Button } from '@repo/ui/components/ui/button';

import { formSchema, FormInput, FormOutput } from './form-schema';
import { getTableContents } from './utils';

export default function Page(): JSX.Element {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  const handleYearChange = (selectedYear: string) => {
    setYear(selectedYear);
  };

  const handleMonthChange = (selectedMonth: string) => {
    setMonth(selectedMonth);
  };

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      attendance: [],
    },
  });

  const { fields } = useFieldArray({
    name: 'attendance',
    control: form.control,
  });

  const generateTable = () => {
    if (!year || !month) return;

    const newTableData: FormInput['attendance'] = getTableContents(Number(year), Number(month));

    form.setValue('attendance', newTableData);
  };

  return (
    <main className='flex flex-col items-center justify-between min-h-screen p-24'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-3'>
          <div className='flex gap-3'>
            <Select onValueChange={handleYearChange}>
              <SelectTrigger>Year</SelectTrigger>
              <SelectContent>
                <SelectItem value='2024'>2024</SelectItem>
                <SelectItem value='2025'>2025</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={handleMonthChange}>
              <SelectTrigger>Month</SelectTrigger>
              <SelectContent>
                <SelectItem value='1'>January</SelectItem>
                <SelectItem value='2'>February</SelectItem>
                <SelectItem value='3'>March</SelectItem>
                <SelectItem value='4'>April</SelectItem>
                <SelectItem value='5'>May</SelectItem>
                <SelectItem value='6'>June</SelectItem>
                <SelectItem value='7'>July</SelectItem>
                <SelectItem value='8'>August</SelectItem>
                <SelectItem value='9'>September</SelectItem>
                <SelectItem value='10'>October</SelectItem>
                <SelectItem value='11'>Novenber</SelectItem>
                <SelectItem value='12'>December</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={generateTable}>generate</Button>
          </div>
          <Button type='submit'>Submit</Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Rest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell className='text-center'>{field.day}</TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`attendance.${index}.start`}
                      render={({ field }) => (
                        <FormControl>
                          <Input {...field} type='time' />
                        </FormControl>
                      )}
                    ></FormField>
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`attendance.${index}.end`}
                      render={({ field }) => (
                        <FormControl>
                          <Input {...field} type='time' />
                        </FormControl>
                      )}
                    ></FormField>
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`attendance.${index}.rest`}
                      render={({ field }) => (
                        <FormControl>
                          <Input {...field} type='time' />
                        </FormControl>
                      )}
                    ></FormField>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </form>
      </Form>
    </main>
  );
}

const onSubmit = (values: FormOutput): void => {
  console.log(values);
};
