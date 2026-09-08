"use server";

import { revalidatePath } from "next/cache";
import { updatePrioritySchema } from "@/features/tickets/schema";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function updatePriorityAction(input: { ticketId: string; priority: string }) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = updatePrioritySchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid priority update");

  const { ticketId, priority } = parsed.data;

  await db.$transaction(async (tx) => {
    const previous = await tx.ticket.findUniqueOrThrow({
      where: { id: ticketId },
      select: { priority: true },
    });

    await tx.ticket.update({ where: { id: ticketId }, data: { priority } });

    await tx.ticketAuditEvent.create({
      data: {
        ticketId,
        actorId: session.user.id,
        actorType: "user",
        eventType: "priority_changed",
        previousValue: previous.priority,
        newValue: priority,
      },
    });
  });

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
}
