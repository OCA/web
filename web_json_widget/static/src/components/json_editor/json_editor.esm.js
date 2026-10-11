// eslint-disable-next-line jsdoc/check-tag-names
/** @odoo-module **/

/* global JSONEditor */

/*
    Copyright 2025 Lambdao
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

import {Component, onMounted, onPatched, onWillUnmount, useRef} from "@odoo/owl";
import {_t} from "@web/core/l10n/translation";
import {cookie} from "@web/core/browser/cookie";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";

export class JsonEditorComponent extends Component {
    static template = "web_json_widget.JsonEditor";
    static components = {};
    static props = {
        ...standardFieldProps,
        // Placeholder: { type: String, optional: true },
    };
    static defaultProps = {};

    setup() {
        this.editor = null;
        this.editorRef = useRef("editor");
        this.resId = this.props.record.resId;
        this.resModel = this.props.record.resModel;
        this.value = this.props.record.data[this.props.name] || {};

        onMounted(() => {
            if (this.editorRef.el) {
                this.createEditor();
            }
        });

        onPatched(() => {
            if (
                this.resId !== this.props.record.resId ||
                this.resModel !== this.props.record.resModel
            ) {
                this.resId = this.props.record.resId;
                this.resModel = this.props.record.resModel;
                if (this.editor) {
                    this.editor.set(this.props.record.data[this.props.name] || {});
                }
            }
        });

        onWillUnmount(() => {
            if (this.editor) {
                this.editor.destroy();
            }
        });
    }

    createEditor() {
        // Ensure the target element exists and is a DOM element
        if (!this.editorRef.el || !(this.editorRef.el instanceof Element)) {
            console.error("Target element not available for JSON editor");
            return;
        }
        if (typeof JSONEditor === "undefined") {
            console.error("JSONEditor not available");
            return;
        }

        const isDarkMode = this.detect_dark_mode();
        if (isDarkMode) {
            this.editorRef.el.classList.add("json-editor-theme-dark");
        }

        const options = {
            mode: "tree",
            modes: ["tree", "text", "view"],
            onChange: () => {
                try {
                    const new_value = this.editor.get();
                    this.value = new_value;
                    this.props.record.update({[this.props.name]: new_value});
                } catch (error) {
                    console.error("Error updating JSON value:", error);
                    const msg = _t("Error updating JSON: ") + error.message;
                    this.env.services.notification.add(msg, {type: "danger"});
                }
            },
            onError: (error) => {
                console.error("JSON Editor error:", error);
            },
        };
        if (this.props.readonly) {
            options.mode = "view";
            options.modes = ["view"];
        }

        try {
            this.editor = new JSONEditor(this.editorRef.el, options);
            this.editor.set(this.value);
        } catch (error) {
            console.error("Failed to create JSON editor:", error);
        }
    }

    detect_dark_mode() {
        // Use system preference? It's kind of a code editor
        // const systemPrefersDark = window.matchMedia &&
        //     window.matchMedia('(prefers-color-scheme: dark)').matches;
        // if (systemPrefersDark) return true

        // this cookie method should work with OCA or enterprise UI
        return cookie.get("color_scheme") === "dark";
    }
}

export const JsonEditor = {
    component: JsonEditorComponent,
    displayName: _t("Json Editor"),
    supportedTypes: ["json"],
    // Improvements: add supportedOptions, ExtractProps...
};

registry.category("fields").add("json", JsonEditor);
