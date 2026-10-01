import Link from "next/link";

import { SidebarNav } from "@/components/nav/sidebar-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navTree } from "@/lib/content/nav";

export function AppSidebar() {
  const tree = navTree();

  return (
    <Sidebar className="print-hidden">
      <SidebarHeader className="border-b border-rule px-4 py-3">
        <Link
          href="/"
          className="font-heading text-base leading-tight font-semibold tracking-tight"
        >
          IELTS General Training
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarNav tree={tree} />
      </SidebarContent>

      <SidebarFooter className="border-t border-rule px-4 py-3">
        <Link
          href="/progress"
          className="text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Your progress
        </Link>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
