/* global JSONEditor */

import {Component, onMounted, onWillUnmount, useEffect, useRef} from "@odoo/owl";
import {registry} from "@web/core/registry";

/**
 * Generic JSON Editor Component
 *
 * A reusable component for editing JSON with schema-based validation and autocomplete.
 * Wraps the JSONEditor library (https://github.com/josdejong/jsoneditor)
 */
export class JsonEditorComponent extends Component {
    setup() {
        this.editorRef = useRef("editor");
        this.editor = null;

        onMounted(() => this.initEditor());
        onWillUnmount(() => this.destroyEditor());

        useEffect(
            () => {
                if (this.editor && this.props.value !== undefined) {
                    try {
                        const currentValue = this.editor.get();
                        // Avoid re-setting if the editor's current value is already what's in props.value
                        // This helps prevent potential cursor jumps or loss of intermediate (invalid) user input.
                        if (
                            JSON.stringify(currentValue) !==
                            JSON.stringify(this.props.value)
                        ) {
                            this.setValue(this.props.value);
                        }
                    } catch {
                        // If editor.get() fails (e.g. invalid JSON in 'code' mode), still try to set value from props.
                        this.setValue(this.props.value);
                    }
                }
            },
            // Dependency array: rerun effect if props.value changes
            () => [this.props.value]
        );

        // Update editor options when schema changes
        useEffect(
            () => {
                if (this.editor && this.props.schema) {
                    this.updateSchema(this.props.schema);
                }
            },
            () => [this.props.schema]
        );
    }

    initEditor() {
        if (!this.editorRef.el) return;

        // Default options
        const mode = this.props.mode || "code";
        const options = {
            mode: mode,
            modes: this.props.modes || [mode],
            search: this.props.search !== false,
            history: this.props.history !== false,
            indentation: this.props.indentation || 2,
            mainMenuBar: this.props.mainMenuBar !== false,
            navigationBar: this.props.navigationBar !== false,
            statusBar: this.props.statusBar !== false,
            colorPicker: this.props.colorPicker !== false,
            onChange: () => this.handleChange(),
            onValidationError: (errors) => this.handleValidationError(errors),
            onError: (error) => {
                if (this.props.onError) {
                    this.props.onError(error);
                }
            },
            allowSchemaSuggestions: this.props.allowSchemaSuggestions !== false,
        };

        // Add schema if provided
        if (this.props.schema) {
            options.schema = this.props.schema;
            options.schemaRefs = this.props.schemaRefs;
        }

        // Add autocomplete options if provided or generate from schema
        if (this.props.autocomplete) {
            options.autocomplete = this.props.autocomplete;
        } else if (this.props.schema) {
            options.autocomplete = this.generateAutocompleteOptions();
        }

        // Create editor
        this.editor = new JSONEditor(this.editorRef.el, options);

        // Set initial value
        if (this.props.value) {
            this.setValue(this.props.value);
        }
    }

    handleChange() {
        if (!this.props.onChange) return;

        this.editor
            .validate()
            .then((errors) => {
                const textValue = this.editor.getText();

                // Try to get JSON value
                let jsonValue = null;
                try {
                    jsonValue = this.editor.get();
                } catch {
                    // Invalid JSON - handled below
                }

                // Handle validation errors
                if (errors?.length > 0) {
                    if (this.props.onValidationError) {
                        this.props.onValidationError(errors);
                    }
                    this.props.onChange({
                        value: jsonValue || textValue,
                        isValid: false,
                        error: "Schema validation failed",
                        text: textValue,
                        validationErrors: errors,
                    });
                } else if (jsonValue === null) {
                    // No validation errors but invalid JSON
                    this.props.onChange({
                        value: textValue,
                        isValid: false,
                        error: "Invalid JSON",
                        text: textValue,
                    });
                } else {
                    // Valid JSON, no validation errors
                    this.props.onChange({
                        value: jsonValue,
                        isValid: true,
                        text: textValue,
                    });
                }
            })
            .catch((e) => {
                // Handle all promise rejections
                const textValue = this.editor?.getText?.() || "";
                this.props.onChange({
                    value: textValue,
                    isValid: false,
                    error: e.message || "Validation error",
                    text: textValue,
                });
            });
    }

    handleValidationError(errors) {
        if (this.props.onValidationError) {
            this.props.onValidationError(errors);
        }
    }

