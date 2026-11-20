/** @odoo-module **/
/* Copyright 2025 Yves Goldberg (Ygol InternetWork)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {Component, onMounted, onPatched, onWillUnmount, useRef} from "@odoo/owl";
import {_lt} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";
import {useBus} from "@web/core/utils/hooks";

export class MarkdownField extends Component {
    setup() {
        this.containerRef = useRef("container");
        this.editor = null;
        this.viewer = null;
        this._lastReadonly = null;

        onMounted(() => {
            this._updateMode();
        });

        onPatched(() => {
            this._updateMode();
        });

        onWillUnmount(() => {
            this._destroyEditor();
            this._destroyViewer();
        });

        useBus(this.env.bus, "RELATIONAL_MODEL:WILL_SAVE_URGENTLY", () =>
            this.commitChanges()
        );
        useBus(this.env.bus, "RELATIONAL_MODEL:NEED_LOCAL_CHANGES", ({detail}) =>
            detail.proms.push(this.commitChanges())
        );
    }

    _updateMode() {
        const container = this.containerRef.el;
        if (!container) {
            return;
        }

        const isReadonly = this.props.readonly;

        // Check if mode changed
        if (this._lastReadonly === isReadonly) {
            // Mode didn't change, just update content if needed
            if (isReadonly && this.viewer) {
                this.viewer.setMarkdown(this.props.value || "");
            } else if (!isReadonly && this.editor) {
                const currentValue = this.editor.getMarkdown();
                const newValue = this.props.value || "";
                if (currentValue !== newValue) {
                    this.editor.setMarkdown(newValue);
                }
            }
            return;
        }

        // Mode changed, rebuild the component
        this._lastReadonly = isReadonly;

        if (isReadonly) {
            this._destroyEditor();
            this._initViewer();
        } else {
            this._destroyViewer();
            this._initEditor();
        }
    }

    _initViewer() {
        const container = this.containerRef.el;
        if (!container) {
            return;
        }

        const Editor = window.toastui && window.toastui.Editor;
        if (!Editor) {
            console.error("Toast UI Editor not loaded");
            return;
        }

        this._destroyViewer();

        this.viewer = Editor.factory({
            el: container,
            viewer: true,
            initialValue: this.props.value || "",
        });

        // Auto-height for viewer - no fixed height constraint
        const viewerEl = container.querySelector(".toastui-editor-contents");
        if (viewerEl) {
            viewerEl.style.minHeight = "50px";
        }
    }

    _destroyViewer() {
        if (this.viewer) {
            this.viewer.destroy();
            this.viewer = null;
        }
    }

    _initEditor() {
        const container = this.containerRef.el;
        if (!container) {
            return;
        }

        const Editor = window.toastui && window.toastui.Editor;
        if (!Editor) {
            console.error("Toast UI Editor not loaded");
            return;
        }

        this._destroyEditor();

        // Use auto height with min-height, or fixed height if specified
        const height = this.props.height || "auto";
        const minHeight = this.props.minHeight || "200px";

        const options = {
            el: container,
            height: height,
            minHeight: minHeight,
            initialEditType: this.props.initialEditType || "markdown",
            previewStyle: "tab",
            initialValue: this.props.value || "",
            usageStatistics: false,
            hideModeSwitch: Boolean(this.props.hideModeSwitch),
            toolbarItems: this._getToolbarItems(),
            placeholder: this.props.placeholder || "",
            autofocus: false,
            events: {
                blur: () => this.commitChanges(),
            },
        };

        if (this.props.language) {
            options.language = this.props.language;
        }

        this.editor = new Editor(options);
    }

    _destroyEditor() {
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    }

    _getToolbarItems() {
        return [
            ["heading", "bold", "italic", "strike"],
            ["hr", "quote"],
            ["ul", "ol", "task", "indent", "outdent"],
            ["table", "image", "link"],
            ["code", "codeblock"],
        ];
    }

    commitChanges() {
        if (!this.props.readonly && this.editor) {
            const value = this.editor.getMarkdown();
            if ((this.props.value || "") !== value) {
                return this.props.update(value);
            }
        }
    }
}

MarkdownField.template = "web_widget_markdown_editor.MarkdownField";
MarkdownField.props = {
    ...standardFieldProps,
    height: {type: String, optional: true},
    minHeight: {type: String, optional: true},
    initialEditType: {type: String, optional: true},
    previewStyle: {type: String, optional: true},
    hideModeSwitch: {type: Boolean, optional: true},
    placeholder: {type: String, optional: true},
    language: {type: String, optional: true},
};

MarkdownField.defaultProps = {
    height: "auto",
    minHeight: "200px",
    initialEditType: "markdown",
    previewStyle: "vertical",
    hideModeSwitch: false,
};

MarkdownField.displayName = _lt("Markdown Editor");
// Reason: an html field is sanitized on save (the Markdown gets wrapped in
// <p>), so the widget only stores Markdown in text fields.
MarkdownField.supportedTypes = ["text"];

MarkdownField.extractProps = ({attrs}) => {
    const options = attrs.options || {};
    return {
        height: options.height,
        minHeight: options.minHeight || options.min_height,
        initialEditType: options.initialEditType || options.initial_edit_type,
        previewStyle: options.previewStyle || options.preview_style,
        hideModeSwitch: options.hideModeSwitch || options.hide_mode_switch,
        placeholder: attrs.placeholder || options.placeholder,
        language: options.language,
    };
};

registry.category("fields").add("markdown", MarkdownField);

export default MarkdownField;
