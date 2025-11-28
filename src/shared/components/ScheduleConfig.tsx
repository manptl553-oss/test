import { Controller, useWatch } from "react-hook-form";
import { EScheduleType, ETimeUnit } from "../constants";
import { Input } from "./Input";
import { Label } from "./Label";
import { Select } from "./Select";

export function ScheduleConfig({
  control,
  errors,
}: {
  control: any;
  errors?: any;
}) {
  // Watch which schedule type user selected
  const type = useWatch({
    control,
    name: `type`,
  });

  // Watch enableRepeat for interval mode
  const enableRepeat = useWatch({
    control,
    name: `enableRepeat`,
  });

  return (
    <div className="space-y-4">
      {/* SCHEDULE TYPE */}
      <div className="space-y-1">
        <Label>Schedule Type</Label>
        <Controller
          control={control}
          name={`type`}
          render={({ field }) => (
            <Select
              options={Object.values(EScheduleType).map((t) => ({
                value: t,
                label:
                  t === EScheduleType.FIXED_TIME ? "Fixed Time" : "Interval",
              }))}
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Select schedule type"
            />
          )}
        />
        {errors?.type && (
          <p className="text-red-500 text-xs">{errors.type.message}</p>
        )}
      </div>

      {/* FIXED TIME MODE */}
      {type === EScheduleType.FIXED_TIME && (
        <>
          {/* DATE */}
          <div className="space-y-1">
            <Label>Date (YYYY-MM-DD)</Label>
            <Controller
              control={control}
              name={`date`}
              render={({ field }) => (
                <Input type="date" {...field} placeholder="Select date" />
              )}
            />
            {errors?.date && (
              <p className="text-red-500 text-xs">
                {errors.date.message}
              </p>
            )}
          </div>

          {/* HOUR */}
          <div className="space-y-1">
            <Label>Hour (0-23)</Label>
            <Controller
              control={control}
              name={`hour`}
              render={({ field }) => (
                <Input
                  type="number"
                  {...field}
                  min="0"
                  max="23"
                  placeholder="Enter hour"
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              )}
            />
            {errors?.hour && (
              <p className="text-red-500 text-xs">
                {errors.hour.message}
              </p>
            )}
          </div>

          {/* MINUTE */}
          <div className="space-y-1">
            <Label>Minute (0-59)</Label>
            <Controller
              control={control}
              name={`minute`}
              render={({ field }) => (
                <Input
                  type="number"
                  {...field}
                  min="0"
                  max="59"
                  placeholder="Enter minute"
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              )}
            />
            {errors?.minute && (
              <p className="text-red-500 text-xs">
                {errors.minute.message}
              </p>
            )}
          </div>
        </>
      )}

      {/* INTERVAL MODE */}
      {type === EScheduleType.INTERVAL && (
        <>
          {/* INTERVAL VALUE */}
          <div className="space-y-1">
            <Label>Interval Value</Label>
            <Controller
              control={control}
              name={`intervalValue`}
              render={({ field }) => (
                <Input
                  type="number"
                  {...field}
                  min="1"
                  placeholder="Enter interval value"
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              )}
            />
            {errors?.intervalValue && (
              <p className="text-red-500 text-xs">
                {errors.intervalValue.message}
              </p>
            )}
          </div>

          {/* INTERVAL UNIT */}
          <div className="space-y-1">
            <Label>Interval Unit</Label>
            <Controller
              control={control}
              name={`intervalUnit`}
              render={({ field }) => (
                <Select
                  options={Object.values(ETimeUnit).map((unit) => ({
                    value: unit,
                    label: unit.charAt(0).toUpperCase() + unit.slice(1),
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select time unit"
                />
              )}
            />
            {errors?.intervalUnit && (
              <p className="text-red-500 text-xs">
                {errors.intervalUnit.message}
              </p>
            )}
          </div>

          {/* ENABLE REPEAT */}
          <div className="space-y-1">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...control.register(`enableRepeat`)}
              />
              Enable Repetition
            </Label>
          </div>

          {/* REPEAT COUNT (conditionally shown) */}
          {enableRepeat && (
            <div className="space-y-1">
              <Label>Repeat Count</Label>
              <Controller
                control={control}
                name={`repeatCount`}
                render={({ field }) => (
                  <Input
                    type="number"
                    {...field}
                    min="1"
                    placeholder="Enter repeat count"
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10))
                    }
                  />
                )}
              />
              {errors?.repeatCount && (
                <p className="text-red-500 text-xs">
                  {errors.repeatCount.message}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* TIMEZONE (Common for all) */}
      <div className="space-y-1">
        <Label>Timezone (Optional)</Label>
        <Controller
          control={control}
          name={`timezone`}
          render={({ field }) => (
            <Input {...field} placeholder="e.g. America/New_York" />
          )}
        />
        {errors?.timezone && (
          <p className="text-red-500 text-xs">
            {errors.timezone.message}
          </p>
        )}
      </div>
    </div>
  );
}
