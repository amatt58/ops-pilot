"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createTicketSchema } from "@/features/tickets/schema";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export type CreateTicketActionState = { error?: string };

export async function createTicketAction(
  _prevState: CreateTicketActionState,
  formData: FormData,
): Promise<CreateTicketActionState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be signed in." };

  const parsed = createTicketSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority") || undefined,
    type: formData.get("type") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid ticket details." };
  }

  const ticket = await db.$transaction(async (tx) => {
    const created = await tx.ticket.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority,
        type: parsed.data.type,
        source: "internal",
        createdById: session.user.id,
      },
    });

    await tx.ticketAuditEvent.create({
      data: {
        ticketId: created.id,
        actorId: session.user.id,
        actorType: "user",
        eventType: "ticket_created",
      },
    });

    return created;
  });

  revalidatePath("/tickets");
  redirect(`/tickets/${ticket.id}`);
}
