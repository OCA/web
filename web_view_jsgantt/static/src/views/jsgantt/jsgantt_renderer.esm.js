/** @odoo-module **/

import {Component, onMounted, onWillRender, useRef} from "@odoo/owl";

const JSGantt = window.JSGantt;

const DEFAULT_TIME_FORMAT = "day";

const FIELDS_MAPPING = [
    ["pName", "name"],
    ["pStart", "start_date"],
    ["pEnd", "end_date"],
    ["pPlanStart", "plan_start_date"],
    ["pPlanEnd", "plan_end_date"],
    ["pMile", "is_milestone", "integer"],
    ["pRes", "resource_id", "many2one_str"],
    ["pComp", "completion", "percent"],
    ["pGroup", "is_parent", "integer"],
    ["pParent", "parent_id", "many2one_id"],
    ["pOpen", "is_expanded", "integer"],
    ["pDepend", "dependency_ids", "many2many"],
    ["pCaption", "caption"],
    ["pNotes", "notes"],
    ["pCost", "cost"],
    ["pBarText", "bar_text"],
];

const FIELD_COLUMN_DISPLAY_FUNCTIONS = {
    start_date: "setShowStartDate",
    end_date: "setShowEndDate",
    plan_start_date: "setShowPlanStartDate",
    plan_end_date: "setShowPlanEndDate",
    resource_id: "setShowRes",
    completion: "setShowComp",
    cost: "setShowCost",
};

const FIELD_TASK_INFO_DISPLAY_FUNCTIONS = {
    start_date: "setShowTaskInfoStartDate",
    end_date: "setShowTaskInfoEndDate",
    resource_id: "setShowTaskInfoRes",
    completion: "setShowTaskInfoComp",
    notes: "setShowTaskInfoNotes",
};

const FIELD_TRANSLATION_NAMES = {
    resource_id: "res",
    // "comp" is used in the column title while "completion" is used in the
    // task info.
    completion: ["comp", "completion"],
    start_date: "startdate",
    end_date: "enddate",
    plan_start_date: "planstartdate",
    plan_end_date: "planenddate",
    cost: "cost",
};

const TASK_CLASSES = [
    "gtaskblue",
    "gtaskred",
    "gtaskgreen",
    "gtaskyellow",
    "gtaskpurple",
    "gtaskpink",
];

const CAPTION_TYPE_MAPPING = {
    none: "None",
    caption: "Caption",
    resource_id: "Resource",
    duration: "Duration",
    completion: "Complete",
};

const GROUP_TASK_CLASS = "ggroupblack";
const MILESTONE_CLASS = "gmilestone";

export class JSGanttRenderer extends Component {
    setup() {
        this.ganttDiv = useRef("jsgantt-div");
        this.chart = null;
        onMounted(() => {
            this.setupChart();
            this.setTasks();
            this.chart.Draw();
        });
        onWillRender(() => {
            this.updateChart();
        });
    }

    setupChart() {
        let timeFormat = this.props.archInfo.timeFormat;
        if (!timeFormat) {
            timeFormat = DEFAULT_TIME_FORMAT;
        }
        this.chart = new JSGantt.GanttChart(this.ganttDiv.el, timeFormat);
        this.chart.setEventClickRow((task) => this.rowClicked(task));
        const showDuration = this.props.archInfo.showDuration;
        this.chart.setShowDur(Number(showDuration));
        this.chart.setShowTaskInfoDur(Number(showDuration));
        const captionType = CAPTION_TYPE_MAPPING[this.props.archInfo.captionType];
        if (captionType !== undefined) {
            this.chart.setCaptionType(captionType);
        }
        // FIXME: use a cleaner way to set the language
        const lang = this.env.searchModel._context.lang.substring(0, 2);
        this.chart.setLang(lang);
        this.processFields(this.props.archInfo.fieldNodes, lang);
    }

    async rowClicked(task) {
        await this.props.openRecord({resId: parseInt(task.getOriginalID(), 10)});
    }

