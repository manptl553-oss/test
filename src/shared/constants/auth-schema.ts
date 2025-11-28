import { z } from "zod";

export enum EAuthType {
  NONE = "none",
  BASIC = "basic",
  HEADER = "header",
}

const authNoneSchema = z.object({
  type: z.literal(EAuthType.NONE, "auth type is required"),
});

const authBasicSchema = z.object({
  type: z.literal(EAuthType.BASIC),
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
});

const headerItemSchema = z.object({
  headerKey: z.string().min(1, "Header Key required"),
  headerValue: z.string().min(1, "Header Value required"),
});

const authHeaderSchema = z.object({
  type: z.literal(EAuthType.HEADER),
  auth: z.array(headerItemSchema).min(1, "At least one header required"),
});

export const authSchema = z.union([
  authNoneSchema,
  authBasicSchema,
  authHeaderSchema,
]);