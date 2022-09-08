/* global marked */
/* Copyright 2022 Therp B.V. - <http:///therp.nl>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_widget_html_markdown.FieldHtmlMarkDown", function (require) {
    "use strict";
    var field_html = require("web_editor.field.html");
    var config = require("web.config");
    var core = require("web.core");
    var Wysiwyg = require("web_editor.wysiwyg.root");
    var field_registry = require("web.field_registry");
    require("web._field_registry");
    var QWeb = core.qweb;
    var _t = core._t;
    var _lt = core._lt;
    var LIBS_PATH = "/web_widget_html_markdown/static/src/lib/";
    var CUST_CSS_PATH = "/web_widget_html_markdown/static/src/css/";

    var FieldHtmlMarkDown = field_html.extend({
        description: _lt("HtmlMarkdown"),
        classname: "oe_form_field oe_form_field_html_markdown",
        supportedFieldTypes: ["html"],
        jsLibs: [
            LIBS_PATH + "marked.js",
            LIBS_PATH + "dropzone.js",
            LIBS_PATH + "bootstrap-markdown.js",
        ],
        cssLibs: [
            LIBS_PATH + "bootstrap-markdown.min.css",
            CUST_CSS_PATH + "web_widget_html_markdown.css",
        ],
        xmlDependencies: ["/web_widget_html_markdown/static/src/xml/radio_info.xml"],
        /*=========================INIT AND START===============*/
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.isSwitch = false;
            var is_new = !this.res_id;
            this.options = _.extend(
                {
                    default_markdown_on_new:
                        (this.attrs.options["default_markdown_on_new"] && is_new) || 0,
                    only_markdown_on_new:
                        (this.attrs.options["only_markdown_on_new"] && is_new) || 0,
                },
                options || {}
            );
        },
        start: function () {
            this._super();
            this.markdownEditor = false;
            if (
                this.options.default_markdown_on_new ||
                this.options.only_markdown_on_new
            ) {
                this._createMarkdownEditorInstance();
            }
            var md_s = QWeb.render("web_widget_html_markdown.radio_info", {
                widget: this,
            });
            this.$el.prepend(md_s);
            var self = this;
            this.$el.find("input#markdown, input#html").change([self], self._switcher);
            this.infoarea = this.$el.find("div#md_infoarea");
            this.input_markdown = this.$el.find("input#markdown");
            this.input_html = this.$el.find("input#html");
            this.markdown_label = this.$el.find("label#markdown_label");
            this.html_label = this.$el.find("label#html_label");
        },
        /*=========================HTML WIDGET OVERIDES AND EXTENSIONS===============*/
        commitChanges: function () {
            var self = this;
            if (config.isDebug() && this.mode === "edit") {
                var layoutInfo = $.summernote.core.dom.makeLayoutInfo(
                    this.wysiwyg.$editor
                );
                $.summernote.pluginEvents.codeview(
                    undefined,
                    undefined,
                    layoutInfo,
                    false
                );
            }
            if (this.mode == "edit" && this.$is_markdown) {
                // Transform in html before saving
                this.sw_mk_to_html();
                // recursion max 1x because sw_mk_to_html makes self.$is_markdown falsy
                return this.commitChanges();
            } else if (this.mode == "edit") {
                var _super = this._super.bind(this);
                /*
                We need this override because we need to change in core
                setValue to forceChange:true, or it won't pick up changes in
                switch.  USECASE: we modify in MD, then switch to HTML, then save.
                (debounce widget considers this case as "Unedited" and would not save).
                */
                this._setValue(this.value, {forceChange: true});
                return this.wysiwyg.saveModifiedImages(this.$content).then(function () {
                    return self.wysiwyg.save(self.nodeOptions).then(function (result) {
                        self._isDirty = true;
                        _super();
                    });
                });
            }
        },
        reset: function (record, event) {
            // similar to HTML widget version, but overridden with forceChange:True
            var value = this.value;
            this._reset(record, event);
            if (this.nodeOptions.wrapper) {
                value = this._wrap(value);
            }
            value = this._textToHtml(value);
            if (!event || event.target !== this) {
                if (this.mode === "edit") {
                    this.wysiwyg._setValue(value, {forceChange: true});
                } else {
                    this.$content.html(value);
                }
            }
            return Promise.resolve();
        },
        _getValue: function () {
            if (this.$is_markdown) {
                var val = this.markdownEditor[0].value;
                var value = this._getHtmlValue(val);
            } else {
                var value = this.$target.val();
            }
            if (this.nodeOptions.wrapper) {
                return this._unWrap(value);
            }
            return value;
        },
        _createWysiwygIntance: function () {
            /*
             * in core this is named _createWysiwygIntance  (without the s), clearly a
             * typo. It is used in _renderEdit.
             * replicating the incorrect naming here too so all works.
             */
            var self = this;
            this.wysiwyg = new Wysiwyg(this, this._getWysiwygOptions());
            this.wysiwyg.__extraAssetsForIframe = this.__extraAssetsForIframe || [];
            // By default this is synchronous, the assets are  loaded in willStart
            // but it can be async in the case of options such as iframe, snippets...
            return this.wysiwyg.attachTo(this.$target).then(function () {
                self.$content = self.wysiwyg.$editor.closest(
                    "body, odoo-wysiwyg-container"
                );
                self.isRendered = false;
                self._onLoadWysiwyg();
                if (self._html_has_md_source_tag() && self.verify_checksum()) {
                    $(self.infoarea).html(
                        "<i>Markdown Fully Preserved, you can return to markdown with no loss</i>"
                    );
                    $(self.infoarea).attr("class", "md_preserved");
                    if (self.isSwitch == false) {
                        // If there is a MD source tag and is
                        // a switch but of a first load, start in markdown mode.
                        self.sw_html_to_mk();
                        $(self.infoarea).html(
                            "<i>Edit started in Markdown, this field had markdown content preserved</i>"
                        );
                        self.input_markdown.prop("checked", true);
                        if (!self.options.only_markdown_on_new) {
                            self.input_html.prop("checked", false);
                        }
                    }
                } else {
                    // edit started with content, no tag.
                    if (!self._html_is_empty()) {
                        $(self.infoarea).addClass("md_preserved");
                        $(self.infoarea).html(
                            "<i>Edit started in Html, there is no markdown conversion data, to edit markdown you must delete current HTML </i>"
                        );
                        self.input_html.prop("checked", true);
                        self.input_markdown.hide();
                        self.markdown_label.hide();
                    } else {
                        if (
                            self.options.only_markdown_on_new ||
                            self.options.default_markdown_on_new
                        ) {
                            self.sw_html_to_mk();
                            $(self.infoarea).addClass("md_preserved");
                            $(self.infoarea).html(
                                "<i>Edit started in Markdown, widget configured for exclusive markdown editing </i>"
                            );
                            self.input_markdown.prop("checked", true);
                        } else {
                            $(self.infoarea).addClass("md_preserved");
                            $(self.infoarea).html(
                                "<i>Edit started in Html, If you start editing in HTML no markdown switching will be possible, if you need markdown, start editing markdown first. </i>"
                            );
                            self.input_html.prop("checked", true);
                        }
                    }
                }
            });
        },
        _onChange: function (ev) {
            // a change has happened in HTML, destroy tag.
            this._rm_md_tag();
            if (this.switchable_to_markdown(ev)) {
                this.input_markdown.show();
                this.markdown_label.show();
                $(this.infoarea).attr("class", "md_preserved");
                $(this.infoarea).html("<i>You can now switch with no data loss.</i>");
            } else {
                $(this.infoarea).removeClass("md_not_preserved");
                this.input_markdown.hide();
                this.markdown_label.hide();
                $(this.infoarea).attr("class", "md_not_preserved");
                $(this.infoarea).html(
                    "<i>Html Edited, you cannot return to markdown. There is no Html->markdown conversion available in this version, next time start editing in markdown.</i>"
                );
            }
            this._super.apply(this, arguments);
        },
        _renderReadonly: function () {
            this._super.apply(this, arguments);
            var has_tag = this._html_has_md_source_tag();
            var label = "HTML";
            if (has_tag) {
                label = "Markdown";
            }
            this.$el.prepend(
                '<div class="badge badge-primary float-right">' + label + "</div>"
            );
            // parent returns nothing.
        },
        /*=========================MARKDOWN EDITOR ===============*/
        _getMarkdownOptions: function () {
            var self = this;
            var markdownOpts = {
                iconlibrary: "fa",
                width: "o_field_html_markdown",
                autofocus: false,
                savable: false,
                language: this.getSession().user_context.lang,
                onPreview: function (e) {
                    // this will use marked
                    var render_val = self._getHtmlValue(e.getContent());
                    return render_val;
                },
            };
            // Only can create attachments on non-virtual records
            if (this.res_id) {
                markdownOpts.dropZoneOptions = {
                    paramName: "ufile",
                    url: "/web/binary/upload_attachment",
                    acceptedFiles: "image/*",
                    width: "o_field_text_markdown",
                    params: {
                        csrf_token: core.csrf_token,
                        session_id: this.getSession().override_session,
                        callback: "",
                        model: this.model,
                        id: this.res_id,
                    },
                    success: function () {
                        self._markdownDropZoneUploadSuccess(this);
                    },
                    error: function () {
                        self._markdownDropZoneUploadError(this);
                    },
                    init: function () {
                        self._markdownDropZoneInit(this);
                    },
                };
            }
            return markdownOpts;
        },
        _markdownDropZoneInit: function (markdown) {
            var self = this;
            var caretPos = 0;
            var $textarea = null;
            markdown.on("drop", function (e) {
                $textarea = $(e.target);
                caretPos = $textarea.prop("selectionStart");
            });
            markdown.on("success", function (file, response) {
                var text = $textarea.val();
                var attachment_id = self._getAttachmentId(response);
                if (attachment_id) {
                    var ftext =
                        text.substring(0, caretPos) +
                        "\n![" +
                        _t("description") +
                        "](/web/image/" +
                        attachment_id +
                        ")\n" +
                        text.substring(caretPos);
                    $textarea.val(ftext);
                } else {
                    self.do_warn(_t("Error"), _t("Can't create the attachment."));
                }
            });
            markdown.on("error", function (file, error) {
                console.warn(error);
            });
        },

        _markdownDropZoneUploadSuccess: function () {
            this.isDirty = true;
            this._doDebouncedAction();
            this.$markdown.$editor.find(".dz-error-mark:last").css("display", "none");
        },

        _markdownDropZoneUploadError: function () {
            this.$markdown.$editor.find(".dz-success-mark:last").css("display", "none");
        },

        _createMarkdownEditorInstance: function () {
            if (!this.markdownEditor) {
                var markdownEditor =
                    "<textarea  id='comment-md' rows='12' cols='100'></textarea>";
                $(this.$el[0]).append(markdownEditor);
                this.markdownEditor = $(this.$el[0]).find("#comment-md");
                this.markdownEditor.markdown(this._getMarkdownOptions());
            }
        },
        /*=========================TAG MANAGEMENT===========================*/
        _html_has_md_source_tag: function () {
            var tag = this.$content.find(".web_widget_html_markdown_source");
            return Boolean(tag.length);
        },
        _generate_md_tag: function (md_content, html_challenge) {
            var checksum = this._generate_checksum(html_challenge);
            // forced to do this with two hidden p tags, because both
            // attribute html_checksum and also data-html_checksum (html5 compliant)
            // aere wiped out.
            var tag =
                '<p style="display:none;"  class="web_widget_html_markdown_source" type="text/plain">' +
                md_content +
                "</p>" +
                '<p style="display:none;"  class="web_widget_html_markdown_checksum" type="text/plain">' +
                checksum +
                "</p>";
            return tag;
        },
        _rm_md_tag: function () {
            return this.$content.find(".web_widget_html_markdown_source").remove();
            return this.$content.find(".web_widget_html_markdown_checksum").remove();
        },
        _get_md_tag_innertext: function () {
            var tag = this.$content.find(".web_widget_html_markdown_source")[0];
            if (tag) {
                return tag.innerText;
            }
            return "";
        },
        _get_md_tag: function () {
            var tag = this.$content.find(".web_widget_html_markdown_source")[0];
            if (tag) {
                return tag;
            }
            return false;
        },
        _html_is_empty: function () {
            //This will return us the latest content even if the widget is dirty.
            var current_value = this.wysiwyg.getValue();
            //Latest save value would had been: this._getValue()
            //.isDirty will give us:  this.wysiwyg.getValue() != this._getValue()
            var cleaned_content = current_value
                .replace(/\s/g, "")
                .replace(/\<p\>/g, "")
                .replace(/\<\/p\>/g, "")
                .replace(/\<\/br\>/g, "")
                .replace(/\<br\>/g, "")
                .replace(/&nbsp;/g, "");
            return cleaned_content == "";
        },

        /*=========================checksum=================*/
        _generate_checksum: function (html_challenge) {
            var chk = 0x12345678;
            var len = html_challenge.length;
            for (var i = 0; i < len; i++) {
                chk += html_challenge.charCodeAt(i) * (i + 1);
            }
            return (chk & 0xffffffff).toString(16);
        },
        verify_checksum: function () {
            if (this._html_has_md_source_tag()) {
                var saved_checksum = this.$content.find(
                    ".web_widget_html_markdown_checksum"
                );
                if (!saved_checksum) {
                    return false;
                }
                saved_checksum = saved_checksum[0].innerText;
                /* we make a deep  copy of current HTML content, remove the tag,
                 re-run the checksum on the remaining HTML and verify it is ==
                 to saved checksum */
                var content_copy = $.extend(true, {}, this.$content);
                var tagless_content = "";
                var elements = $(content_copy[0].firstChild.value)
                    .not("p.web_widget_html_markdown_source")
                    .not("p.web_widget_html_markdown_checksum")
                    .each(function () {
                        tagless_content += this.html();
                    });
                var new_checksum = this._generate_checksum(tagless_content);
                return saved_checksum == new_checksum;
            }
            return false;
        },
        /*=========================SWITCHERS AND VALUE FETCHERS=================*/
        switchable_to_markdown: function (ev) {
            /* show markdown if:
             *    - We have a MD tag. (e.g.  Html unedited, first load)
             *    - current content is empty */
            return this._get_md_tag() || this._html_is_empty();
        },
        _switcher: function (ev) {
            self = ev.data[0];
            if (ev.currentTarget.id == "markdown") {
                var is_empty = self._html_is_empty();
                var has_md_source_tag = self._html_has_md_source_tag();
                if (!is_empty && !has_md_source_tag) {
                    console.log("FORBIDDEN EXECUTION BRANCH REACHED");
                } else {
                    self.sw_html_to_mk();
                }
            }
            if (ev.currentTarget.id == "html") {
                self.sw_mk_to_html();
            }
        },
        sw_mk_to_html: function () {
            this.isSwitch = true;
            var markdown_content = this.markdownEditor[0].value;
            var html_content = this._getHtmlValue(markdown_content);
            var html_challenge = $(html_content).html();
            var tag = this._generate_md_tag(markdown_content, html_challenge);
            this.value = html_content + tag;
            this.wysiwyg.setValue(this.value);
            this.markdownEditor.parent().hide();
            this.$is_markdown = false;
            $(this.wysiwyg.el).parent().show();
            this.input_markdown.prop("checked", false);
            if (this.input_html) {
                this.input_html.prop("checked", true);
            }
        },
        sw_html_to_mk: function () {
            // markdown editor has problems with "falsy" values
            if (!this.value) {
                this.value = "";
            }
            var markdown_value = this._getMarkdownValue(this.value);
            this._createMarkdownEditorInstance();
            $(this.wysiwyg.el).parent().hide();
            this.markdownEditor.parent().show();
            this.$is_markdown = true;
            this.markdownEditor.val(markdown_value);
            this.input_markdown.prop("checked", true);
            if (this.input_html) {
                this.input_html.prop("checked", false);
            }
        },
        _getMarkdownValue: function (value) {
            // If we still have source tag we will return that.
            if (this._html_has_md_source_tag()) {
                // If the tag is in HTML just stick that in MD editor
                return this._get_md_tag_innertext();
            }
            return "";
        },
        _getHtmlValue: function (value) {
            if (!value) {
                value = "";
            }
            return marked(this._formatValue(value));
        },
    });
    field_registry.add("html_markdown", FieldHtmlMarkDown);
    return FieldHtmlMarkDown;
});
