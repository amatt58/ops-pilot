"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/features/tickets/schema";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const ALL = "__all__";

export function TicketFilters({ availableTags }: { availableTags: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  function toggleTag(tag: string, checked: boolean) {
    const currentTags = searchParams.getAll("tags");
    const nextTags = checked ? [...currentTags, tag] : currentTags.filter((t) => t !== tag);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tags");
    for (const t of nextTags) params.append("tags", t);
    params.delete("page");
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  const selectedTags = new Set(searchParams.getAll("tags"));

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-md border p-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search title or description"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => updateParams({ search: e.target.value || null })}
          className="w-64"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={searchParams.get("status") ?? ALL}
          onValueChange={(value) => updateParams({ status: value === ALL ? null : value })}
        >
          <SelectTrigger id="status" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {TICKET_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={searchParams.get("priority") ?? ALL}
          onValueChange={(value) => updateParams({ priority: value === ALL ? null : value })}
        >
          <SelectTrigger id="priority" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All priorities</SelectItem>
            {TICKET_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {availableTags.length > 0 && (
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-3">
            {availableTags.map((tag) => (
              <div key={tag} className="flex items-center gap-1.5 text-sm">
                <Checkbox
                  id={`tag-${tag}`}
                  checked={selectedTags.has(tag)}
                  onCheckedChange={(checked) => toggleTag(tag, checked === true)}
                />
                <Label htmlFor={`tag-${tag}`} className="font-normal">
                  {tag}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
