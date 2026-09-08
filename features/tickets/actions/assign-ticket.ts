"use server";

import { revalidatePath } from "next/cache";
import { assignTicketSchema } from "@/features/tickets/schema";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function assignTicketAction(input: { ticketId: string; assigneeId: string | null }) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = assignTicketSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid assignment update");

  const { ticketId, assigneeId } = parsed.data;

  await db.$transaction(async (tx) => {
    const previous = await tx.ticket.findUniqueOrThrow({
      where: { id: ticketId },
      select: { assignedToId: true },
    });

    await tx.ticket.update({ where: { id: ticketId }, data: { assignedToId: assigneeId } });

    await tx.ticketAuditEvent.create({
      data: {
        ticketId,
        actorId: session.user.id,
        actorType: "user",
        eventType: assigneeId ? "assigned" : "unassigned",
        previousValue: previous.assignedToId,
        newValue: assigneeId,
      },
    });
  });

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
}
