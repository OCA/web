/** @odoo-module **/
/* Copyright 2026 Yves Goldberg (Ygol InternetWork)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
/* global QUnit */

import {clickSave, getFixture, patchWithCleanup} from "@web/../tests/helpers/utils";
import {makeView, setupViewRegistries} from "@web/../tests/views/helpers";
import {MarkdownField} from "@web_widget_markdown_editor/js/markdown_field.esm";
import {makeFakeNotificationService} from "@web/../tests/helpers/mock_services";
import {registry} from "@web/core/registry";
import {FormController} from "@web/views/form/form_controller";

// Reason: modules installed next to this one (e.g. web_refresh_from_backend)
// make every form controller use these services, absent from the test registry.
const fakeBusService = {
    start() {
        return {
            addChannel: () => undefined,
            addEventListener: () => undefined,
            deleteChannel: () => undefined,
            removeEventListener: () => undefined,
        };
    },
};

QUnit.module("web_widget_markdown_editor", (hooks) => {
    let target = null;
    let serverData = null;
    hooks.beforeEach(() => {
        target = getFixture();
        serverData = {
            models: {
                partner: {
                    fields: {
                        memo: {string: "Memo", type: "text"},
                    },
                    records: [{id: 1, memo: "# Title\n\nSome **bold** text"}],
                },
            },
        };
        setupViewRegistries();
        const services = registry.category("services");
        if (!services.contains("bus_service")) {
            services.add("bus_service", fakeBusService);
        }
        if (!services.contains("notification")) {
            services.add("notification", makeFakeNotificationService());
        }
        // Reason: web_m2x_options (same repository) adds this step to every form
        // view load and reads its settings from a session the test environment
        // does not have; it only concerns x2many fields, absent here.
        if (FormController.prototype._setSubViewLimit) {
            patchWithCleanup(FormController.prototype, {
                async _setSubViewLimit() {
                    return undefined;
                },
            });
        }
    });

    QUnit.test("readonly field renders the markdown", async (assert) => {
        await makeView({
            type: "form",
            serverData,
            resModel: "partner",
            resId: 1,
            arch: `<form><field name="memo" widget="markdown" readonly="1"/></form>`,
        });
        const contents = target.querySelector(
            ".o_field_markdown_readonly .toastui-editor-contents"
        );
        assert.ok(contents, "the Toast UI viewer is mounted");
        assert.strictEqual(contents.querySelector("h1").textContent, "Title");
        assert.strictEqual(contents.querySelector("strong").textContent, "bold");
        assert.containsNone(target, ".toastui-editor-defaultUI");
    });

    QUnit.test("editable field saves the edited markdown", async (assert) => {
        let field = null;
        patchWithCleanup(MarkdownField.prototype, {
            _initEditor() {
                this._super(...arguments);
                field = this;
            },
        });
        await makeView({
            type: "form",
            serverData,
            resModel: "partner",
            resId: 1,
            arch: `<form><field name="memo" widget="markdown"/></form>`,
            mockRPC(route, args) {
                if (args.method === "write") {
                    assert.step(args.args[1].memo);
                }
            },
        });
        assert.containsOnce(
            target,
            ".o_field_markdown_editor .toastui-editor-defaultUI"
        );
        assert.ok(field && field.editor, "the Toast UI editor is created");
        field.editor.setMarkdown("## New heading");
        await field.commitChanges();
        await clickSave(target);
        assert.verifySteps(["## New heading"]);
    });

    QUnit.test("editor opens in markdown mode with the mode tabs", async (assert) => {
        await makeView({
            type: "form",
            serverData,
            resModel: "partner",
            resId: 1,
            arch: `<form><field name="memo" widget="markdown"/></form>`,
        });
        const editorEl = target.querySelector(".toastui-editor-defaultUI");
        assert.isVisible(
            editorEl.querySelector(".toastui-editor-md-container"),
            "the Markdown source editor is shown"
        );
        assert.isVisible(
            editorEl.querySelector(".toastui-editor-mode-switch"),
            "the Markdown / WYSIWYG tabs are shown"
        );
    });

    QUnit.test("widget is not offered on html fields", (assert) => {
        assert.deepEqual(MarkdownField.supportedTypes, ["text"]);
    });
});
