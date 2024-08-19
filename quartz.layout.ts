import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      "glennklockwood.com": "https://glennklockwood.com",
      "@glennklockwood": "https://mast.hpc.social/@glennklockwood",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta({showReadingTime: false}),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Search(),
    Component.Darkmode(),
  ],
  right: [
    Component.Graph({localGraph: {depth: 2}}),
    Component.Backlinks(),
//  Component.RecentNotes({
//    title: "Recent changes",
//    limit: 5,
//    showTags: false,
//  }),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta()
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.DesktopOnly(Component.Explorer()),
    Component.Search(),
    Component.Darkmode(),
  ],
  right: [],
}
