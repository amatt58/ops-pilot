"use server";

import { revalidatePath } from "next/cache";
import { createMessageSchema } from "@/features/tickets/schema";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export type CreateMessageActionState = { error?: string };

export async function createMessageAction(
  _prevState: CreateMessageActionState,
  formData: FormData,
): Promise<CreateMessageActionState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be signed in." };

  const parsed = createMessageSchema.safeParse({
    ticketId: formData.get("ticketId"),
    body: formData.get("body"),
    isInternal: formData.get("isInternal") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid message." };
  }

  const { ticketId, body, isInternal } = parsed.data;

  await db.$transaction(async (tx) => {
    await tx.ticketMessage.create({
      data: {
        ticketId,
        authorId: session.user.id,
        body,
        messageType: isInternal ? "agent_note" : "customer_reply",
        isInternal,
      },
    });

    await tx.ticketAuditEvent.create({
      data: {
        ticketId,
        actorId: session.user.id,
        actorType: "user",
        eventType: "message_sent",
      },
    });
  });

  revalidatePath(`/tickets/${ticketId}`);
  return {};
}
