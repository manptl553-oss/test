<<<<<<< HEAD
import { z } from "zod";
import { HTTP_METHODS } from "../types";
import { FieldConfig } from "@/features";
=======
import { FieldConfig } from "@/features";
import { z } from "zod";
import { HTTP_METHODS } from "../types";
import { addOnSchema } from "./addon-schema";
import { scheduleSchema } from "./schedule-schema";
>>>>>>> b916dd2f9979662654d2b06d437009e211054025

/**
 * Nodes that use DynamicForm only.
 * Conditional & Switch are not included here.
 */
<<<<<<< HEAD
=======
// const CRON_REGEX =
//   /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([01]?\d|2[0-9]|3[01])) (\*|(1[0-2]|0?[1-9])) (\*|([0-6]))$/;

export enum EDelayUnit {
  SECONDS = "seconds",
  MINUTES = "minutes",
  HOURS = "hours",
  DAYS = "days",
}

export const DelayUnitSelect = Object.entries(EDelayUnit).map(
  ([key, value]) => ({
    label: key,
    value,
  })
);


>>>>>>> b916dd2f9979662654d2b06d437009e211054025
export const nodeFieldsConfig: Record<string, FieldConfig[]> = {
  webhook: [
    {
      name: "endpoint",
      label: "Endpoint URL",
      type: "input",
      placeholder: "https://api.example.com",
      required: true,
      readOnly: true,
    },
    {
      name: "method",
      label: "HTTP Method",
      type: "select",
      required: true,
      options: HTTP_METHODS,
      readOnly: true,
    },
    {
      name: "mockData",
      label: "Mock Data",
      type: "textarea",
      required: false,
    },
<<<<<<< HEAD
=======
    // {
    //   name: "authentication",
    //   label: "Authentication",
    //   type: "auth",
    //   required: true,
    //   readOnly: true,
    // },
  ],

  schedule: [
    // {
    //   name: "cronExpression",
    //   label: "Cron Expression",
    //   type: "input",
    //   placeholder: "CRON_REGEX",
    //   required: true,
    // },
    // {
    //   name: "timezone",
    //   label: "Timezone",
    //   type: "input",
    //   placeholder: "IST",
    //   required: false,
    // },
    {
      name: "schedule",
      label: "Schedule",
      type: "schedule",
    },
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
  ],

  event: [
    {
      name: "eventName",
      label: "Event Name",
      type: "select",
      required: true,
      options: [
        {
          label: "KYC_INVITATION_COMPLETION",
          value: "kyc.invitation.completion",
        },
        {
          label: "PEP_CHECK_TASK_COMPLETION",
          value: "pep_check.task.completion",
        },
      ],
    },
  ],

  send_http_request: [
    { name: "url", label: "Request URL", type: "input", required: true },
    {
      name: "method",
      label: "HTTP Method",
      type: "select",
      required: true,
      options: HTTP_METHODS,
    },
    {
      name: "body",
      label: "Request Body",
      type: "textarea",
      placeholder: "Enter JSON payload",
    },
  ],

  send_email: [
    {
      name: "to",
      label: "Recipients",
      type: "tags",
      required: true,
    },
    { name: "subject", label: "Subject", type: "input", required: true },
    {
      name: "message",
      label: "Message Body",
      type: "richtext",
      required: true,
    },
  ],

  map: [
    {
      name: "mapping",
      label: "mapping",
      type: "table",
      required: true,
      options: [
        { name: "source", label: "Source", type: "input", required: true },
        {
          name: "target",
          label: "Target",
          type: "input",
          required: true,
        },
      ],
    },
  ],

  rename: [
    { name: "from", label: "From Field", type: "input", required: true },
    { name: "to", label: "To Field", type: "input", required: true },
  ],

  remove: [
    { name: "fields", label: "Fields to Remove", type: "tags", required: true },
  ],

  copy: [
    { name: "from", label: "From Field", type: "input", required: true },
    { name: "to", label: "To Field", type: "input", required: true },
  ],

  filter: [
    {
      name: "condition",
      label: "Condition",
      type: "table",
      required: true,
      options: [
        {
          name: "expression",
          label: "expression",
          type: "input",
        },
        {
          name: "operator",
          label: "operator",
          type: "select",
          options: [
            { label: "AND", value: "&&" },
            { label: "OR", value: "||" },
          ],
        },
      ],
    },
    { name: "data", label: "Input Data Path", type: "input", required: true },
  ],

  aggregate: [
    { name: "data", label: "Input Data Path", type: "input", required: true },
    { name: "groupBy", label: "Group By Fields", type: "tags", required: true },
    {
      name: "operations",
      label: "Aggregations",
      type: "table",
      required: true,
      options: [
        {
          label: "field",
          name: "field",
          type: "input",
        },
        {
          label: "type",
          name: "type",
          type: "select",
          options: [
            { label: "Sum", value: "sum" },
            { label: "Average", value: "avg" },
            { label: "Average (Alias)", value: "average" },
            { label: "Count", value: "count" },
            { label: "Minimum", value: "min" },
            { label: "Maximum", value: "max" },
            { label: "First", value: "first" },
            { label: "Last", value: "last" },
            { label: "Unique", value: "unique" },
            { label: "Join", value: "join" },
          ],
        },
        {
          label: "target",
          name: "target",
          type: "input",
        },
      ],
    },
  ],

  group: [
    { name: "data", label: "Input Data Path", type: "input", required: true },
    { name: "groupBy", label: "Group By Fields", type: "tags", required: true },
  ],

  concat: [
    { name: "sources", label: "Source Fields", type: "tags", required: true },
    { name: "target", label: "Target Field", type: "input", required: true },
    { name: "separator", label: "Separator", type: "input", required: false },
  ],

  formula: [
    {
      name: "expression",
      label: "Formula Expression",
      type: "input",
      required: true,
    },
  ],

  convert_type: [
    { name: "field", label: "Field", type: "input", required: true },
    {
      name: "toType",
      label: "Convert To Type",
      type: "select",
      options: [
        { label: "String", value: "string" },
        { label: "Number", value: "number" },
        { label: "Integer", value: "integer" },
        { label: "Boolean", value: "boolean" },
        { label: "Date", value: "date" },
        { label: "Array", value: "array" },
        { label: "Object", value: "object" },
      ],
      required: true,
    },
  ],

  merge: [
    { name: "source", label: "Source Path", type: "input", required: true },
    { name: "target", label: "Target Path", type: "input", required: true },
    {
      name: "strategy",
      label: "Merge Strategy",
      type: "select",
      options: [
        {
          label: "shallow",
          value: "shallow",
        },
        {
          label: "deep",
          value: "deep",
        },
      ],
      required: false,
    },
  ],

  split: [
    { name: "field", label: "Field to Split", type: "input", required: true },
    { name: "separator", label: "Separator", type: "input", required: true },
    { name: "target", label: "Target Field", type: "input", required: true },
    { name: "limit", label: "Limit", type: "input", required: false },
    { name: "trim", label: "Trim Values", type: "checkbox", required: false },
  ],

  date_format: [
    { name: "field", label: "Date Field", type: "input", required: true },
    {
      name: "format",
      label: "Date Format",
      type: "input",
      placeholder: "YYYY-MM-DD",
      required: true,
    },
    { name: "target", label: "Target Field", type: "input", required: false },
    { name: "timezone", label: "Timezone", type: "input", required: false },
  ],

  date_operation: [
    { name: "field", label: "Date Field", type: "input", required: true },
    {
      name: "operation",
      label: "Operation",
      type: "select",
      options: [
        { label: "add", value: "add" },
        { label: "subtract", value: "subtract" },
      ],
      required: true,
    },
    { name: "value", label: "Value", type: "input", required: true },
    {
      name: "unit",
      label: "Unit",
      type: "select",
      options: [
        { label: "Milliseconds", value: "milliseconds" },
        { label: "Seconds", value: "seconds" },
        { label: "Minutes", value: "minutes" },
        { label: "Hours", value: "hours" },
        { label: "Days", value: "days" },
        { label: "Weeks", value: "weeks" },
        { label: "Months", value: "months" },
        { label: "Years", value: "years" },
      ],
      required: true,
    },
    { name: "target", label: "Target Field", type: "input", required: false },
  ],

  timestamp: [
    {
      name: "field",
      label: "Input Field (optional)",
      type: "input",
      required: false,
    },
    { name: "target", label: "Target Field", type: "input", required: true },
    {
      name: "unit",
      label: "Time Unit",
      type: "select",
      options: [
        { label: "Milliseconds", value: "milliseconds" },
        { label: "Seconds", value: "seconds" },
        { label: "Minutes", value: "minutes" },
        { label: "Hours", value: "hours" },
        { label: "Days", value: "days" },
        { label: "Weeks", value: "weeks" },
        { label: "Months", value: "months" },
        { label: "Years", value: "years" },
      ],
      required: false,
    },
    {
      name: "operation",
      label: "Operation",
      type: "select",
      options: [
        { label: "To Timestamp", value: "toTimestamp" },
        { label: "From Timestamp", value: "fromTimestamp" },
      ],
      required: false,
    },
  ],

  rule_executor: [
    {
      name: "ruleset_id",
      label: "Rule Executor",
      type: "select",
      options: [
        { label: "Busines", value: "39c6c974-eb34-4a62-b435-3c0a6c8b3e73" },
        { label: "Ss", value: "896c8bc4-f462-411b-836f-00cad36b6898" },
        { label: "asdas", value: "f3c27305-209c-4912-a929-c17838ef6905" },
        {
          label: "Age Attribute only",
          value: "77fcc5a7-86f2-4eec-b33c-c8e9b1256aaa",
        },
        {
          label: "Just Age only",
          value: "438c79a3-5860-4572-9547-44ab2b2dab38",
        },
        { label: "15/09/2025", value: "782e2ef1-4007-45ec-8b2e-643f4d7beffc" },
        {
          label: "All Attribute Rule 007",
          value: "934ff240-d623-4eef-a7b4-7a87f17cacbe",
        },
        {
          label: "age nesting condition",
          value: "df4ca240-2d29-4025-b2c7-1015fb0f318a",
        },
        { label: "Nested 1", value: "babce848-74be-4dba-9a43-5bbe208d9509" },
        { label: "18rule", value: "488355ed-b68f-4d95-9297-2fb3ea67cf4c" },
      ],
    },
  ],

  code_block: [
    {
      name: "language",
      label: "Language",
      type: "select",
      options: [
        { label: "Python", value: "python" },
        { label: "JavaScript", value: "javascript" },
      ],
      required: true,
    },
    {
      name: "expression",
      label: "Custom Script",
      type: "code",
    },
  ],
  conditional: [
  {
    name: "conditions",
    label: "Conditions",
    type: "conditions",
    required: true,
  },
],
  switch: [
  { name: "switchCases", type: "cases", label: "Switch Cases" }]
};

