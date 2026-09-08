import { z } from "zod";

export const TICKET_STATUSES = ["open", "in_progress", "pending", "resolved", "closed"] as const;
export const TICKET_PRIORITIES = ["low", "medium", "high", "critical"] as const;
export const TICKET_TYPES = ["bug", "question", "feature_request", "incident", "task"] as const;

export const ticketListParamsSchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  assignedToId: z.string().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type TicketListParams = z.infer<typeof ticketListParamsSchema>;

export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(150, "Title must be 150 characters or fewer"),
  description: z.string().trim().min(1, "Description is required"),
  priority: z.enum(TICKET_PRIORITIES).default("medium"),
  type: z.enum(TICKET_TYPES).default("question"),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const updateStatusSchema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(TICKET_STATUSES),
});

export const updatePrioritySchema = z.object({
  ticketId: z.string().min(1),
  priority: z.enum(TICKET_PRIORITIES),
});

export const assignTicketSchema = z.object({
  ticketId: z.string().min(1),
  assigneeId: z.string().min(1).nullable(),
});

export const createMessageSchema = z.object({
  ticketId: z.string().min(1),
  body: z.string().trim().min(1, "Message can't be empty"),
  isInternal: z.boolean().default(false),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
