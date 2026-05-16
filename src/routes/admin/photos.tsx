import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { allPhotosQuery } from "@/lib/queries";
import type { Category } from "@/lib/types";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { PhotoGrid } from "@/components/admin/PhotoGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/photos")({ component: AdminPhotos });

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "weddings", label: "Weddings" },
  { value: "portraits", label: "Portraits" },
  { value: "events", label: "Events" },
];

function AdminPhotos() {
  const { data: allPhotos = [], isLoading } = useQuery(allPhotosQuery());
  const [activeTab, setActiveTab] = useState<Category>("weddings");

  const byCategory = (cat: Category) => allPhotos.filter((p) => p.category === cat);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a1008]">Photos</h1>
        <p className="mt-1 text-sm text-[#6b5a4a]">
          Upload, organise, and manage portfolio photos. Drag to reorder. Hover a photo to
          publish/hide or delete it.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Category)}>
        <TabsList className="mb-6 bg-[#f0ede8]">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="data-[state=active]:bg-white data-[state=active]:text-[#1a1008]"
            >
              {cat.label}
              <span className="ml-1.5 text-[#8B6B3D] text-xs">
                ({byCategory(cat.value).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.value} value={cat.value} className="space-y-6">
            <div className="rounded-xl border border-[rgba(26,16,8,0.08)] bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-[#1a1008]">
                Upload to {cat.label}
              </h2>
              <PhotoUploader defaultCategory={cat.value} />
            </div>

            <div className="rounded-xl border border-[rgba(26,16,8,0.08)] bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-[#1a1008]">
                {cat.label} Gallery
                {isLoading && (
                  <span className="ml-2 text-xs font-normal text-[#8B6B3D]">Loading…</span>
                )}
              </h2>
              <PhotoGrid photos={byCategory(cat.value)} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
