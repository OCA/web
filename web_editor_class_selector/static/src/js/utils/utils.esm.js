import {closestElement} from "@html_editor/utils/dom_traversal";

export function createCustomCssFormats(custom_class_css) {
  const classNames = custom_class_css.map((customCss) => customCss.class_name);
  const removeCustomClass = (node) => {
    const parent = node.parentElement;
    for (const element of [node, parent]) {
      if (!element?.classList) {
        continue;
      }
      for (const className of classNames) {
        element.classList.remove(className);
      }
      if (!element.classList.length) {
        element.removeAttribute("class");
      }
    }
    if (parent?.tagName === "SPAN" && parent.attributes.length === 0) {
      parent.replaceWith(...parent.childNodes);
    }
  };
  return custom_class_css.map((customCss) => {
    const className = customCss.class_name;
    return {
      id: className,
      tagName: "span",
      isFormatted: (node) => closestElement(node).classList.contains(className),
      isTag: (node) =>
        ["SPAN"].includes(node.tagName) && node.classList.contains(className),
      hasStyle: (node) => closestElement(node).classList.contains(className),
      addStyle: (node) => {
        removeCustomClass(node);
        node.classList.add(className);
      },
      addNeutralStyle: (node) => removeCustomClass(node),
      removeStyle: (node) => removeCustomClass(node),
    };
  });
}
