"use client";

import { useTransition } from "react";
import { assignTicketAction } from "@/features/tickets/actions/assign-ticket";
import type { AssignableUser } from "@/features/tickets/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const UNASSIGNED = "__unassigned__";

export function AssigneePicker({
  ticketId,
  assigneeId,
  users,
}: {
  ticketId: string;
  assigneeId: string | null;
  users: AssignableUser[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={assigneeId ?? UNASSIGNED}
      disabled={isPending}
      onValueChange={(value) => {
        startTransition(async () => {
          await assignTicketAction({ ticketId, assigneeId: value === UNASSIGNED ? null : value });
        });
      }}
    >
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
