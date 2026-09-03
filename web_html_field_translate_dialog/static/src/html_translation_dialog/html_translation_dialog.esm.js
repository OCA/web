/* Copyright 2025 ForgeFlow S.L.
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {Component, markup, onWillStart, useState} from "@odoo/owl";
import {Dialog} from "@web/core/dialog/dialog";
import {
    MAIN_PLUGINS,
    NO_EMBEDDED_COMPONENTS_FALLBACK_PLUGINS,
} from "@html_editor/plugin_sets";
import {Wysiwyg} from "@html_editor/wysiwyg";
import {_t, loadLanguages} from "@web/core/l10n/translation";
import {useService} from "@web/core/utils/hooks";
import {user} from "@web/core/user";

/**
 * Return true when the value contains markup the rich-text editor cannot
 * round-trip safely (full/partial documents, <style> blocks or QWeb
 * templating directives such as those found in email templates). Such values
 * should default to the raw HTML ("technical") view so the user does not lose
 * data by opening them in the WYSIWYG editor.
 *
 * @param {String} value
 * @returns {Boolean}
 */
function looksTechnical(value) {
    if (!value) {
        return false;
    }
    // Document-level tags or embedded stylesheets the editor would strip.
    if (/<\s*(!doctype|html|head|body|style)\b/i.test(value)) {
        return true;
    }
    // QWeb templating directives (t-out, t-esc, t-field, t-if, t-foreach, ...).
    if (/\bt-(out|esc|field|raw|if|elif|else|foreach|call|set|att)\b/i.test(value)) {
        return true;
    }
    return false;
}

/**
 * Dialog that lets the user translate an HTML field by showing one full
 * rich-text editor per installed language, instead of the standard dialog that
 * splits the content into technical source terms.
 *
 * Every language can be toggled between the WYSIWYG editor and a raw HTML
 * ("technical") view. Values that the editor cannot round-trip safely (email
 * templates, QWeb directives, ...) open in the technical view by default.
 */
export class HtmlTranslationDialog extends Component {
    static template = "web_html_field_translate_dialog.HtmlTranslationDialog";
    static components = {Dialog, Wysiwyg};
    static props = {
        fieldName: String,
        fieldString: {type: String, optional: true},
        resId: Number,
        resModel: String,
        onSave: Function,
        close: Function,
    };

    setup() {
        this.orm = useService("orm");
        this.title = this.props.fieldString
            ? _t("Translate: %s", this.props.fieldString)
            : _t("Translate");
        // Editor instances, keyed by language code.
        this.editors = {};
        this.translations = [];
        // Reactive per-language state: whether the raw HTML view is shown and
        // the current source value (authoritative while the code view is on and
        // used as the editor content whenever the WYSIWYG is (re)mounted).
        this.state = useState({codeView: {}, source: {}});

        onWillStart(async () => {
            const languages = await loadLanguages(this.orm);
            const translations = await this.orm.call(
                this.props.resModel,
                "web_get_field_translations_full",
                [[this.props.resId], this.props.fieldName]
            );
            this.translations = translations.map((term) => {
                const language = languages.find((lang) => lang[0] === term.lang);
                return {
                    lang: term.lang,
                    langName: language ? language[1] : term.lang,
                    value: term.value || "",
                };
            });
            this.translations.sort((a, b) => a.langName.localeCompare(b.langName));
            for (const term of this.translations) {
                this.state.source[term.lang] = term.value;
                // Default complex values to the raw HTML view.
                this.state.codeView[term.lang] = looksTechnical(term.value);
            }
        });
    }

    isCurrentLang(lang) {
        return lang === user.lang;
    }

    getConfig(term) {
        return {
            // Flag the value as safe HTML (like HtmlField does) so the editor
            // renders it instead of displaying the escaped markup. The source
            // string is the single source of truth across view toggles.
            content: markup(this.state.source[term.lang] || ""),
            Plugins: [...MAIN_PLUGINS, ...NO_EMBEDDED_COMPONENTS_FALLBACK_PLUGINS],
            baseContainers: ["DIV", "P"],
            // Several editor plugins (media, link, ...) expect this callback to
            // exist; without it the editor crashes on destroy.
            getRecordInfo: () => ({
                resModel: this.props.resModel,
                resId: this.props.resId,
                field: this.props.fieldName,
            }),
        };
    }

    onEditorLoad(lang, editor) {
        this.editors[lang] = editor;
    }

    onCodeInput(lang, ev) {
        this.state.source[lang] = ev.target.value;
    }

    /**
     * Switch a single language between the WYSIWYG editor and the raw HTML
     * view, keeping the source string in sync so no edit is lost either way.
     *
     * @param {String} lang
     */
    toggleCodeView(lang) {
        if (this.state.codeView[lang]) {
            // Leaving the code view: the source string already holds the latest
            // textarea content, the editor will mount with it.
            this.state.codeView[lang] = false;
        } else {
            // Entering the code view: capture the current editor content and
            // drop the (soon unmounted) editor instance.
            const editor = this.editors[lang];
            if (editor) {
                this.state.source[lang] = editor.getContent();
                this.editors[lang] = null;
            }
            this.state.codeView[lang] = true;
        }
    }

    getValue(term) {
        const editor = this.editors[term.lang];
        if (!this.state.codeView[term.lang] && editor) {
            return editor.getContent();
        }
        return this.state.source[term.lang] || "";
    }

    async onSave() {
        const translations = {};
        for (const term of this.translations) {
            translations[term.lang] = this.getValue(term);
        }
        await this.orm.call(this.props.resModel, "web_set_field_translations_full", [
            [this.props.resId],
            this.props.fieldName,
            translations,
        ]);
        await this.props.onSave();
        this.props.close();
    }
}
