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
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
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
    Component.DesktopOnly(Component.Explorer({
        // see https://quartz.jzhao.xyz/features/explorer#advanced-customization
        filterFn: (node) => {
            if ((node.file?.frontmatter?.unlisted === true) || (node.file?.frontmatter?.tags?.includes("seedling") === true)) {
                return false
            } else {
                return true
            }
        },
        sortFn: (a, b) => {
            // if both are files or both are folders, sort by name
            if ((!a.file && !b.file) || (a.file && b.file)) {
                if (a.file?.frontmatter?.tags?.includes("evergreen")
                && !b.file?.frontmatter?.tags?.includes("evergreen")) {
                    return -1
                }
                if (!a.file?.frontmatter?.tags?.includes("evergreen")
                && b.file?.frontmatter?.tags?.includes("evergreen")) {
                    return 1
                }
                return a.displayName.localeCompare(b.displayName)
            }
            // not files (folders) come first
            if (a.file && !b.file) {
                return 1
            } else {
                return -1
            }
        },
    })),
    Component.DesktopOnly(Component.RecentNotes({
      limit: 5,
      showTags: false,
    })),
  ],
  right: [
    Component.Graph({
        localGraph: {
            depth: 2,
            showTags: false,
        },
        globalGraph: {
            showTags: false,
        },
    }),
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
    Component.DesktopOnly(Component.Explorer({
        // see https://quartz.jzhao.xyz/features/explorer#advanced-customization
        filterFn: (node) => {
            if ((node.file?.frontmatter?.unlisted === true) || (node.file?.frontmatter?.tags?.includes("seedling") === true)) {
                return false
            } else {
                return true
            }
        },
        sortFn: (a, b) => {
            // if both are files or both are folders, sort by name
            if ((!a.file && !b.file) || (a.file && b.file)) {
                if (a.file?.frontmatter?.tags?.includes("evergreen")
                && !b.file?.frontmatter?.tags?.includes("evergreen")) {
                    return -1
                }
                if (!a.file?.frontmatter?.tags?.includes("evergreen")
                && b.file?.frontmatter?.tags?.includes("evergreen")) {
                    return 1
                }
                return a.displayName.localeCompare(b.displayName)
            }
            // not files (folders) come first
            if (a.file && !b.file) {
                return 1
            } else {
                return -1
            }
        },
    })),
    Component.Search(),
    Component.Darkmode(),
  ],
  right: [],
}
