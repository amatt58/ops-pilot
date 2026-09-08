"use server";

import { revalidatePath } from "next/cache";
import { updateStatusSchema } from "@/features/tickets/schema";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function updateStatusAction(input: { ticketId: string; status: string }) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid status update");

  const { ticketId, status } = parsed.data;

  await db.$transaction(async (tx) => {
    const previous = await tx.ticket.findUniqueOrThrow({
      where: { id: ticketId },
      select: { status: true },
    });

    await tx.ticket.update({
      where: { id: ticketId },
      data: { status, resolvedAt: status === "resolved" ? new Date() : undefined },
    });

    await tx.ticketAuditEvent.create({
      data: {
        ticketId,
        actorId: session.user.id,
        actorType: "user",
        eventType: "status_changed",
        previousValue: previous.status,
        newValue: status,
      },
    });
  });

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
}
