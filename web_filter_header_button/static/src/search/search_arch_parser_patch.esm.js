import {SearchArchParser} from "@web/search/search_arch_parser";
import {makeContext} from "@web/core/context";
import {patch} from "@web/core/utils/patch";

patch(SearchArchParser.prototype, {
    /**
     * The core doesn't keep the context of groupBy filters. Keep it when it
     * has the `shown_in_panel` key so they can be shown as buttons too.
     *
     * @override
     */
    visitFilter(node) {
        let contextToKeep = false;
        if (node.hasAttribute("context")) {
            const context = makeContext([node.getAttribute("context")]);
            if (context.group_by && context.shown_in_panel) {
                contextToKeep = context;
            }
        }
        const lastItem = this.currentGroup.at(-1);
        super.visitFilter(...arguments);
        // The core may start a new group before adding the item or discard the
        // filter, so only patch the item when it has actually been added.
        const newItem = this.currentGroup.at(-1);
        if (contextToKeep && newItem && newItem !== lastItem) {
            newItem.context = contextToKeep;
        }
    },
});
