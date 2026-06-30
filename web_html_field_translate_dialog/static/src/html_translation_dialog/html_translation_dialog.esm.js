/* Copyright 2025 ForgeFlow S.L.
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

import {Component, markup, onWillStart} from "@odoo/owl";
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
 * Dialog that lets the user translate an HTML field by showing one full
 * rich-text editor per installed language, instead of the standard dialog that
 * splits the content into technical source terms.
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
        });
    }

    isCurrentLang(lang) {
        return lang === user.lang;
    }

    getConfig(term) {
        return {
            // Flag the value as safe HTML (like HtmlField does) so the editor
            // renders it instead of displaying the escaped markup.
            content: markup(term.value),
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

    async onSave() {
        const translations = {};
        for (const term of this.translations) {
            const editor = this.editors[term.lang];
            if (editor) {
                translations[term.lang] = editor.getContent();
            }
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
