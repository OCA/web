/* global JSONEditor */

import {Component, onMounted, onWillUnmount, useEffect, useRef} from "@odoo/owl";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";

/**
 * Simple JSON formatter for display mode
 * @param {*} value - Value to format as JSON
 * @returns {String} Formatted JSON string
 */
export function formatJSON(value) {
    if (!value) return "";
    try {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        return JSON.stringify(parsed, null, 2);
    } catch (e) {
        console.error("Error formatting JSON:", e);
        return String(value);
    }
}

/**
 * JSON Editor Field Component
 */
export class JsonEditorField extends Component {
    setup() {
        this.editorRef = useRef("editor");
        this.editor = null;
        // Track if user is currently editing
        this.isDirty = false;

        onMounted(() => this.initEditor());
        onWillUnmount(() => this.destroyEditor());

        // Update editor when field value changes (similar to useInputField hook)
        useEffect(() => {
            // Get current value from record
            let value = this.props.record.data[this.props.name];

            // Only update if editor exists, user is not editing, and field is valid
            if (
                this.editor &&
                !this.isDirty &&
                !this.props.record.isFieldInvalid(this.props.name)
            ) {
                // Parse value if it's a string
                if (!value) {
                    value = {};
                } else if (typeof value === "string") {
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        console.warn("Failed to parse JSON string:", e);
                        value = {};
                    }
                }

                // Only update if value actually changed
                try {
                    const currentValue = this.editor.get();
                    if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
                        this.editor.set(value);
                    }
                } catch {
                    // If editor.get() fails, force set the new value
                    this.editor.set(value);
                }
            }
        });
    }

    initEditor() {
        if (!this.editorRef.el) return;

        // Initialize JSONEditor with options
        const options = {
            mode: this.props.readonly ? "view" : "code",
            modes: ["code", "view"],
            search: true,
            history: true,
            navigationBar: true,
            statusBar: true,
            mainMenuBar: true,
            onChange: () => {
                if (!this.props.readonly) {
                    // Mark as dirty when user edits
                    this.isDirty = true;
                    this.onEditorChange();
                }
            },
        };

        // Apply any additional options from nodeOptions
        if (this.props.nodeOptions) {
            const editorOptions = this.props.nodeOptions.editor_options || {};
            Object.assign(options, editorOptions);
        }

        // Add schema for autocomplete if available
        if (this.props.nodeOptions?.schema) {
            try {
                options.schema =
                    typeof this.props.nodeOptions.schema === "string"
                        ? JSON.parse(this.props.nodeOptions.schema)
                        : this.props.nodeOptions.schema;
            } catch (e) {
                console.warn("Invalid JSON schema:", e);
            }
        }

        // Create editor instance
        this.editor = new JSONEditor(this.editorRef.el, options);

        // Set initial value - use record.data like Odoo's standard fields
        let value = this.props.record.data[this.props.name];

        if (!value) {
            value = {};
        } else if (typeof value === "string") {
            try {
                value = JSON.parse(value);
            } catch (e) {
                console.warn("Failed to parse JSON string:", e);
                value = {};
            }
        }

        this.editor.set(value);
    }

    /**
     * Format the value for display mode
     * @returns {String} Formatted JSON string for display
     */
    formatValue() {
        const value = this.props.record.data[this.props.name];
        if (!value) return "{}";

        if (typeof value === "string") {
            try {
                // Try to parse if it's a JSON string
                return formatJSON(JSON.parse(value));
            } catch {
                return value;
            }
        }

        return formatJSON(value);
    }

    /**
     * Handle changes from the JSON editor
     */
    onEditorChange() {
        // Get value from JSONEditor as a JavaScript object
        const jsonValue = this.editor.get();

        // Handle different field types
        if (this.props.record.fields[this.props.name].type === "json") {
            // For JSON fields, pass the object directly
            this.props.record.update({[this.props.name]: jsonValue});
        } else {
            // For text and char fields, convert to a JSON string
            const stringValue = JSON.stringify(jsonValue);
            this.props.record.update({[this.props.name]: stringValue});
        }

        // Reset dirty flag after update
        this.isDirty = false;
    }

    /**
     * Clean up the editor when component is unmounted
     */
    destroyEditor() {
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    }
}

JsonEditorField.template = "web_widget_json_editor.JsonEditorField";
JsonEditorField.props = {
    ...standardFieldProps,
    readonly: {type: Boolean, optional: true},
};

// Register the field widget (Odoo 18.0 format)
registry.category("fields").add("json_editor", {
    component: JsonEditorField,
    supportedTypes: ["text", "char", "json"],
});
