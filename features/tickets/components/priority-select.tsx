"use client";

import { useTransition } from "react";
import { updatePriorityAction } from "@/features/tickets/actions/update-priority";
import { TICKET_PRIORITIES } from "@/features/tickets/schema";
import type { TicketPriority } from "@/features/tickets/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export function PrioritySelect({
  ticketId,
  priority,
}: {
  ticketId: string;
  priority: TicketPriority;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={priority}
      disabled={isPending}
      onValueChange={(value) => {
        startTransition(async () => {
          await updatePriorityAction({ ticketId, priority: value });
        });
      }}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TICKET_PRIORITIES.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
