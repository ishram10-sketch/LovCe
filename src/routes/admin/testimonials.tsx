import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { deleteTestimonial, testimonialsQuery, upsertTestimonial } from "@/lib/queries";
import type { Testimonial } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/testimonials")({ component: AdminTestimonials });

const schema = z.object({
  client_name: z.string().min(1, "Required"),
  review_date: z.string().min(1, "Required"),
  review_text: z.string().min(1, "Required"),
  rating: z.number().min(1).max(5),
  is_active: z.boolean(),
  sort_order: z.number(),
});
type FormData = z.infer<typeof schema>;

function AdminTestimonials() {
  const queryClient = useQueryClient();
  const { data: testimonials = [] } = useQuery(testimonialsQuery());
  const [editing, setEditing] = useState<Testimonial | null | "new">(null);

  const { mutate: doDelete } = useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial deleted");
    },
  });

  const { mutate: doToggle } = useMutation({
    mutationFn: (t: Testimonial) =>
      upsertTestimonial({ ...t, is_active: !t.is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1008]">Testimonials</h1>
          <p className="mt-1 text-sm text-[#6b5a4a]">
            Client reviews shown on the public site.
          </p>
        </div>
        <Button
          onClick={() => setEditing("new")}
          className="bg-[#C9A96E] text-[#1a1008] hover:bg-[#b8945a]"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add testimonial
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgba(26,16,8,0.15)] py-12 text-center">
          <p className="text-sm text-[#8B6B3D]">
            No testimonials yet. The testimonials section will be hidden until you add one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={`rounded-xl border bg-white p-4 border-[rgba(26,16,8,0.08)] ${!t.is_active ? "opacity-50" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[#1a1008]">{t.client_name}</p>
                    <p className="text-xs text-[#8B6B3D]">{t.review_date}</p>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < t.rating ? "fill-[#C9A96E] text-[#C9A96E]" : "text-[#d0c9bf]"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1.5 text-sm text-[#6b5a4a] italic">"{t.review_text}"</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Switch
                    checked={t.is_active}
                    onCheckedChange={() => doToggle(t)}
                    title={t.is_active ? "Hide" : "Show"}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#6b5a4a] hover:text-[#1a1008]"
                    onClick={() => setEditing(t)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#6b5a4a] hover:text-red-600"
                    onClick={() => {
                      if (confirm("Delete this testimonial?")) doDelete(t.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TestimonialDialog
        open={editing !== null}
        testimonial={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
        sortOrder={testimonials.length}
      />
    </div>
  );
}

function TestimonialDialog({
  open,
  testimonial,
  onClose,
  sortOrder,
}: {
  open: boolean;
  testimonial: Testimonial | null;
  onClose: () => void;
  sortOrder: number;
}) {
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      client_name: testimonial?.client_name ?? "",
      review_date: testimonial?.review_date ?? "",
      review_text: testimonial?.review_text ?? "",
      rating: testimonial?.rating ?? 5,
      is_active: testimonial?.is_active ?? true,
      sort_order: testimonial?.sort_order ?? sortOrder,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        client_name: testimonial?.client_name ?? "",
        review_date: testimonial?.review_date ?? "",
        review_text: testimonial?.review_text ?? "",
        rating: testimonial?.rating ?? 5,
        is_active: testimonial?.is_active ?? true,
        sort_order: testimonial?.sort_order ?? sortOrder,
      });
    }
  }, [open, testimonial]);

  const { mutate: doSave, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      upsertTestimonial({
        ...(testimonial ? { id: testimonial.id } : {}),
        client_name: data.client_name,
        review_date: data.review_date,
        review_text: data.review_text,
        rating: data.rating,
        is_active: data.is_active,
        sort_order: data.sort_order,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success(testimonial ? "Testimonial updated" : "Testimonial added");
      onClose();
    },
    onError: () => toast.error("Failed to save"),
  });

  const rating = form.watch("rating");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{testimonial ? "Edit testimonial" : "New testimonial"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => doSave(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="review_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl><Input placeholder="March 2025" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="review_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => field.onChange(i + 1)}
                      >
                        <Star
                          className={`h-5 w-5 ${
                            i < rating
                              ? "fill-[#C9A96E] text-[#C9A96E]"
                              : "text-[#d0c9bf] hover:text-[#C9A96E]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Show on site</FormLabel>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button
                type="submit"
                className="bg-[#C9A96E] text-[#1a1008] hover:bg-[#b8945a]"
                disabled={isPending}
              >
                {isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
