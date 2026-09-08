"use client";

import { useTransition } from "react";
import { updateStatusAction } from "@/features/tickets/actions/update-status";
import { TICKET_STATUSES } from "@/features/tickets/schema";
import type { TicketStatus } from "@/features/tickets/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export function StatusSelect({ ticketId, status }: { ticketId: string; status: TicketStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(value) => {
        startTransition(async () => {
          await updateStatusAction({ ticketId, status: value });
        });
      }}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TICKET_STATUSES.map((option) => (
          <SelectItem key={option} value={option}>
            {option.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