    processFields(fieldNodes, lang) {
        const fieldsMapping = {};
        const defaultLangTerms = this.chart.vLangs[lang];
        const langTerms = {};
        if (defaultLangTerms !== undefined) {
            for (const [key, value] of Object.entries(defaultLangTerms)) {
                langTerms[key] = value;
            }
        }
        for (const field of Object.values(fieldNodes)) {
            this.processField(field, fieldsMapping, langTerms);
        }
        // Hide unused fields
        for (const [, mappingField] of FIELDS_MAPPING) {
            if (fieldsMapping[mappingField] === undefined) {
                this.setFieldVisible(mappingField, false);
            }
        }
        if (this.chart.vLang === "en") {
            // This is a workaround to allow to modify the english language
            // terms. Just calling setCustomLang() does not work because it
            // would start by deleting the current terms before iterating on
            // them.
            this.chart.vLang = "en_";
            this.chart.setCustomLang(langTerms);
            this.chart.vLangs.en = this.chart.vLangs.en_;
            delete this.chart.vLangs.en_;
            this.chart.vLang = "en";
        } else {
            this.chart.setCustomLang(langTerms);
        }
        this.fieldsMapping = fieldsMapping;
    }

    processField(field, fieldsMapping, langTerms) {
        const mapping = field.rawAttrs.mapping;
        if (mapping === undefined) {
            return;
        }
        fieldsMapping[mapping] = field.name;
        this.setFieldVisible(mapping, !field.modifiers.invisible);
        const fieldTranslationName = FIELD_TRANSLATION_NAMES[mapping];
        if (fieldTranslationName === undefined) {
            return;
        }
        if (Array.isArray(fieldTranslationName)) {
            for (const f of fieldTranslationName) {
                langTerms[f] = field.string;
            }
        } else {
            langTerms[fieldTranslationName] = field.string;
        }
    }

    setFieldVisible(mappingField, visible) {
        const colDisplayFunc = FIELD_COLUMN_DISPLAY_FUNCTIONS[mappingField];
        if (colDisplayFunc !== undefined) {
            this.chart[colDisplayFunc](Number(visible));
        }
        const taskInfoDisplayFunc = FIELD_TASK_INFO_DISPLAY_FUNCTIONS[mappingField];
        if (taskInfoDisplayFunc !== undefined) {
            this.chart[taskInfoDisplayFunc](Number(visible));
        }
    }

    setTasks() {
        const fieldsMapping = this.fieldsMapping;
        for (const record of this.props.list.records) {
            const task = {
                pID: record.resId,
            };
            // FIXME: improve this: loop only over the actually used fields
            // instead of on all the possible mapped fields.
            for (const [jsTaskField, mappingField, fieldType] of FIELDS_MAPPING) {
                const fieldName = fieldsMapping[mappingField];
                if (fieldName === undefined) {
                    continue;
                }
                let value = record.data[fieldName];
                switch (fieldType) {
                    case "many2one_str":
                        if (value) {
                            value = value[1];
                        } else {
                            value = "";
                        }
                        break;
                    case "many2one_id":
                        if (value) {
                            value = value[0];
                        } else {
                            value = 0;
                        }
                        break;
                    case "many2many":
                        value = value.currentIds;
                        break;
                    case "percent":
                        value *= 100;
                        break;
                    case "integer":
                        value = Number(value);
                        break;
                    default:
                        if (!value) {
                            // This is needed to avoid displaying "false" as
                            // notes in the task info.
                            value = "";
                        }
                }
                task[jsTaskField] = value;
            }
            task.pClass = this.computeTaskClass(task);
            this.chart.AddTaskItemObject(task);
        }
    }

    computeTaskClass(task) {
        if (task.pGroup > 0) {
            return GROUP_TASK_CLASS;
        } else if (task.pMile === 1) {
            return MILESTONE_CLASS;
        }
        return TASK_CLASSES[task.pID % TASK_CLASSES.length];
    }

    updateChart() {
        if (this.chart === null) {
            return;
        }
        this.chart.ClearTasks();
        this.chart.Draw();
        this.setTasks();
        this.chart.Draw();
    }
}

JSGanttRenderer.template = "web_view_jsgantt.JSGanttRenderer";
