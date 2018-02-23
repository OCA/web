// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).
odoo.define('web.syncer', function (require) {
    "use strict";

    const bus = require('bus.bus');
    const session = require('web.session');

    class Callback {
        constructor(syncer, channel, callback) {
            this.syncer = syncer;
            this.channel = channel;
            this.callback = callback;
        }

        unsubscribe() {
            let callbackList = this.syncer.subscriptions.get(this.channel);
            callbackList.splice(callbackList.indexOf(this), 1);
        }
    };

    class Syncer {

        constructor(parent = null) {
            this.subscriptions = new Map();
        }

        subscribe(channel, callback, parent = {}) {
            if (typeof callback !== "function") {
                throw new Error("Syncer subscription needs to have callback of type function");
            }

            bus.bus.add_channel(channel);
            let callbackObj = new Callback(this, channel, callback.bind(parent));
            if (!this.subscriptions.has(channel)) {
                this.subscriptions.set(channel, [callbackObj])
            }
            else {
                this.subscriptions.get(channel).push(callbackObj);
            }

            if (bus.bus.channels.length == 1) {
                this.setupListener()
            }
            return callbackObj;
        }

        setupListener(parent) {
            bus.bus.on('notification', parent, notifications => {
                notifications.forEach(notification => {
                    if (this.subscriptions.has(notification[0])) {
                        this._notify(notification[0], notification[1]);
                    }
                });
            });
            bus.bus.start_polling();
        }

        sendMessage(channel, message) {
            session.rpc("/longpolling/send", {channel, message});
        }

        _notify(channel, message) {
            if (this.subscriptions.has(channel)) {
                let callbacks = this.subscriptions.get(channel);
                callbacks.forEach(callback => callback.callback(message));
            }
        }

    }

    return {
        Callback,
        Syncer
    }
});
