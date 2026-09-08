export function TicketDescription({ description }: { description: string }) {
  return <p className="whitespace-pre-wrap text-sm text-foreground">{description}</p>;
}