/* -------------------------------------------------------
 * ✅ Validation Schemas
 * ----------------------------------------------------- */
export const nodeValidationSchema: Record<string, z.ZodSchema<any>> = {
  webhook: z.object({
    endpoint: z.string().optional(),
    method: z.string().optional(),
    mockData: z
      .string()
      .optional()
      .superRefine((val, ctx) => {
        if (!val) return; // allow undefined
        try {
          JSON.parse(val);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid JSON format",
          });
        }
<<<<<<< HEAD
      }),
=======
      })
      .transform((val) => {
        if (!val) return undefined;
        return JSON.parse(val);
      }),
    // authentication: authSchema.optional(),
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
  }),

  event: z.object({
    eventName: z.string().min(1, "Please select an event"),
  }),

  send_email: z.object({
    to: z
      .array(
        z.union([
          z.string().email("Invalid email"),
          z.string().regex(/{{\s*\$\.([\w.]+)\s*}}/),
        ])
      )
      .min(1, "At least one recipient required"),
    subject: z.string().min(1, "Subject required"),
    message: z.string().min(1, "Body required"),
  }),

  send_http_request: z.object({
    url: z.string().url("Invalid URL"),
    method: z.string().min(1, "HTTP Method required"),
    body: z
      .string()
      .min(1, "Body is required")
      .superRefine((val, ctx) => {
        try {
          JSON.parse(val);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid JSON format",
          });
        }
      }),
  }),

  /* IF/ELSE (Conditional Node) */
  conditional: z.object({
    conditions: z
      .array(
        z.object({
          field: z.string().min(1, "Field is required"),
          operator: z.string(),
          value: z.string().min(1, "Value is required"),
        })
      )
      .min(1, "At least one condition is required"),
  }),

  /* SWITCH Node */
  switch: z.object({
    switchCases: z
      .array(
        z.object({
          field: z.string().min(1, "Field is required"),
          operator: z.string(),
          value: z.string().min(1, "Value is required"),
        })
      )
      .min(1, "At least one case is required"),
  }),

