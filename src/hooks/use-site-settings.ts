import { useQuery } from "@tanstack/react-query";
import { siteSettingsQuery } from "@/lib/queries";

export function useSiteSettings() {
  return useQuery(siteSettingsQuery());
}
