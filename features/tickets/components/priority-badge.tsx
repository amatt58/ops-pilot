import type { TicketPriority } from "@/features/tickets/types";
import { Badge, type BadgeProps } from "@/shared/components/ui/badge";

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const PRIORITY_VARIANTS: Record<TicketPriority, BadgeProps["variant"]> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  critical: "destructive",
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <Badge variant={PRIORITY_VARIANTS[priority]}>{PRIORITY_LABELS[priority]}</Badge>;
}
