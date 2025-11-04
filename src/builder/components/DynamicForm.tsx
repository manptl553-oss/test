import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, Input } from '../../ui';
type FieldOption = { label: string; value: string };
type FieldType = 'input' | 'textarea' | 'select' | 'richtext' | 'keyvalue' | 'checkbox' | 'table' | 'tags' | 'code';
interface FieldConfig { name: string; label: string; type: FieldType; placeholder?: string; required?: boolean; readOnly?: boolean; options?: FieldOption[]; }
export function DynamicForm({ fields, schema, onSubmit, defaultValues = {}, onClose }: any) {
  const initialDefaults = useMemo(() => { const d: Record<string, any> = {}; fields.forEach((f: FieldConfig) => { if (f.type === 'checkbox') d[f.name] = false; else d[f.name] = ''; }); return { ...d, ...defaultValues }; }, [defaultValues, fields]);
  const { handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: schema ? zodResolver(schema) : undefined, defaultValues: initialDefaults });
  useEffect(() => { reset(initialDefaults); }, [initialDefaults, reset]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-3">
        {fields.map((f: FieldConfig) => (
          <div key={f.name} className="space-y-2 w-full">
            <label className="block font-medium text-sm text-gray-700">{f.label}</label>
            <Controller control={control} name={f.name} render={({ field }) => (f.type === 'checkbox' ? <Checkbox {...field} checked={!!field.value} /> : <Input {...field} value={field.value ?? ''} placeholder={f.placeholder} />)} />
            {(errors as any)?.[f.name]?.message && <p className="text-red-500 text-xs">{(errors as any)[f.name].message as string}</p>}
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-6">
        <Button type="submit">Save</Button>
        <button type="button" className="px-3 py-2 rounded-md border" onClick={() => onClose?.(false)}>Cancel</button>
      </div>
    </form>
  );
}
