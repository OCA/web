import {closestElement} from "@html_editor/utils/dom_traversal";
import {formatsSpecs} from "@html_editor/utils/formatting";

// This function is called in the getEditorConfig method of the Wysiwyg class
// It generates the new formatsSpecs object with the custom CSS class
export function createCustomCssFormats(custom_class_css) {
    const newformatsSpecs = {};
    const class_names = custom_class_css.map((customCss) => customCss.class_name);
    const removeCustomClass = (node) => {
        for (const class_name of class_names) {
            node.classList.remove(class_name);
            if (node.parentElement) {
                node.parentElement.classList.remove(class_name);
            }
        }
    };
    for (const customCss of custom_class_css) {
        const className = customCss.class_name;
        newformatsSpecs[className] = {
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
    }
    Object.assign(formatsSpecs, newformatsSpecs);
}
