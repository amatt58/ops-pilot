import type { TicketMessageView } from "@/features/tickets/types";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export function MessageThread({ messages }: { messages: TicketMessageView[] }) {
  if (messages.length === 0) {
    return <p className="text-sm text-muted-foreground">No messages yet.</p>;
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "rounded-md border p-3",
            message.isInternal ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20" : "bg-card",
          )}
        >
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {message.author?.name ?? "Customer"}
            </span>
            <span>&middot;</span>
            <span>{dateFormatter.format(message.createdAt)}</span>
            {message.isInternal && <Badge variant="outline">Internal note</Badge>}
          </div>
          <p className="whitespace-pre-wrap text-sm">{message.body}</p>
        </div>
      ))}
    </div>
  );
}
