import { CreateTicketDialog } from "@/features/tickets/components/create-ticket-dialog";
import { TicketFilters } from "@/features/tickets/components/ticket-filters";
import { TicketList } from "@/features/tickets/components/ticket-list";
import { TicketPagination } from "@/features/tickets/components/ticket-pagination";
import { ticketListParamsSchema } from "@/features/tickets/schema";
import { toTicketCard } from "@/features/tickets/server/mappers";
import { getDistinctTags, getTicketList } from "@/features/tickets/server/queries";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function TicketsPage({ searchParams }: { searchParams: SearchParams }) {
  const rawParams = await searchParams;

  const parsed = ticketListParamsSchema.safeParse({
    status: rawParams.status,
    priority: rawParams.priority,
    assignedToId: rawParams.assignedToId,
    search: rawParams.search,
    tags: rawParams.tags
      ? Array.isArray(rawParams.tags)
        ? rawParams.tags
        : [rawParams.tags]
      : undefined,
    page: rawParams.page,
  });

  const params = parsed.success ? parsed.data : { page: 1 };

  const [{ tickets, totalCount, page, pageSize }, availableTags] = await Promise.all([
    getTicketList(params),
    getDistinctTags(),
  ]);

  const flatSearchParams: Record<string, string | undefined> = {
    status: typeof rawParams.status === "string" ? rawParams.status : undefined,
    priority: typeof rawParams.priority === "string" ? rawParams.priority : undefined,
    search: typeof rawParams.search === "string" ? rawParams.search : undefined,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Tickets</h1>
        <CreateTicketDialog />
      </div>

      <TicketFilters availableTags={availableTags} />

      <TicketList tickets={tickets.map(toTicketCard)} />

      <TicketPagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        searchParams={flatSearchParams}
      />
    </div>
  );
}
