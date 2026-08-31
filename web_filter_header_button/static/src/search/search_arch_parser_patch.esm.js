import {SearchArchParser} from "@web/search/search_arch_parser";
import {patch} from "@web/core/utils/patch";
import {makeContext} from "@web/core/context";

patch(SearchArchParser.prototype, {
    /**
     * Allow groupBy filters to show up as buttons
     * @override
     */
    visitFilter(node) {
        var context_to_keep = false;
        if (node.hasAttribute("context")) {
            const context = makeContext([node.getAttribute("context")]);
            if (context.group_by && context.shown_in_panel) {
                context_to_keep = context;
            }
        }
        super.visitFilter(...arguments);
        if (context_to_keep) {
            this.currentGroup.at(-1).context = context_to_keep;
        }
    },
});
