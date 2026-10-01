import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

/**
 * The course navigation. Milestone 3 builds the tree from the content
 * index; until then this is the shell only.
 */
export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-rule px-4 py-3">
        <Link
          href="/"
          className="font-heading text-base leading-tight font-semibold tracking-tight"
        >
          IELTS General Training
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3" />

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
