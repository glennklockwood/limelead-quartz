import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import * as ExternalPlugin from "./.quartz/plugins"

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()

// Advanced explorer customization — filter/sort can't be expressed in YAML
ExternalPlugin.Explorer({
  filterFn: (node) => {
    if (
      node.data?.tags?.includes("seedling") === true ||
      node.data?.tags?.includes("unlisted") === true ||
      (node.displayName === "entities" && !node.data)
    ) {
      return false
    }
    return true
  },
  sortFn: (a, b) => {
    // folders and files sort separately; within each group, evergreen notes float to top
    if ((!a.data && !b.data) || (a.data && b.data)) {
      if (a.data?.tags?.includes("evergreen") && !b.data?.tags?.includes("evergreen")) return -1
      if (!a.data?.tags?.includes("evergreen") && b.data?.tags?.includes("evergreen")) return 1
      return a.displayName.localeCompare(b.displayName)
    }
    return a.data ? 1 : -1
  },
})
