import { z } from "zod";

export enum EScheduleType {
  FIXED_TIME = "FIXED_TIME",
  INTERVAL = "INTERVAL",
}

export enum ETimeUnit {
  SECONDS = "seconds",
  MINUTES = "minutes",
  HOURS = "hours",
  DAYS = "days",
}

// FIXED_TIME Schema
const scheduleFixedTimeSchema = z.object({
  type: z.literal(EScheduleType.FIXED_TIME),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in valid ISO format (YYYY-MM-DD)")
    .refine((date) => !isNaN(Date.parse(date)), "Date must be a valid date"),
  hour: z.number().int().min(0).max(23, "Hour must be between 0 and 23"),
  minute: z.number().int().min(0).max(59, "Minute must be between 0 and 59"),
  timezone: z.string().optional(),
});

// INTERVAL Schema without repeat
const scheduleIntervalBaseSchema = z.object({
  type: z.literal(EScheduleType.INTERVAL),
  intervalValue: z.number().int().min(1, "Interval value must be at least 1"),
  intervalUnit: z.nativeEnum(ETimeUnit),
  timezone: z.string().optional(),
});

// INTERVAL Schema with repeat enabled
const scheduleIntervalWithRepeatSchema = scheduleIntervalBaseSchema.extend({
  enableRepeat: z.literal(true),
  repeatCount: z.number().int().min(1, "Repeat count must be at least 1"),
});

// INTERVAL Schema with repeat disabled
const scheduleIntervalNoRepeatSchema = scheduleIntervalBaseSchema.extend({
  enableRepeat: z.literal(false),
  repeatCount: z.undefined().optional(),
});

// Combined INTERVAL Schema
const scheduleIntervalSchema = z.union([
  scheduleIntervalWithRepeatSchema,
  scheduleIntervalNoRepeatSchema,
]);

// Main Schema
export const scheduleSchema = z.union([
  scheduleFixedTimeSchema,
  scheduleIntervalSchema,
]);