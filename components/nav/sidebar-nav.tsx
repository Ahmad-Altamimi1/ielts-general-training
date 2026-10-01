"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { NavPart } from "@/lib/content/nav";

/** True when `href` is the page being viewed. Section ids are
 *  percent-encoded in links, so compare decoded. */
function useIsCurrent() {
  const pathname = usePathname();
  const current = decodeURIComponent(pathname);
  return (href: string) => decodeURIComponent(href) === current;
}

export function SidebarNav({ tree }: { tree: NavPart[] }) {
  const isCurrent = useIsCurrent();
  const { setOpenMobile, isMobile } = useSidebar();

  // On a phone the sidebar is a drawer over the page; following a link
  // there has to close it or the student never sees what they chose.
  const close = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarGroup className="p-0">
      <SidebarMenu>
        {tree.map((part) => {
          const partIsOpen =
            isCurrent(part.href) ||
            part.sections.some((section) => isCurrent(section.href));

          return (
            <Collapsible
              key={part.id}
              asChild
              defaultOpen={partIsOpen}
              className="group/part"
            >
              <SidebarMenuItem>
                <div className="flex items-center gap-0.5">
                  <SidebarMenuButton
                    asChild
                    isActive={isCurrent(part.href)}
                    className="h-auto min-w-0 flex-1 py-1.5"
                  >
                    <Link href={part.href} onClick={close}>
                      <span className="flex min-w-0 flex-col items-start">
                        <span className="font-heading text-[0.6875rem] font-semibold tracking-wide text-brand uppercase">
                          {part.label}
                        </span>
                        <span className="truncate text-sm">{part.title}</span>
                      </span>
                    </Link>
                  </SidebarMenuButton>

                  {part.sections.length > 0 ? (
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Sections of ${part.label}`}
                        className="flex size-7 shrink-0 items-center justify-center rounded-sm text-ink-muted hover:bg-sidebar-accent hover:text-ink"
                      >
                        <ChevronRight
                          aria-hidden="true"
                          className="size-3.5 transition-transform group-data-[state=open]/part:rotate-90"
                        />
                      </button>
                    </CollapsibleTrigger>
                  ) : null}
                </div>

                {part.sections.length > 0 ? (
                  <CollapsibleContent>
                    <SidebarMenuSub className="mr-0 gap-0.5 border-rule pr-0">
                      {part.sections.map((section) => (
                        <SidebarMenuSubItem key={section.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isCurrent(section.href)}
                            className="h-auto py-1"
                          >
                            <Link href={section.href} onClick={close}>
                              <span className="font-heading shrink-0 text-xs font-semibold text-brand tabular-nums">
                                {section.id}
                              </span>
                              <span className="truncate text-sm">
                                {section.title}
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
