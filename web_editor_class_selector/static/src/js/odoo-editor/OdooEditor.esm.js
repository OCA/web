/** @odoo-module **/
import {
    closestElement,
    getSelectedNodes,
    isVisibleTextNode,
} from "@web_editor/js/editor/odoo-editor/src/utils/utils";
import {OdooEditor} from "@web_editor/js/editor/odoo-editor/src/OdooEditor";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";

patch(OdooEditor.prototype, {
    _updateToolbar(show) {
        const res = super._updateToolbar(show);
        if (!this.toolbar || !this.custom_class_css) {
            return res;
        }
        const sel = this.document.getSelection();
        if (!this.isSelectionInEditable(sel)) {
            return res;
        }
        // Get selected nodes within td to handle non-p elements like h1, h2...
        // Targeting <br> to ensure span stays inside its corresponding block node.
        const selectedNodesInTds = [
            ...this.editable.querySelectorAll(".o_selected_td"),
        ].map((node) => closestElement(node).querySelector("br"));
        const selectedNodes = getSelectedNodes(this.editable).filter(
            (n) =>
                n.nodeType === Node.TEXT_NODE &&
                closestElement(n).isContentEditable &&
                isVisibleTextNode(n)
        );
        const selectedTextNodes = selectedNodes.length
            ? selectedNodes
            : selectedNodesInTds;
        let activeLabel = "";
        for (const selectedTextNode of selectedTextNodes) {
            const parentNode = selectedTextNode.parentElement;
            for (const customCss of this.custom_class_css) {
                const button = this.toolbar.querySelector("#" + customCss.class_name);
                if (button) {
                    const isActive = parentNode.classList.contains(
                        customCss.class_name
                    );
                    button.classList.toggle("active", isActive);

                    if (isActive) {
                        activeLabel = button.textContent;
                    }
                }
            }
        }
        // Show current class active in the toolbar
        // or remove active class if nothing is selected
        const styleSection = this.toolbar.querySelector("#custom_class");
        if (styleSection) {
            if (!activeLabel) {
                const css_selectors = this.toolbar.querySelectorAll(".css_selector");
                for (const node of css_selectors) {
                    node.classList.toggle("active", false);
                }
            }
            styleSection.querySelector("button span").textContent = activeLabel
                ? activeLabel
                : _t("Custom CSS");
        }
        return res;
    },
});
