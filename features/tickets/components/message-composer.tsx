"use client";

import { useActionState, useState } from "react";
import {
  type CreateMessageActionState,
  createMessageAction,
} from "@/features/tickets/actions/create-message";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";

const initialState: CreateMessageActionState = {};

export function MessageComposer({ ticketId }: { ticketId: string }) {
  const [isInternal, setIsInternal] = useState(false);
  const [state, formAction, isPending] = useActionState(createMessageAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="isInternal" value={String(isInternal)} />

      <Textarea
        name="body"
        required
        rows={3}
        placeholder={isInternal ? "Add an internal note..." : "Reply to the customer..."}
      />

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={isInternal}
            onChange={(e) => setIsInternal(e.target.checked)}
            className="h-4 w-4"
          />
          Internal note (not visible to customer)
        </label>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Posting..." : isInternal ? "Add note" : "Send reply"}
        </Button>
      </div>
    </form>
  );
}
