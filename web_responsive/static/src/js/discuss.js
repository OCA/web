/* Copyright Odoo S.A.
 * Ported to 13.0 by Copyright 2020 Tecnativa - Alexandre Díaz
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

odoo.define("web_responsive.Discuss", function(require) {
    "use strict";

    const config = require("web.config");
    if (!config.device.isMobile) {
        return;
    }

    const core = require("web.core");
    const Discuss = require("mail.Discuss");

    const QWeb = core.qweb;

    Discuss.include({
        contentTemplate: "mail.discuss_mobile",
        events: Object.assign({}, Discuss.prototype.events, {
            "click .o_mail_mobile_tab": "_onClickMobileTab",
            "click .o_mailbox_inbox_item": "_onClickMobileMailboxItem",
            "click .o_mail_preview": "_onClickMobileMailPreview",
        }),

        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);
            this._currentState = this._defaultThreadID;
        },

        /**
         * @override
         */
        start: function() {
            this._$mainContent = this.$(".o_mail_discuss_content");
            return this._super
                .apply(this, arguments)
                .then(this._updateControlPanel.bind(this));
        },

        /**
         * @override
         */
        on_attach_callback: function() {
            if (this._thread && this._isInInboxTab()) {
                this._threadWidget.scrollToPosition(
                    this._threadsScrolltop[this._thread.getID()]
                );
            }
        },
        /**
         * @override
         */
        on_detach_callback: function() {
            if (this._isInInboxTab()) {
                this._threadsScrolltop[
                    this._thread.getID()
                ] = this._threadWidget.getScrolltop();
            }
        },

        // --------------------------------------------------------------------------
        // Private
        // --------------------------------------------------------------------------

        /**
         * @private
         * @returns {Boolean} true iff we currently are in the Inbox tab
         */
        _isInInboxTab: function() {
            return _.contains(["mailbox_inbox", "mailbox_starred"], this._currentState);
        },
        /**
         * @override
         * @private
         */
        _renderButtons: function() {
            this._super.apply(this, arguments);
            _.each(["dm_chat", "multi_user_channel"], type => {
                const selector = ".o_mail_discuss_button_" + type;
                this.$buttons.on("click", selector, this._onAddThread.bind(this));
            });
        },
        /**
         * Overrides to only store the thread state if we are in the Inbox tab, as
         * this is the only tab in which we actually have a displayed thread
         *
         * @override
         * @private
         */
        _restoreThreadState: function() {
            if (this._isInInboxTab()) {
                this._super.apply(this, arguments);
            }
        },
        /**
         * Overrides to toggle the visibility of the tabs when a message is selected
         *
         * @override
         * @private
         */
        _selectMessage: function() {
            this._super.apply(this, arguments);
            this.$(".o_mail_mobile_tabs").addClass("o_hidden");
        },
        /**
         * @override
         * @private
         */
        _setThread: function(threadID) {
            const thread = this.call("mail_service", "getThread", threadID);
            this._thread = thread;
            this._updateButtons(threadID);
            if (thread.getType() !== "mailbox") {
                this.call("mail_service", "openThreadWindow", threadID);
                return Promise.resolve();
            }
            return this._super.apply(this, arguments);
        },
        /**
         * Overrides to only store the thread state if we are in the Inbox tab, as
         * this is the only tab in which we actually have a displayed thread
         *
         * @override
         * @private
         */
        _storeThreadState: function() {
            if (this._thread && this._isInInboxTab()) {
                this._super.apply(this, arguments);
            }
        },
        /**
         * Overrides to toggle the visibility of the tabs when a message is
         * unselected
         *
         * @override
         * @private
         */
        _unselectMessage: function() {
            this._super.apply(this, arguments);
            this.$(".o_mail_mobile_tabs").removeClass("o_hidden");
        },
        /**
         * @override
         * @private
         */
        _updateThreads: function() {
            return this._updateContent(this._currentState);
        },
        /**
         * Redraws the content of the client action according to its current state.
         *
         * @private
         * @param {String} type the thread's type to display (e.g. 'mailbox_inbox',
         *   'mailbox_starred', 'dm_chat'...).
         * @returns {Promise}
         */
        _updateContent: function(type) {
            const inMailbox = type.startsWith("mailbox_");
            if (!inMailbox && this._isInInboxTab()) {
                // We're leaving the inbox, so store the thread scrolltop
                this._storeThreadState();
            }
            const previouslyInInbox = this._isInInboxTab();
            this._currentState = type;

            // Fetch content to display
            let def = false;
            if (inMailbox) {
                def = this._fetchAndRenderThread();
            } else {
                const allChannels = this.call("mail_service", "getChannels");
                const channels = _.filter(allChannels, function(channel) {
                    return channel.getType() === type;
                });
                def = this.call("mail_service", "getChannelPreviews", channels);
            }
            return def.then(previews => {
                // Update content
                if (inMailbox) {
                    if (!previouslyInInbox) {
                        this.$(".o_mail_discuss_tab_pane").remove();
                        this._$mainContent.append(this._threadWidget.$el);
                        this._$mainContent.append(this._extendedComposer.$el);
                    }
                    this._restoreThreadState();
                } else {
                    this._threadWidget.$el.detach();
                    this._extendedComposer.$el.detach();
                    const $content = $(
                        QWeb.render("mail.discuss.MobileTabPane", {
                            previews: previews,
                            type: type,
                        })
                    );
                    this._prepareAddThreadInput(
                        $content.find(".o_mail_add_thread input"),
                        type
                    );
                    this._$mainContent.html($content);
                }

                this._updateButtons(type);
            });
        },

        _updateButtons: function(type) {
            const inMailbox = type.startsWith("mailbox_");
            // Update control panel
            this.$buttons
                .find("button")
                .removeClass("d-block")
                .addClass("d-none");
            this.$buttons
                .find(".o_mail_discuss_button_" + type)
                .removeClass("d-none")
                .addClass("d-block");
            this.$buttons
                .find(".o_mail_discuss_button_mark_all_read")
                .toggleClass("d-none", type !== "mailbox_inbox")
                .toggleClass("d-block", type === "mailbox_inbox");
            this.$buttons
                .find(".o_mail_discuss_button_unstar_all")
                .toggleClass("d-none", type !== "mailbox_starred")
                .toggleClass("d-block", type === "mailbox_starred");

            // Update Mailbox page buttons
            if (inMailbox) {
                this.$(".o_mail_discuss_mobile_mailboxes_buttons").removeClass(
                    "o_hidden"
                );
                this.$(".o_mailbox_inbox_item")
                    .removeClass("btn-primary")
                    .addClass("btn-secondary");
                this.$(".o_mailbox_inbox_item[data-type=" + type + "]")
                    .removeClass("btn-secondary")
                    .addClass("btn-primary");
            } else {
                this.$(".o_mail_discuss_mobile_mailboxes_buttons").addClass("o_hidden");
            }

            // Update bottom buttons
            this.$(".o_mail_mobile_tab").removeClass("active");
            // Mailbox_inbox and mailbox_starred share the same tab
            const type_n = type === "mailbox_starred" ? "mailbox_inbox" : type;
            this.$(".o_mail_mobile_tab[data-type=" + type_n + "]").addClass("active");
        },

        // --------------------------------------------------------------------------
        // Handlers
        // --------------------------------------------------------------------------

        /**
         * @override
         * @private
         */
        _onAddThread: function() {
            this.$(".o_mail_add_thread")
                .show()
                .find("input")
                .focus();
        },
        /**
         * Switches to the clicked thread in the Inbox page (Inbox or Starred).
         *
         * @private
         * @param {MouseEvent} ev
         */
        _onClickMobileMailboxItem: function(ev) {
            const mailboxID = $(ev.currentTarget).data("type");
            this._setThread(mailboxID);
            this._updateContent(this._thread.getID());
        },
        /**
         * Switches to another tab.
         *
         * @private
         * @param {MouseEvent} ev
         */
        _onClickMobileTab: function(ev) {
            const type = $(ev.currentTarget).data("type");
            if (type === "mailbox_inbox") {
                this._setThread("mailbox_inbox");
            }
            this._updateContent(type);
        },
        /**
         * Opens a thread in a chat window (full screen in mobile).
         *
         * @private
         * @param {MouseEvent} ev
         */
        _onClickMobileMailPreview: function(ev) {
            const threadID = $(ev.currentTarget).data("preview-id");
            this.call("mail_service", "openThreadWindow", threadID);
        },
    });
});
