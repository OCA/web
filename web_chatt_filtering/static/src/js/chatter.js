/** Copyright <2019> Pesol <pedro.gonzalez@pesol.es>
 License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('mymail.Chatter', function (require) {
    "use strict";

    var Chatt = require('mail.Chatter');

    Chatt.include({
        events: _.extend({}, Chatt.prototype.events, {
            'keyup input#search_partner': function (ev) {
                if (ev.which === $.ui.keyCode.ENTER) {
                    this.filter_message($(ev.target).val().trim());
                }
            },
        }),

        render_thread: function (domain) {
            var self = this;
            var dThread = this.fields.thread;
            this._rpc({
                model: 'mail.message',
                method: 'message_fetch',
                args: [domain],
                kwargs: {limit: this.original_msgs.length},
            })
                .then(function (msgs) {
                    // Add messages to the thread in case not empty
                    if (msgs.length > 0) {
                        _.each(msgs, function (messageData) {
                            if (self.reverse_author) {
                                if (!messageData.author_id[1].toLowerCase().includes(
                                    self.substring.substr(1))) {
                                    self.call('mail_service', 'addMessage',
                                        messageData, {silent: true});
                                }
                            } else {
                                self.call('mail_service', 'addMessage',
                                    messageData, {silent: true});
                            }
                        });
                        // Reload thread view
                        dThread._threadWidget.render(dThread._documentThread, {});
                        self.$('#search_partner').val(self.substring);
                    } else {
                        self.$('#search_partner').val("No messages found");
                    }
                    self.$('#search_partner').select();
                });
        },

        filter_message: function (substring) {
            if (this.last_model_id !== this.fields.thread.model_id ||
            this.last_res_id !== this.fields.thread.res_id) {
                this.last_model_id = this.fields.thread.model_id;
                this.last_res_id = this.fields.thread.res_id;
                this.original_msgs = Array.from(this.fields.thread.value.res_ids);
            }
            this.filtered_msgs = [];
            this.reverse_author = false;
            this.substring = substring;

            // In case substring is empty, avoid ORM and render original
            if (!substring) {
                this.fields.thread._fetchAndRenderThread();
                return;
            }
            // Reset messages to none
            this.fields.thread._documentThread._messages = [];
            // Get domain
            var domain = ['&', ["id", "in", this.original_msgs], '|',
                ['body', 'ilike', substring], ['author_id', 'ilike', substring]];
            if (substring.trim().charAt(0) === '-') {
                domain = [["id", "in", this.original_msgs]];
                this.reverse_author = true;
            }
            this.render_thread(domain);
        },
    });
    return Chatt;
});
