import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Props {
  label: string;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
}

const MAX_MB = 10;

export function AssetUploader({ label, currentUrl, onUpload, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File exceeds ${MAX_MB}MB limit`);
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${label.toLowerCase().replace(/\s+/g, "-")}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("assets").getPublicUrl(path);
      onUpload(data.publicUrl);
      toast.success(`${label} updated`);
    } catch {
      toast.error(`Failed to upload ${label}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[#1a1008]">{label}</p>

      {currentUrl ? (
        <div className="relative w-full overflow-hidden rounded-lg border border-[rgba(26,16,8,0.1)]">
          <img
            src={currentUrl}
            alt={label}
            className="h-36 w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="h-8 text-xs"
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Replace"}
            </Button>
            {onRemove && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={onRemove}
                className="h-8 text-xs"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[rgba(26,16,8,0.15)] bg-[#f8f6f2] text-[#8B6B3D] transition-colors hover:border-[#C9A96E]/50 hover:bg-[#f0ede8] disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
          <span className="text-xs">{uploading ? "Uploading…" : "Click to upload"}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
