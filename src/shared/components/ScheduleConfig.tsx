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
    <div className="wf-schedule-wrapper">
      {/* SCHEDULE TYPE */}
      <div className="wf-schedule-block">
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
        {errors?.type && <p className="wf-error-text">{errors.type.message}</p>}
      </div>

      {/* FIXED TIME MODE */}
      {type === EScheduleType.FIXED_TIME && (
        <>
          {/* DATE */}
          <div className="wf-schedule-block">
            <Label>Date (YYYY-MM-DD)</Label>
            <Controller
              control={control}
              name={`date`}
              render={({ field }) => (
                <Input type="date" {...field} placeholder="Select date" />
              )}
            />
            {errors?.date && (
              <p className="wf-error-text">{errors.date.message}</p>
            )}
          </div>

          {/* HOUR */}
          <div className="wf-schedule-block">
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
              <p className="wf-error-text">{errors.hour.message}</p>
            )}
          </div>

          {/* MINUTE */}
          <div className="wf-schedule-block">
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
              <p className="wf-error-text">{errors.minute.message}</p>
            )}
          </div>
        </>
      )}

      {/* INTERVAL MODE */}
      {type === EScheduleType.INTERVAL && (
        <>
          {/* INTERVAL VALUE */}
          <div className="wf-schedule-block">
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
              <p className="wf-error-text">{errors.intervalValue.message}</p>
            )}
          </div>

          {/* INTERVAL UNIT */}
          <div className="wf-schedule-block">
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
              <p className="wf-error-text">{errors.intervalUnit.message}</p>
            )}
          </div>

          {/* ENABLE REPEAT */}
          <div className="wf-schedule-block">
            <Label className="flex items-center gap-2">
              <input type="checkbox" {...control.register(`enableRepeat`)} />
              Enable Repetition
            </Label>
          </div>

          {/* REPEAT COUNT */}
          {enableRepeat && (
            <div className="wf-schedule-block">
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
                <p className="wf-error-text">{errors.repeatCount.message}</p>
              )}
            </div>
          )}
        </>
      )}

      {/* TIMEZONE */}
      <div className="wf-schedule-block">
        <Label>Timezone (Optional)</Label>
        <Controller
          control={control}
          name={`timezone`}
          render={({ field }) => (
            <Input {...field} placeholder="e.g. America/New_York" />
          )}
        />
        {errors?.timezone && (
          <p className="wf-error-text">{errors.timezone.message}</p>
        )}
      </div>
    </div>
  );
}
