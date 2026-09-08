export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketType = "bug" | "question" | "feature_request" | "incident" | "task";
export type TicketSource = "email" | "web" | "api" | "internal";
export type TicketMessageType = "customer_reply" | "agent_note" | "ai_draft" | "system";
export type TicketSentiment = "positive" | "neutral" | "negative" | "frustrated";

export type TicketAssignee = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type TicketCard = {
  id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  tags: string[];
  assignee: TicketAssignee | null;
  createdAt: Date;
};

export type TicketListResult = {
  tickets: TicketCard[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type TicketMessageView = {
  id: string;
  body: string;
  messageType: TicketMessageType;
  isInternal: boolean;
  author: { id: string; name: string } | null;
  createdAt: Date;
};

export type TicketDetail = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  source: TicketSource;
  tags: string[];
  category: string | null;
  createdBy: { id: string; name: string };
  assignee: TicketAssignee | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  dueAt: Date | null;
  // AI fields are populated by epic #6 — always render defensively as nullable here.
  aiSummary: string | null;
  aiSentiment: TicketSentiment | null;
  aiSuggestedTags: string[];
  messages: TicketMessageView[];
};

export type AssignableUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
};
