import * as v from 'valibot';

export const AttendanceSchema = v.object({
  date: v.pipe(
    v.string(),
    v.nonEmpty('Date is required'),
    v.isoDate('Please enter a valid date'),
  ),
  start_time: v.optional(v.string()),
  end_time: v.optional(v.string()),
  break_time: v.optional(v.string()),
});

export const ParsedAttendanceDataSchema = v.object({
  year: v.pipe(v.number(), v.integer('Year must be an integer')),
  month: v.pipe(
    v.number(),
    v.integer('Month must be an integer'),
    v.minValue(1, 'Month must be at least 1'),
    v.maxValue(12, 'Month must be at most 12'),
  ),
  attendances: v.array(AttendanceSchema),
});

export const AttendanceInputSchema = v.pipe(
  v.object({
    loginId: v.pipe(v.string(), v.nonEmpty('Login ID is required')),
    loginPw: v.pipe(v.string(), v.nonEmpty('Password is required')),
    attendances: v.pipe(
      v.string(),
      v.nonEmpty('Attendance data is required'),
      v.check((input) => {
        try {
          JSON.parse(input);
          return true;
        } catch {
          return false;
        }
      }, 'Invalid JSON format'),
    ),
  }),
  v.transform((input) => {
    const parsedAttendances = JSON.parse(input.attendances);
    const validatedData = v.parse(
      ParsedAttendanceDataSchema,
      parsedAttendances,
    );
    return {
      ...input,
      attendances: validatedData,
    };
  }),
);

export type Attendance = v.InferOutput<typeof AttendanceSchema>;
export type ParsedAttendanceData = v.InferOutput<
  typeof ParsedAttendanceDataSchema
>;
export type AttendanceInput = v.InferInput<typeof AttendanceInputSchema>;
export type ValidatedAttendanceInput = v.InferOutput<
  typeof AttendanceInputSchema
>;
