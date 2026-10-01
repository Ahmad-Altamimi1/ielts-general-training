"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";

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
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAllProgress } from "@/hooks/use-progress";
import type { NavPart } from "@/lib/content/nav";
import { toneFor } from "@/lib/content/tone";

/** True when `href` is the page being viewed. Section ids are
 *  percent-encoded in links, so compare decoded. */
function useIsCurrent() {
  const pathname = usePathname();
  const current = decodeURIComponent(pathname);
  return (href: string) => decodeURIComponent(href) === current;
}

export function SidebarNav({ tree }: { tree: NavPart[] }) {
  const isCurrent = useIsCurrent();
  const progress = useAllProgress();
  const { setOpenMobile, isMobile } = useSidebar();

  // On a phone the sidebar is a drawer over the page; following a link
  // there has to close it or the student never sees what they chose.
  const close = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarGroup className="p-0">
      <SidebarMenu className="gap-0.5">
        {tree.map((part) => {
          const partIsOpen =
            isCurrent(part.href) ||
            part.sections.some((section) => isCurrent(section.href));

          const done = part.exerciseIds.filter((id) => progress[id]).length;
          const total = part.exerciseIds.length;
          const complete = total > 0 && done === total;

          return (
            <Collapsible
              key={part.id}
              asChild
              defaultOpen={partIsOpen}
              className="group/part"
            >
              <SidebarMenuItem data-tone={toneFor(part.id)}>
                <div className="flex items-center gap-0.5">
                  <SidebarMenuButton
                    asChild
                    isActive={isCurrent(part.href)}
                    className="h-auto min-w-0 flex-1 py-1.5"
                  >
                    <Link href={part.href} onClick={close}>
                      <span
                        aria-hidden="true"
                        className="font-heading flex size-6 shrink-0 items-center justify-center rounded-md bg-tone-wash text-[0.625rem] font-bold text-tone tabular-nums"
                      >
                        {part.number ?? "·"}
                      </span>

                      <span className="flex min-w-0 flex-1 flex-col items-start">
                        <span className="w-full truncate text-sm font-medium">
                          {part.title}
                        </span>
                        {total > 0 ? (
                          <span className="flex w-full items-center gap-1.5 pt-1">
                            <span
                              aria-hidden="true"
                              className="h-0.5 flex-1 overflow-hidden rounded-full bg-layer-border"
                            >
                              <span
                                className="block h-full rounded-full bg-tone"
                                style={{
                                  width: `${(done / total) * 100}%`,
                                }}
                              />
                            </span>
                            <span className="text-[0.625rem] text-ink-muted tabular-nums">
                              {complete ? (
                                <Check
                                  aria-hidden="true"
                                  className="size-3 text-mark-correct"
                                />
                              ) : (
                                `${done}/${total}`
                              )}
                            </span>
                          </span>
                        ) : null}
                      </span>
                      {total > 0 ? (
                        <span className="sr-only">
                          {done} of {total} exercises done
                        </span>
                      ) : null}
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
                    <SidebarMenuSub className="mt-0.5 mr-0 gap-0 border-layer-border pr-0">
                      {part.sections.map((section) => {
                        const active = isCurrent(section.href);
                        return (
                          <SidebarMenuSubItem key={section.id}>
                            <Link
                              href={section.href}
                              onClick={close}
                              aria-current={active ? "page" : undefined}
                              className={`-ml-px flex items-start gap-2 border-l-2 py-1.5 pl-3 text-sm transition ${
                                active
                                  ? "border-tone bg-tone-wash font-medium text-ink"
                                  : "border-transparent text-ink-muted hover:border-tone/40 hover:text-ink"
                              }`}
                            >
                              <span className="font-heading shrink-0 pt-px text-xs font-bold text-tone tabular-nums">
                                {section.id}
                              </span>
                              <span className="min-w-0 flex-1">
                                {section.title}
                              </span>
                              {section.exerciseIds.some(
                                (id) => progress[id],
                              ) ? (
                                <Check
                                  aria-hidden="true"
                                  className="mt-0.5 size-3.5 shrink-0 text-mark-correct"
                                />
                              ) : null}
                            </Link>
                          </SidebarMenuSubItem>
                        );
                      })}
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
