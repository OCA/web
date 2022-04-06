/* Copyright 2012-2015 Therp
 * Copyright 2016 - Tecnativa - Angel Moya <odoo@tecnativa.com>
 * Copyright 2017 - redO2oo   - Robert Rottermann <robert@redO2oo.ch>
 * Copyright 2018 - Therp BV
 * Copyright 2021 - Sunflower IT
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("support_branding.CrashManager", function (require) {
    "use strict";
    var CrashManager = require("web.CrashManager").CrashManager;
    var session = require("web.session");
    var core = require("web.core");
    var Wysiwyg = require("web_editor.wysiwyg.root");

    var _t = core._t;

    CrashManager.include({
        init: function () {
            var self = this;
            $.when(this._super.apply(this, arguments)).then(function () {
                self._rpc({
                    model: "ir.config_parameter",
                    method: "get_param",
                    args: ["support_company"],
                }).then(function (name) {
                    self.support_cp_name = name;
                });

                self._rpc({
                    model: "ir.config_parameter",
                    method: "get_param",
                    args: ["support_company_url"],
                }).then(function (url) {
                    self.support_cp_url = url;
                });

                self._rpc({
                    model: "ir.config_parameter",
                    method: "get_param",
                    args: ["support_email"],
                }).then(function (email) {
                    self.support_cp_email = email;
                });

                self._rpc({
                    model: "ir.config_parameter",
                    method: "get_param",
                    args: ["support_release"],
                }).then(function (release) {
                    self.support_cp_release = release;
                });

                self._rpc({
                    model: "ir.config_parameter",
                    method: "get_param",
                    args: ["support_branding_color"],
                }).then(function (color) {
                    self.support_cp_color = color;
                });
            });
        },
        show_error: function (error) {
            var self = this;
            this.wysiwyg = new Wysiwyg(self, {});
            var subject =
                session.username +
                "@" +
                session.db +
                "[" +
                session.server +
                "]:" +
                error.message;
            var body = error.data.debug;
            var inputs =
                "" +
                '<input type="hidden" name="subject" autocomplete="off" ' +
                "value=" +
                subject +
                "/>\n" +
                '<input type="hidden" class="sp-body" name="body" ' +
                'autocomplete="off" value=\'' +
                body +
                "'/>";
            return this._super.apply(this, arguments).opened(function () {
                var $form = $(".support-branding-submit-form");
                var $statement = $(".support-statement");
                var $description = $(".support-desc");
                var $button = $(".support-btn");
                var $use_html_ck = $("#use_html_checker");
                var $close_btn = $(".close");
                var $body = $(".sp-body");
                var $header = $form.parents(".modal-dialog").find(".modal-header");
                var $footer = $form.parents(".modal-dialog").find(".modal-footer");
                // Self.wysiwyg.attachTo($description);

                $statement.prepend(inputs);
                if (self.support_cp_email) {
                    if (self.support_cp_name) {
                        var title = "Support by " + self.support_cp_name;
                        $('<h3 class="text-primary">' + title + "</h3>").insertBefore(
                            ".support-branding-submit-form"
                        );
                        $button.text(
                            _.str.sprintf(_t("Email to %s"), self.support_cp_name)
                        );
                    }
                    $form
                        .parents(".modal")
                        .find(".modal-body")
                        .css("max-height", "70vh");
                    $use_html_ck.on("change", function () {
                        if (this.checked) {
                            if (self.wysiwyg.isDestroyed()) {
                                self.wysiwyg = new Wysiwyg(self, {});
                                self.wysiwyg.attachTo($description);
                            } else self.wysiwyg.attachTo($description);
                        } else {
                            self.wysiwyg.destroy();
                            $(".support-statement").append($description);
                            if ($description.is(":hidden"))
                                $description.css({display: "block"});
                        }
                    });

                    $button.on("click", function (ev) {
                        var $btn = $(this);
                        if (!$description.val()) {
                            $description.parent().addClass("oe_form_invalid");
                            ev.preventDefault();
                            return;
                        }
                        ev.preventDefault();
                        var error_code = "";
                        var body_html = "";
                        var desc =
                            self.wysiwyg.$editor && self.wysiwyg.$editor.length
                                ? self.wysiwyg.getValue()
                                : $description.val();
                        desc = `<div>${desc}</div>`;
                        error_code = `<pre>${body}</pre>`;
                        body_html = `<div>${desc}<br/>${error_code}</div>`;
                        var params = {
                            state: "outgoing",
                            auto_delete: true,
                            email_to: self.support_cp_email,
                            subject: subject,
                            body_html: body_html,
                        };
                        self._rpc({
                            model: "mail.mail",
                            method: "create",
                            args: [params],
                        }).then(
                            function (mail_id) {
                                if (mail_id) {
                                    self._rpc({
                                        model: "mail.mail",
                                        method: "send",
                                        args: [mail_id],
                                    }).then(function () {
                                        self.do_notify(
                                            "Success",
                                            "Support mail created!"
                                        );
                                        $close_btn.click();
                                    });
                                }
                            },
                            function () {
                                $body.val(desc + "\n\n" + $body.val());
                                $btn.unbind("click");
                                $btn.click();
                            }
                        );
                    });
                } else {
                    $description.css({display: "none"});
                    $button.css({display: "none"});
                }
                $form.prependTo($footer);
                // Hide "Ok" button since we have close on the dialog top
                // Allow send email btn to close once done.
                $footer.find("button:eq(1)").css({display: "none"});

                if (self.support_cp_color) {
                    $header.css({background: self.support_cp_color});
                    $footer.css({background: self.support_cp_color});
                } else {
                    $header.css({background: ""});
                    $footer.css({background: ""});
                }
            });
        },
    });
});