<<<<<<< HEAD
=======
  update_database: z.object({
    table: z.string().min(1, "Table is required"),

    data: z
      .string()
      .min(1, "Data is required")
      .superRefine((val, ctx) => {
        try {
          JSON.parse(val);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid JSON format",
          });
        }
      })
      .transform((val) => JSON.parse(val)),
  }),

>>>>>>> b916dd2f9979662654d2b06d437009e211054025
  map: z.object({
    mapping: z
      .array(
        z.object({
          source: z.string("Source is required").min(1, "Source is required"),
          target: z.string("Target is required").min(1, "Target is required"),
        })
      )
      .nonempty("At least one mapping required"),
  }),

  rename: z.object({
    from: z.string("From field is required").min(1, "From field is required"),
    to: z.string("To field is required").min(1, "To field is required"),
  }),

  remove: z.object({
    fields: z
      .array(z.string().min(1, "field Value required"))
      .min(1, "At least one field required"),
  }),

  copy: z.object({
    from: z.string("From field is required").min(1, "From field is required"),
    to: z.string("To field is required").min(1, "To field is required"),
  }),

  filter: z.object({
    condition: z
      .array(
        z.object({
          expression: z
            .string("Expression required")
            .min(1, "Expression required"),
          operator: z.enum(["&&", "||"]).optional(),
        })
      )
      .nonempty(),
    data: z.string().min(1, "Data path required"),
  }),

  aggregate: z.object({
    data: z.string("Data path required").min(1, "Data path required"),
    groupBy: z
      .array(z.string().min(1, "GroupBy Value required"))
      .min(1, "At least one GroupBy required"),
    operations: z
      .array(
        z.object({
          field: z.string("Field required").min(1, "Field required"),
          type: z.enum(
            [
              "sum",
              "avg",
              "average",
              "count",
              "min",
              "max",
              "first",
              "last",
              "unique",
              "join",
            ],
            "Type required"
          ),
          target: z
            .string("Target field required")
            .min(1, "Target field required"),
        })
      )
      .nonempty(),
  }),

  group: z.object({
    data: z.string().min(1, "Data path required"),
    groupBy: z
      .array(z.string().min(1, "GroupBy Value required"))
      .min(1, "At least one GroupBy required"),
  }),

  concat: z.object({
    sources: z
      .array(z.string().min(1, "Sources Value required"))
      .min(2, "At least two Sources required"),
    target: z.string("Target required").min(1),
    separator: z.string().optional(),
  }),

  formula: z.object({
    expression: z.string("Expression required").min(1, "Expression required"),
  }),

  convert_type: z.object({
    field: z.string("Field required").min(1),
    toType: z.enum(
      ["string", "number", "integer", "boolean", "date", "array", "object"],
      "toType required"
    ),
  }),

  merge: z.object({
    source: z.string("Source required").min(1, "Source required"),
    target: z.string("Target required").min(1, "Target required"),
    strategy: z.enum(["shallow", "deep"]).optional(),
  }),

  split: z.object({
    field: z.string("Filed required").min(1, "Filed required"),
    separator: z.string("Separator required").min(1, "Separator required"),
    target: z.string("Target required").min(1, "Target required"),
    limit: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return typeof val === "string" ? Number(val) : val;
      })
      .refine((val) => val === undefined || !isNaN(val), {
        message: "Limit must be a valid number",
      }),
    trim: z.boolean().optional(),
  }),

  date_format: z.object({
    field: z.string().min(1, "Date field is required"),
    format: z
      .string()
      .min(1, "Date is required")
      .refine(
        (val) => !isNaN(Date.parse(val)),
        "Invalid date format — expected YYYY-MM-DD"
      ),
    target: z.string().optional(),
    timezone: z.string().optional(),
  }),

  date_operation: z.object({
    field: z.string("Filed required").min(1, "Filed required"),
    operation: z.enum(["add", "subtract"], "Operation required"),
    value: z
      .union([
        z.number(),
        z
          .string()
          .min(1)
          .transform((val) => Number(val))
          .refine((val) => !isNaN(val), "Value must be a number"),
      ])
      .transform((val) => (typeof val === "string" ? Number(val) : val)),
    unit: z.enum(
      [
        "milliseconds",
        "seconds",
        "minutes",
        "hours",
        "days",
        "weeks",
        "months",
        "years",
      ],
      "Unit required"
    ),
    target: z.string().optional(),
  }),

  timestamp: z.object({
    field: z.string().optional(),
    target: z.string("Target required").min(1),
    unit: z
      .enum([
        "milliseconds",
        "seconds",
        "minutes",
        "hours",
        "days",
        "weeks",
        "months",
        "years",
      ])
      .optional(),
    operation: z.enum(["toTimestamp", "fromTimestamp"]).optional(),
  }),

  rule_executor: z.object({
<<<<<<< HEAD
    ruleset_id: z.uuid("select valid rule set"),
=======
    rulesetId: z
      .string("select valid rule set")
      .min(1, "select valid rule set"),
  }),

  delay: z.object({
    delayTime: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        return typeof val === "string" ? Number(val) : val;
      })
      .refine((val) => val === undefined || !isNaN(val), {
        message: "time must be a valid number",
      }),
    delayUnit: z.enum(EDelayUnit, "unit is required "),
  }),

  membership_invite: z.object({
    email: z.union([
      z.string().email("Invalid email"),
      z.string().regex(/{{\s*\$\.([\w.]+)\s*}}/),
    ]),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .string()
        .regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number format")
        .optional()
    ),
    addons: z.array(addOnSchema).optional(),
    groupIds: z.array(z.string()).optional(),
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
  }),
};
