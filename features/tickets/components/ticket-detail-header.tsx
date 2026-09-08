import { PriorityBadge } from "@/features/tickets/components/priority-badge";
import { PrioritySelect } from "@/features/tickets/components/priority-select";
import { StatusBadge } from "@/features/tickets/components/status-badge";
import { StatusSelect } from "@/features/tickets/components/status-select";
import type { TicketDetail } from "@/features/tickets/types";

export function TicketDetailHeader({ ticket }: { ticket: TicketDetail }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{ticket.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <StatusSelect ticketId={ticket.id} status={ticket.status} />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Priority</p>
          <PrioritySelect ticketId={ticket.id} priority={ticket.priority} />
        </div>
      </div>
    </div>
  );
}
