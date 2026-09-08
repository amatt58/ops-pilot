import type { Prisma } from "@prisma/client";
import type { TicketListParams } from "@/features/tickets/schema";
import { db } from "@/server/db";

const PAGE_SIZE = 20;

export async function getTicketList(params: TicketListParams) {
  const where: Prisma.TicketWhereInput = {};

  if (params.status) where.status = params.status;
  if (params.priority) where.priority = params.priority;
  if (params.assignedToId) where.assignedToId = params.assignedToId;
  if (params.tags?.length) where.tags = { hasSome: params.tags };
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [tickets, totalCount] = await Promise.all([
    db.ticket.findMany({
      where,
      include: { assignedTo: true },
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.ticket.count({ where }),
  ]);

  return { tickets, totalCount, page: params.page, pageSize: PAGE_SIZE };
}

export async function getTicketById(id: string) {
  return db.ticket.findUnique({
    where: { id },
    include: {
      createdBy: true,
      assignedTo: true,
      messages: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getAssignableUsers() {
  return db.user.findMany({
    where: { role: { in: ["agent", "admin"] } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, avatarUrl: true },
  });
}

export async function getDistinctTags(): Promise<string[]> {
  const rows = await db.$queryRaw<{ tag: string }[]>`
    SELECT DISTINCT unnest(tags) AS tag FROM "Ticket" ORDER BY tag
  `;
  return rows.map((row) => row.tag);
}
