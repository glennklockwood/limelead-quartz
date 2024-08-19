import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default ((components?: QuartzComponent[]) => {
  if (components && components.length > 0) {
    const DesktopOnly: QuartzComponent = (props: QuartzComponentProps) => {
      return (
        <div style="flex: 1; flex-direction: column">
        <>
          {components.map((Component, index) => (
            <Component key={index} {...props} />
          ))}
        </>
        </div>
      )
    }

    DesktopOnly.displayName = "DesktopOnlyWrapper"
    //DesktopOnly.afterDOMLoaded = components.some(component => component?.afterDOMLoaded) ? () => components.forEach(component => component?.afterDOMLoaded?.()) : undefined
    //DesktopOnly.beforeDOMLoaded = components.some(component => component?.beforeDOMLoaded) ? () => components.forEach(component => component?.beforeDOMLoaded?.()) : undefined
    //DesktopOnly.css = components.flatMap(component => component?.css || [])

    return DesktopOnly
  } else {
    return () => <></>
  }
}) satisfies QuartzComponentConstructor