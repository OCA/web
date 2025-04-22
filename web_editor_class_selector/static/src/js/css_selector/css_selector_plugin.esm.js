import {CssSelector} from "./css_selector.esm";
import {Plugin} from "@html_editor/plugin";
import {_t} from "@web/core/l10n/translation";
import {reactive} from "@odoo/owl";
import {closestElement} from "@html_editor/utils/dom_traversal";
import {isVisibleTextNode} from "@html_editor/utils/dom_info";
import {withSequence} from "@html_editor/utils/resource";

export class CssSelectorPlugin extends Plugin {
    static id = "css_selector_plugin";
    static dependencies = ["selection", "format"];
    resources = {
        toolbar_groups: [withSequence(60, {id: "css-selector"})],
        toolbar_items: [
            {
                id: "css-selector",
                groupId: "css-selector",
                title: _t("Custom CSS"),
                Component: CssSelector,
                props: {
                    getItems: () => this.custom_class_css,
                    getDisplay: () => this.custom_css,
                    onSelected: (item) => {
                        this.dependencies.format.formatSelection(item.class_name, {
                            formatProps: {className: item.class_name},
                            applyStyle: true,
                        });
                        this.updateCustomCssSelectorParams();
                    },
                },
            },
        ],
        /** Handlers */
        selectionchange_handlers: [this.updateCustomCssSelectorParams.bind(this)],
        post_undo_handlers: [this.updateCustomCssSelectorParams.bind(this)],
        post_redo_handlers: [this.updateCustomCssSelectorParams.bind(this)],
    };

    setup() {
        this.custom_css = reactive({displayName: this.defaultCustomCssName});
        this.custom_class_css = this.config.custom_class_css;
    }
    updateCustomCssSelectorParams() {
        this.custom_css.displayName = this.customCssName;
    }
    get defaultCustomCssName() {
        return _t("Custom CSS");
    }
    get customCssName() {
        const selectedNodes = this.dependencies.selection
            .getSelectedNodes()
            .filter(
                (n) =>
                    n.nodeType === Node.TEXT_NODE &&
                    closestElement(n).isContentEditable &&
                    isVisibleTextNode(n)
            );
        let activeLabel = this.defaultCustomCssName;
        for (const selectedTextNode of selectedNodes) {
            const parentNode = selectedTextNode.parentElement;
            for (const customCss of this.custom_class_css) {
                const isActive = parentNode.classList.contains(customCss.class_name);
                if (isActive) {
                    activeLabel = customCss.name;
                    break;
                }
            }
        }
        return activeLabel;
    }
}
