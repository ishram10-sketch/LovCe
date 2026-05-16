import { useEffect } from "react";
import { useSiteSettings } from "./use-site-settings";

export function useSeoMeta() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    if (settings.meta_title) {
      document.title = settings.meta_title;
    }

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    if (settings.meta_description) {
      metaDesc.setAttribute("content", settings.meta_description);
    }
  }, [settings]);
}
