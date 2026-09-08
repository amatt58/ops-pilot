import type { Ticket, TicketMessage, User } from "@prisma/client";
import type {
  AssignableUser,
  TicketCard,
  TicketDetail,
  TicketMessageView,
} from "@/features/tickets/types";

type TicketWithAssignee = Ticket & { assignedTo: User | null };

function toAssignee(user: User | null) {
  return user ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl } : null;
}

export function toTicketCard(ticket: TicketWithAssignee): TicketCard {
  return {
    id: ticket.id,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    type: ticket.type,
    tags: ticket.tags,
    assignee: toAssignee(ticket.assignedTo),
    createdAt: ticket.createdAt,
  };
}

type TicketWithDetail = Ticket & {
  createdBy: User;
  assignedTo: User | null;
  messages: (TicketMessage & { author: User | null })[];
};

function toMessageView(message: TicketMessage & { author: User | null }): TicketMessageView {
  return {
    id: message.id,
    body: message.body,
    messageType: message.messageType,
    isInternal: message.isInternal,
    author: message.author ? { id: message.author.id, name: message.author.name } : null,
    createdAt: message.createdAt,
  };
}

export function toTicketDetail(ticket: TicketWithDetail): TicketDetail {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    type: ticket.type,
    source: ticket.source,
    tags: ticket.tags,
    category: ticket.category,
    createdBy: { id: ticket.createdBy.id, name: ticket.createdBy.name },
    assignee: toAssignee(ticket.assignedTo),
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    resolvedAt: ticket.resolvedAt,
    dueAt: ticket.dueAt,
    aiSummary: ticket.aiSummary,
    aiSentiment: ticket.aiSentiment,
    aiSuggestedTags: ticket.aiSuggestedTags,
    messages: ticket.messages.map(toMessageView),
  };
}

export function toAssignableUser(user: {
  id: string;
  name: string;
  avatarUrl: string | null;
}): AssignableUser {
  return { id: user.id, name: user.name, avatarUrl: user.avatarUrl };
}
