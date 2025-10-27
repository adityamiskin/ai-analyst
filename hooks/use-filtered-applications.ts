"use client";

import { useMemo } from "react";
import type { SidebarApplication } from "@/lib/types";

export function useFilteredApplications(
  applications: SidebarApplication[] | undefined,
  searchQuery: string,
) {
  const { pinnedCompanies, unpinnedCompanies } = useMemo(() => {
    const list = applications ?? [];
    const pinned: SidebarApplication[] = [];
    const unpinned: SidebarApplication[] = [];

    // Separate pinned and unpinned companies
    list.forEach((app: SidebarApplication) => {
      if (app.pinned) {
        pinned.push(app);
      } else {
        unpinned.push(app);
      }
    });

    // Apply search filter if there's a query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filterApps = (apps: SidebarApplication[]) =>
        apps.filter((app: SidebarApplication) => {
          const companyName = app.company?.name?.toLowerCase?.() ?? "";
          return companyName.includes(query);
        });

      return {
        pinnedCompanies: filterApps(pinned),
        unpinnedCompanies: filterApps(unpinned),
      };
    }

    return {
      pinnedCompanies: pinned,
      unpinnedCompanies: unpinned,
    };
  }, [applications, searchQuery]);

  return { pinnedCompanies, unpinnedCompanies };
}