    updateSchema(schema) {
        if (!this.editor || !schema) return;

        try {
            this.editor.setSchema(schema, this.props.schemaRefs);

            // Update autocomplete if using schema-based suggestions
            if (
                this.props.allowSchemaSuggestions !== false &&
                !this.props.autocomplete
            ) {
                // Generate autocomplete options for future use
                this.generateAutocompleteOptions();
                // Note: JSONEditor doesn't have a direct method to update autocomplete options
                // A full reinitialize would be needed, which might disrupt user experience
            }
        } catch (e) {
            console.error("Error setting JSON schema:", e);
            if (this.props.onError) {
                this.props.onError(e);
            }
        }
    }

    generateAutocompleteOptions() {
        // If no schema is provided, return default autocomplete (empty)
        if (!this.props.schema) return {};

        const schema = this.props.schema;

        return {
            filter: "start",
            trigger: "key",
            getOptions: function (text, path, input) {
                // For root level suggestions in an object
                if (path.length === 0 && schema.properties && input === "field") {
                    return Object.keys(schema.properties).map((key) => {
                        const prop = schema.properties[key];
                        const description = prop.description || key;
                        return {
                            text: key,
                            value: key,
                            title: description,
                        };
                    });
                }

                // For enum fields, suggest possible values
                if (path.length > 0 && input === "value") {
                    // Try to find the schema definition for this path
                    let currentSchema = schema;
                    const currentPath = [];

                    // Navigate to the current schema position
                    for (const segment of path) {
                        currentPath.push(segment);

                        if (
                            currentSchema.properties &&
                            currentSchema.properties[segment]
                        ) {
                            currentSchema = currentSchema.properties[segment];
                        } else if (currentSchema.items) {
                            // Array items
                            currentSchema = currentSchema.items;
                        } else {
                            // Can't find schema for this path
                            currentSchema = null;
                            break;
                        }
                    }

                    // If we have enum values, suggest them
                    if (currentSchema && currentSchema.enum) {
                        return currentSchema.enum.map((value) => {
                            const valueStr =
                                typeof value === "string"
                                    ? `"${value}"`
                                    : String(value);
                            return {
                                text: valueStr,
                                value: valueStr,
                                title: valueStr,
                            };
                        });
                    }

                    // If we have examples, suggest them
                    if (
                        currentSchema &&
                        currentSchema.examples &&
                        currentSchema.examples.length
                    ) {
                        return currentSchema.examples.map((value) => {
                            const valueStr =
                                typeof value === "string"
                                    ? `"${value}"`
                                    : String(value);
                            return {
                                text: valueStr,
                                value: valueStr,
                                title: `Example: ${valueStr}`,
                            };
                        });
                    }
                }

                return null;
            },
        };
    }

    setValue(value) {
        if (!this.editor) return;

        try {
            if (typeof value === "string") {
                this.editor.setText(value);
            } else {
                this.editor.set(value);
            }
        } catch (e) {
            console.error("Error setting JSON value:", e);
            if (this.props.onError) {
                this.props.onError(e);
            }
        }
    }

    /**
     * Validate the current JSON against the schema
     * @returns {Promise<Array>} Promise resolving to an array of validation errors
     */
    async validate() {
        if (!this.editor) {
            return Promise.resolve([]);
        }
        return this.editor.validate();
    }

    /**
     * Get the current JSON value
     * @returns {Object} The current JSON value
     * @throws {Error} If the JSON is invalid
     */
    getValue() {
        if (!this.editor) return null;
        return this.editor.get();
    }

    /**
     * Get the current JSON as text
     * @returns {String} The current JSON as text
     */
    getTextValue() {
        if (!this.editor) return "";
        return this.editor.getText();
    }

    /**
     * Set focus to the editor
     */
    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }

    destroyEditor() {
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    }
}

JsonEditorComponent.template = "web_widget_json_editor.JsonEditorComponent";
JsonEditorComponent.props = {
    value: {type: [Object, String], optional: true},
    onChange: {type: Function, optional: true},
    onError: {type: Function, optional: true},
    onValidationError: {type: Function, optional: true},
    height: {type: String, optional: true, default: "400px"},
    mode: {type: String, optional: true, default: "code"},
    modes: {type: Array, optional: true},
    schema: {type: Object, optional: true},
    schemaRefs: {type: Object, optional: true},
    search: {type: Boolean, optional: true, default: true},
    history: {type: Boolean, optional: true, default: true},
    indentation: {type: Number, optional: true, default: 2},
    mainMenuBar: {type: Boolean, optional: true, default: true},
    navigationBar: {type: Boolean, optional: true, default: true},
    statusBar: {type: Boolean, optional: true, default: true},
    colorPicker: {type: Boolean, optional: true, default: true},
    allowSchemaSuggestions: {type: Boolean, optional: true, default: true},
    autocomplete: {type: Object, optional: true},
};

// Register the component
registry.category("components").add("json_editor", JsonEditorComponent);
