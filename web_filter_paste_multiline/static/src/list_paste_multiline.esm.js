import {List} from "@web/core/tree_editor/tree_editor_components";
import {patch} from "@web/core/utils/patch";

patch(List.prototype, {
    /**
     * When the user pastes multiline text into the input, split each non-empty
     * line into a separate tag value. Single lines are handled normally.
     */
    onPaste(ev) {
        const pastedText = ev.clipboardData.getData("text/plain");
        if (!pastedText) return;

        const lines = pastedText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((item) => item);

        // Single line is pasted, the input will handle it normally
        if (lines.length <= 1) return;

        ev.preventDefault();
        ev.stopPropagation();

        // Each line is created as a tag in the search
        this.props.update([...this.props.value, ...lines]);

        // Clear the input field so the pasted text does not appear, as it
        // is replaced by tags
        const input = ev.currentTarget.querySelector("input");
        if (input) {
            input.value = "";
        }
    },
});
