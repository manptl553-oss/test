import { Controller, useWatch } from "react-hook-form";

import { EAuthType } from "../constants";
import { Input } from "./Input";
import { Label } from "./Label";
import {
  Select
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
      <div className="space-y-1">
        <Label>Authentication Type</Label>
        <Controller
          control={control}
          name={`${name}.type`}
          render={({ field }) => (
            <Select
              options={Object.values(EAuthType).map((t) => ({
                value: t,
                label: t,
              }))}
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Select authentication"
            />
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
          <div className="space-y-1">
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
          <div className="space-y-1">
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

      {/* HEADER AUTH */}
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
