import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default ((components?: QuartzComponent[]) => {
  if (components && components.length > 0) {
    const FlexContainer: QuartzComponent = (props: QuartzComponentProps) => {
      return (
        <div className="FlexContainer">
        <>
          {components.map((Component, index) => (
            <Component key={index} {...props} />
          ))}
        </>
        </div>
      )
    }

    FlexContainer.displayName = "FlexContainerWrapper"
    //FlexContainer.afterDOMLoaded = components.some(component => component?.afterDOMLoaded) ? () => components.forEach(component => component?.afterDOMLoaded?.()) : undefined
    //FlexContainer.beforeDOMLoaded = components.some(component => component?.beforeDOMLoaded) ? () => components.forEach(component => component?.beforeDOMLoaded?.()) : undefined
    //FlexContainer.css = components.flatMap(component => component?.css || []).join(";\n")
    const cssArray = components.flatMap(component => component?.css || []).filter(css => css && css.trim() !== "")
    console.log("CSS Array:", cssArray.join(";"))
    // the following causes everything to break. not sure why
    //FlexContainer.css = cssArray.join(";")

    return FlexContainer
  } else {
    return () => <></>
  }
}) satisfies QuartzComponentConstructor