import {CHANGED_CLASS, isHighlighted, useHighlightMarks} from "./record_highlights.esm";
import {Field} from "@web/views/fields/field";
import {KanbanRecord} from "@web/views/kanban/kanban_record";
import {ListRenderer} from "@web/views/list/list_renderer";
import {patch} from "@web/core/utils/patch";

patch(Field.prototype, {
    setup() {
        super.setup(...arguments);
        this.recordHighlights = useHighlightMarks(this.props.record?.model);
    },

    get classNames() {
        const classNames = super.classNames;
        const {record, name} = this.props;
        // Only the form's own record: list cells and kanban cards carry the
        // mark on the cell or the card, and x2many lines are not compared.
        if (
            record?.model?.root === record &&
            isHighlighted(this.recordHighlights, record, name)
        ) {
            classNames[CHANGED_CLASS] = true;
        }
        return classNames;
    },
});

patch(ListRenderer.prototype, {
    setup() {
        super.setup(...arguments);
        this.recordHighlights = useHighlightMarks(this.props.list.model);
    },

    getCellClass(column, record) {
        const classNames = super.getCellClass(column, record);
        if (
            column.type === "field" &&
            isHighlighted(this.recordHighlights, record, column.name)
        ) {
            return `${classNames} ${CHANGED_CLASS}`;
        }
        return classNames;
    },
});

patch(KanbanRecord.prototype, {
    setup() {
        super.setup(...arguments);
        this.recordHighlights = useHighlightMarks(this.props.record.model);
    },

    getRecordClasses() {
        const classes = super.getRecordClasses();
        if (isHighlighted(this.recordHighlights, this.props.record)) {
            return `${classes} ${CHANGED_CLASS}`;
        }
        return classes;
    },
});
