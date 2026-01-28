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
      "@glennklockwood.com": "https://bsky.app/profile/glennklockwood.com",
    },
  }),
}

function configuredExplorerComponent() {
  return Component.Explorer({
    // see https://quartz.jzhao.xyz/features/explorer#advanced-customization
    filterFn: (node) => {
      if (
        (node.data?.tags?.includes("seedling") === true)
        || (node.data?.tags?.includes("unlisted") === true)
        || ((node.displayName == "entities" && !node.data))
      ) {
        return false;
      } else {
        return true;
      }
    },
    sortFn: (a, b) => {
      // if both are files or both are folders, sort by name
      if ((!a.data && !b.data) || (a.data && b.data)) {
        if (a.data?.tags?.includes("evergreen")
          && !b.data?.tags?.includes("evergreen")) {
          return -1;
        }
        if (!a.data?.tags?.includes("evergreen")
          && b.data?.tags?.includes("evergreen")) {
          return 1;
        }
        return a.displayName.localeCompare(b.displayName);
      }
      // not files (folders) come first
      if (a.data && !b.data) {
        return 1;
      } else {
        return -1;
      }
    },
  });
}

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
    Component.Search(),
    configuredExplorerComponent(),
//  Component.DesktopOnly(Component.RecentNotes({limit: 5, showTags: false})),
  ],
  right: [
    Component.Graph({
      localGraph: { depth: 1, showTags: false, },
      globalGraph: { showTags: false, }
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
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
    Component.Search(),
    configuredExplorerComponent(),
  ],
  right: [],
}
