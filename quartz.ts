import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import * as ExternalPlugin from "./.quartz/plugins"

// Must be registered before loadQuartzLayout() resolves the layout
ExternalPlugin.Explorer({
  filterFn: (node) => {
    if (
      node.data?.tags?.includes("seedling") === true ||
      node.data?.tags?.includes("unlisted") === true ||
      (node.displayName === "entities" && node.isFolder)
    ) {
      return false
    }
    return true
  },
  sortFn: (a, b) => {
    // folders and files sort separately; within each group, evergreen notes float to top
    if (a.isFolder === b.isFolder) {
      if (a.data?.tags?.includes("evergreen") && !b.data?.tags?.includes("evergreen")) return -1
      if (!a.data?.tags?.includes("evergreen") && b.data?.tags?.includes("evergreen")) return 1
      return a.displayName.localeCompare(b.displayName)
    }
    return a.isFolder ? -1 : 1
  },
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
