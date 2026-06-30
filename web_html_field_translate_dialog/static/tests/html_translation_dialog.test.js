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
import {click, queryAll} from "@odoo/hoot-dom";
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
