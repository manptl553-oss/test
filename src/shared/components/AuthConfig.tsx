import { Controller, useWatch } from "react-hook-form";

import { EAuthType } from "../constants";
import { Input } from "./Input";
import { Label } from "./Label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./Select";
import { TableField } from "./TableFields";

export function AuthConfigFields({
  control,
  name = "authentication",
  errors,
}: {
  control: any;
  name?: string;
  errors?: any;
}) {
  // Watch which auth type user selected
  const type = useWatch({
    control,
    name: `${name}.type`,
  });

  return (
    <div className="space-y-4">
      {/* AUTH TYPE */}
      <div>
        <Label>Authentication Type</Label>
        <Controller
          control={control}
          name={`${name}.type`}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select authentication" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(EAuthType).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors?.[name]?.type && (
          <p className="text-red-500 text-xs">{errors[name].type.message}</p>
        )}
      </div>

      {/* BASIC AUTH */}
      {type === EAuthType.BASIC && (
        <>
          {/* USERNAME */}
          <div>
            <Label>Username</Label>
            <Controller
              control={control}
              name={`${name}.username`}
              render={({ field }) => (
                <Input {...field} placeholder="Enter username" />
              )}
            />
            {errors?.[name]?.username && (
              <p className="text-red-500 text-xs">
                {errors[name].username.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <Label>Password</Label>
            <Controller
              control={control}
              name={`${name}.password`}
              render={({ field }) => (
                <Input
                  type="password"
                  {...field}
                  placeholder="Enter password"
                />
              )}
            />
            {errors?.[name]?.password && (
              <p className="text-red-500 text-xs">
                {errors[name].password.message}
              </p>
            )}
          </div>
        </>
      )}

      {type === EAuthType.HEADER && (
        <div className="space-y-4">
          <TableField
            control={control}
            name={`${name}.auth`}
            errors={errors?.auth}
            label="Headers"
            columns={[
              { name: "headerKey", label: "Header Key", type: "input" },
              { name: "headerValue", label: "Header Value", type: "input" },
            ]}
          />
        </div>
      )}
      {errors?.message && (
        <p className="text-red-500 text-xs">{errors.message}</p>
      )}
    </div>
  );
}
