import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Circle, Mail } from "lucide-react";
import { useState } from "react";
import { markSubmissionRead, submissionsQuery } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ContactSubmission } from "@/lib/types";

export const Route = createFileRoute("/admin/submissions")({ component: AdminSubmissions });

function AdminSubmissions() {
  const queryClient = useQueryClient();
  const { data: submissions = [], isLoading } = useQuery(submissionsQuery());
  const [selected, setSelected] = useState<ContactSubmission | null>(null);

  const unread = submissions.filter((s) => !s.is_read).length;

  const { mutate: doMarkRead } = useMutation({
    mutationFn: ({ id, is_read }: { id: string; is_read: boolean }) =>
      markSubmissionRead(id, is_read),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["submissions"] }),
  });

  const openSubmission = (s: ContactSubmission) => {
    setSelected(s);
    if (!s.is_read) doMarkRead({ id: s.id, is_read: true });
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1008]">
            Submissions
            {unread > 0 && (
              <Badge className="ml-3 bg-[#C9A96E] text-[#1a1008] hover:bg-[#C9A96E]">
                {unread} unread
              </Badge>
            )}
          </h1>
          <p className="mt-1 text-sm text-[#6b5a4a]">
            Contact form enquiries from your public site.
          </p>
        </div>
        {submissions.some((s) => !s.is_read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              submissions
                .filter((s) => !s.is_read)
                .forEach((s) => doMarkRead({ id: s.id, is_read: true }));
            }}
          >
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[#e8e4de]" />
          ))}
        </div>
      )}

      {!isLoading && submissions.length === 0 && (
        <div className="rounded-xl border border-dashed border-[rgba(26,16,8,0.15)] py-12 text-center">
          <Mail className="mx-auto mb-2 h-8 w-8 text-[#C9A96E]/50" />
          <p className="text-sm text-[#8B6B3D]">No submissions yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {submissions.map((s) => (
          <button
            key={s.id}
            onClick={() => openSubmission(s)}
            className={`w-full flex items-start gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-colors hover:bg-[#f8f6f2] ${
              s.is_read ? "border-[rgba(26,16,8,0.08)]" : "border-[#C9A96E]/30 bg-[#fdf9f4]"
            }`}
          >
            <div className="mt-1.5 flex-shrink-0">
              {s.is_read ? (
                <Circle className="h-3 w-3 text-[#d0c9bf]" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-[#C9A96E]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className={`text-sm ${s.is_read ? "font-normal text-[#1a1008]" : "font-semibold text-[#1a1008]"}`}>
                  {s.name}
                </span>
                <span className="text-xs text-[#8B6B3D]">{s.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="secondary"
                  className="h-4 px-1.5 text-[10px] bg-[#f0ede8] text-[#6b5a4a] hover:bg-[#f0ede8]"
                >
                  {s.project_type}
                </Badge>
                <p className="truncate text-xs text-[#6b5a4a]">{s.message}</p>
              </div>
            </div>
            <time className="flex-shrink-0 text-xs text-[#8B6B3D]">
              {new Date(s.created_at).toLocaleDateString()}
            </time>
          </button>
        ))}
      </div>

      <Dialog open={selected !== null} onOpenChange={(v) => !v && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#1a1008]">
                Enquiry from {selected.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#8B6B3D]">Name</p>
                  <p className="font-medium text-[#1a1008]">{selected.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8B6B3D]">Email</p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="font-medium text-[#C9A96E] hover:underline"
                  >
                    {selected.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-[#8B6B3D]">Project type</p>
                  <p className="font-medium text-[#1a1008]">{selected.project_type}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8B6B3D]">Received</p>
                  <p className="font-medium text-[#1a1008]">
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs text-[#8B6B3D]">Message</p>
                <p className="whitespace-pre-wrap rounded-lg bg-[#f8f6f2] p-3 text-[#1a1008]">
                  {selected.message}
                </p>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    doMarkRead({ id: selected.id, is_read: !selected.is_read })
                  }
                >
                  {selected.is_read ? "Mark unread" : "Mark read"}
                </Button>
                <a href={`mailto:${selected.email}`}>
                  <Button
                    size="sm"
                    className="bg-[#C9A96E] text-[#1a1008] hover:bg-[#b8945a]"
                  >
                    Reply via email
                  </Button>
                </a>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
