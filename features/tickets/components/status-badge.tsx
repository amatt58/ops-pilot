import type { TicketStatus } from "@/features/tickets/types";
import { Badge, type BadgeProps } from "@/shared/components/ui/badge";

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_VARIANTS: Record<TicketStatus, BadgeProps["variant"]> = {
  open: "default",
  in_progress: "secondary",
  pending: "outline",
  resolved: "secondary",
  closed: "outline",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
