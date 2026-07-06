/* Copyright 2025 ForgeFlow S.L.
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {expect, test} from "@odoo/hoot";
import {
    defineModels,
    fields,
    models,
    mountView,
    onRpc,
    serverState,
} from "@web/../tests/web_test_helpers";
import {click, queryAll, queryFirst} from "@odoo/hoot-dom";
import {animationFrame} from "@odoo/hoot-mock";

class Partner extends models.Model {
    txt = fields.Html({string: "Txt", translate: true});
    _records = [{id: 1, txt: "<p>Hello</p>"}];
}

class User extends models.Model {
    _name = "res.users";
    has_group() {
        return true;
    }
}

defineModels([Partner, User]);

test("html translatable field opens a per-language rich-text dialog", async () => {
    serverState.lang = "en_US";
    serverState.multiLang = true;

    onRpc("has_group", () => true);
    onRpc("res.lang", "get_installed", () => [
        ["en_US", "English"],
        ["fr_FR", "French"],
    ]);
    onRpc("web_get_field_translations_full", ({args}) => {
        expect(args[1]).toBe("txt");
        return [
            {lang: "en_US", value: "<p>Hello</p>"},
            {lang: "fr_FR", value: "<p>Bonjour</p>"},
        ];
    });

    await mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: /* xml */ `<form><field name="txt" widget="html"/></form>`,
    });

    expect(".o_field_html .btn.o_field_translate").toHaveCount(1, {
        message: "the translate button should be displayed next to the HTML field",
    });

    await click(".o_field_html .btn.o_field_translate");
    await animationFrame();

    expect(".modal .o_html_translation_dialog").toHaveCount(1, {
        message: "the per-language HTML translation dialog should open",
    });
    expect(".o_translation_dialog").toHaveCount(0, {
        message: "the standard term-by-term dialog should not be used for HTML fields",
    });
    expect(".o_html_translation_editor").toHaveCount(2, {
        message: "there should be one full editor per installed language",
    });
    // The HTML must be rendered, not displayed as escaped markup.
    const editors = queryAll(".o_html_translation_editor [contenteditable=true]");
    expect(editors[0]).toHaveText("Hello", {
        message: "the editor should render the HTML, not show the raw tags",
    });
    expect(editors[0].querySelector("p")).not.toBe(null, {
        message: "the value should be parsed as HTML (a <p> element is present)",
    });
});

test("the per-language dialog saves the full value of every language", async () => {
    serverState.lang = "en_US";
    serverState.multiLang = true;

    onRpc("has_group", () => true);
    onRpc("res.lang", "get_installed", () => [
        ["en_US", "English"],
        ["fr_FR", "French"],
    ]);
    onRpc("web_get_field_translations_full", () => [
        {lang: "en_US", value: "<p>Hello</p>"},
        {lang: "fr_FR", value: "<p>Bonjour</p>"},
    ]);
    onRpc("web_set_field_translations_full", ({args}) => {
        expect(args[1]).toBe("txt");
        expect(Object.keys(args[2]).sort()).toEqual(["en_US", "fr_FR"], {
            message: "the full value of every language should be sent on save",
        });
        expect.step("web_set_field_translations_full");
        return true;
    });

    await mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: /* xml */ `<form><field name="txt" widget="html"/></form>`,
    });

    await click(".o_field_html .btn.o_field_translate");
    await animationFrame();

    const saveButton = queryAll(".modal footer .btn-primary")[0];
    await click(saveButton);
    await animationFrame();

    expect.verifySteps(["web_set_field_translations_full"]);
    expect(".modal .o_html_translation_dialog").toHaveCount(0, {
        message: "the dialog should close after saving",
    });
});

test("technical HTML opens in the raw source view and can be toggled", async () => {
    serverState.lang = "en_US";
    serverState.multiLang = true;

    onRpc("has_group", () => true);
    onRpc("res.lang", "get_installed", () => [
        ["en_US", "English"],
        ["fr_FR", "French"],
    ]);
    onRpc("web_get_field_translations_full", () => [
        // A QWeb templating directive: must not be opened in the WYSIWYG.
        {lang: "en_US", value: `<p>Hello <t t-out="object.name"/></p>`},
        {lang: "fr_FR", value: "<p>Bonjour</p>"},
    ]);

    await mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: /* xml */ `<form><field name="txt" widget="html"/></form>`,
    });

    await click(".o_field_html .btn.o_field_translate");
    await animationFrame();

    // The technical (QWeb) language opens as a textarea, the plain one as an editor.
    expect(".o_html_translation_editor textarea.o_codeview").toHaveCount(1, {
        message: "the technical value should open in the raw HTML view",
    });
    expect(".o_html_translation_editor [contenteditable=true]").toHaveCount(1, {
        message: "the plain value should still open in the WYSIWYG editor",
    });
    expect(queryFirst("textarea.o_codeview").value).toBe(
        `<p>Hello <t t-out="object.name"/></p>`,
        {message: "the textarea should hold the raw source, QWeb directive intact"}
    );

    // Toggle the technical language back to the rich-text editor.
    await click(
        ".o_html_translation_lang:first-child .o_html_translation_codeview_btn"
    );
    await animationFrame();
    expect(".o_html_translation_editor textarea.o_codeview").toHaveCount(0, {
        message: "toggling should replace the textarea with the WYSIWYG editor",
    });
    expect(".o_html_translation_editor [contenteditable=true]").toHaveCount(2, {
        message: "both languages should now show a rich-text editor",
    });
});

test("editing in the raw source view is saved verbatim", async () => {
    serverState.lang = "en_US";
    serverState.multiLang = true;

    onRpc("has_group", () => true);
    onRpc("res.lang", "get_installed", () => [["en_US", "English"]]);
    onRpc("web_get_field_translations_full", () => [
        {lang: "en_US", value: `<p><t t-out="object.name"/></p>`},
    ]);
    onRpc("web_set_field_translations_full", ({args}) => {
        expect(args[2].en_US).toBe(`<p><t t-out="object.partner_id.name"/></p>`, {
            message: "the edited raw source should be saved verbatim",
        });
        expect.step("web_set_field_translations_full");
        return true;
    });

    await mountView({
        type: "form",
        resModel: "partner",
        resId: 1,
        arch: /* xml */ `<form><field name="txt" widget="html"/></form>`,
    });

    await click(".o_field_html .btn.o_field_translate");
    await animationFrame();

    const textarea = queryFirst("textarea.o_codeview");
    textarea.value = `<p><t t-out="object.partner_id.name"/></p>`;
    textarea.dispatchEvent(new InputEvent("input"));
    await animationFrame();

    await click(queryAll(".modal footer .btn-primary")[0]);
    await animationFrame();

    expect.verifySteps(["web_set_field_translations_full"]);
});
