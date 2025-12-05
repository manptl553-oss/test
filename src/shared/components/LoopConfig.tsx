import { Control, Controller, useWatch } from "react-hook-form";
import { Input } from "./Input";
import { Label } from "./Label";
import { Select } from "./Select";
import { ELoopType } from "../constants/loop-schema";

export function LoopConfigFields({
  control,
  name = "",
  errors,
}: {
  control: Control<any>;
  name?: string;
  errors?: any;
}) {
  const loopType = useWatch({
    control,
    name: `loopType`,
  });

  return (
    <div className="wf-loop-wrapper">
      {/* LOOP TYPE */}
      <div className="wf-loop-block">
        <Label>Loop Strategy</Label>
        <Controller
          control={control}
          name={`loopType`}
          render={({ field }) => (
            <Select
              options={[
                { value: ELoopType.FIXED, label: "Fixed Iterations" },
                { value: ELoopType.WHILE, label: "While Loop" },
                { value: ELoopType.FOR_EACH, label: "For Each" },
              ]}
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Select loop type"
            />
          )}
        />
        {/* Error is located at errors.loopType, not errors.loop.loopType */}
        {errors?.loopType && (
          <p className="wf-error-text">{errors.loopType.message}</p>
        )}
      </div>

      {/* FIXED */}
      {loopType === ELoopType.FIXED && (
        <div className="wf-loop-block">
          <Label>Maximum Iterations</Label>
          <Controller
            control={control}
            name={`maxIterations`}
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder="e.g. 10"
              />
            )}
          />
          {errors?.maxIterations && (
            <p className="wf-error-text">{errors.maxIterations.message}</p>
          )}
        </div>
      )}

      {/* WHILE */}
      {loopType === ELoopType.WHILE && (
        <div className="wf-loop-block">
          <Label>Exit Condition</Label>
          <Controller
            control={control}
            name={`exitCondition`}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="e.g. $.input.isComplete == true"
              />
            )}
          />
          {errors?.exitCondition && (
            <p className="wf-error-text">{errors.exitCondition.message}</p>
          )}
        </div>
      )}

      {/* FOR EACH */}
      {loopType === ELoopType.FOR_EACH && (
        <div className="wf-loop-block">
          <Label>Data Source Path</Label>
          <Controller
            control={control}
            name={`dataSourcePath`}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="e.g. $.input.items"
              />
            )}
          />
          {errors?.dataSourcePath && (
            <p className="wf-error-text">{errors.dataSourcePath.message}</p>
          )}
        </div>
      )}
    </div>
  );
}