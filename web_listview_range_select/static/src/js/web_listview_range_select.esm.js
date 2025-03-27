/* eslint no-undef: 0 */
import {ListRenderer} from "@web/views/list/list_renderer";
import {patch} from "@web/core/utils/patch";

export const RangeListSelector = {
    setup() {
        super.setup(...arguments);
        this.range_history = [];
    },
    _getRangeSelection() {
        var self = this;
        // Get start and end
        var start = null,
            end = null;
        const checkboxes = document.querySelectorAll(".o_list_record_selector input");
        checkboxes.forEach((el, i) => {
            const id = el.closest("tr").dataset.id;
            var checked = self.range_history.indexOf(id) !== -1;
            if (checked && el.checked) {
                if (start === null) {
                    start = i;
                } else {
                    end = i;
                }
            }
        });
        const new_range = this._getSelectionByRange(start, end);
        const current_selection = [...new Set(new_range)];
        return current_selection;
    },
    _getSelectionByRange(start, end) {
        var result = [];
        document.querySelectorAll(".o_list_record_selector input").forEach((el, i) => {
            const recordId = el.closest("tr").dataset.id;
            if (
                (start !== null && end !== null && i >= start && i <= end) ||
                (start !== null && end === null && start === i)
            ) {
                result.push(recordId);
            }
        });
        return result;
    },
    _pushRangeHistory(id) {
        if (this.range_history !== undefined) {
            if (this.range_history.length === 2) {
                this.range_history = [];
            }
        }
        this.range_history.push(id);
    },
    _deselectTable() {
        // This is needed because the checkboxes are not real checkboxes.
        window.getSelection().removeAllRanges();
    },
    _onClickSelectRecord(record, ev) {
        const el = ev.currentTarget;
        if (el.querySelector("input").checked) {
            this._pushRangeHistory(el.closest("tr").dataset.id);
        }
        if (ev.shiftKey) {
            // Get selection
            var selection = this._getRangeSelection();
            document
                .querySelectorAll("td.o_list_record_selector input")
                .forEach((checkbox) => {
                    const record_id = checkbox.closest("tr").dataset.id;
                    if (selection.indexOf(record_id) !== -1) {
                        checkbox.checked = true;
                    }
                });
            // Update selection internally
            this.checkBoxSelections(selection);
            this._deselectTable();
        }
    },
    checkBoxSelections(selection) {
        const record = this.props.list.records;
        for (const line in record) {
            for (const id in selection) {
                if (selection[selection.length - 1] === selection[id]) {
                    continue;
                }
                if (selection[id] === record[line].id) {
                    record[line].selected = true;
                    continue;
                }
            }
        }
        this.render();
    },
};
patch(ListRenderer.prototype, RangeListSelector);
