/** @odoo-module **/
// Copyright 2026 Akretion (http://www.akretion.com).
// @author Florian Mounier <florian.mounier@akretion.com>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import {
    Component,
    onWillUnmount,
    useEffect,
    useExternalListener,
    useRef,
    useState,
} from "@odoo/owl";
import {FormStatusIndicator} from "@web/views/form/form_status_indicator/form_status_indicator";
import {patch} from "@web/core/utils/patch";
import {usePopover} from "@web/core/popover/popover_hook";
import {useWebsocketBroadcastChannel} from "../../../core/utils/hooks.esm";

class ConcurrentEditWarningPopover extends Component {}
ConcurrentEditWarningPopover.template =
    "web_concurrent_edit_global_warning.ConcurrentEditWarningPopover";

class ConcurrentSaveWarningPopover extends Component {}
ConcurrentSaveWarningPopover.template =
    "web_concurrent_edit_global_warning.ConcurrentSaveWarningPopover";

patch(
    FormStatusIndicator.prototype,
    "web_concurrent_edit_global_warning.FormStatusIndicator",
    {
        setup() {
            this.dirtyRemotes = useState([]);
            this.remoteSaved = useState({value: false});
            this.broadcastChannel = useWebsocketBroadcastChannel(
                (message) => this._handleChannelMessage(message),
                () =>
                    this._refreshConcurrentEditRemotes(
                        this.props.model.root.resModel,
                        this.props.model.root.resId
                    ),
                {debug: location.search.includes("debug=ws")}
            );

            this.popover = usePopover();
            this._currentConcurrentEditPopover = null;
            this._currentConcurrentSavePopover = null;
            this._concurrentEditButtonRef = useRef("concurrent_edit_warning_button");
            this._concurrentSaveButtonRef = useRef("concurrent_save_warning_button");

            // Register save hook:
            const save =
                this.props.model.__bm__.save._orig_save || this.props.model.__bm__.save;
            this.props.model.__bm__.save = async (...args) => {
                const rv = await save.call(this.props.model.__bm__, ...args);
                if (rv && rv.length) {
                    this.recordSaved = true;
                }
                return rv;
            };
            this.props.model.__bm__.save._orig_save = save;

            // On record change, request the current dirty state
            useEffect(
                () => {
                    // Unique identifier specific to model/id
                    const start = !this._uid;
                    this._uid = new Date().getTime();
                    const {resModel, resId} = this.props.model.root;
                    if (!start) {
                        this._refreshConcurrentEditRemotes(resModel, resId);
                    }
                },
                () => [this.props.model.root.resId, this.props.model.root.resModel]
            );

            // Notify others when local dirty state changes
            useEffect(
                () => {
                    const {resModel, resId} = this.props.model.root;
                    this._notifyConcurrentEditChange(resModel, resId, this.dirty);
                },
                () => [
                    this.dirty,
                    this.props.model.root.resId,
                    this.props.model.root.resModel,
                ]
            );

            useEffect(
                () => {
                    // Auto open popover when concurrent edit detected
                    if (this.showConcurrentEditWarning) {
                        this.openConcurrentEditWarningPopover();
                    } else {
                        this.closeConcurrentEditWarningPopover();
                        // Auto open popover when remote save detected
                        if (this.showConcurrentSaveWarning) {
                            this.openConcurrentSaveWarningPopover();
                        } else {
                            this.closeConcurrentSaveWarningPopover();
                        }
                    }
                },
                () => [
                    this.showConcurrentEditWarning,
                    this.showConcurrentSaveWarning,
                    this.dirtyRemotes.length,
                ]
            );

            const unregisterBeforeUnload = () => {
                const {resModel, resId} = this.props.model.root;
                this._notifyConcurrentEditChange(resModel, resId, false);
            };

            onWillUnmount(unregisterBeforeUnload.bind(this));
            useExternalListener(
                window,
                "beforeunload",
                unregisterBeforeUnload.bind(this)
            );
        },

        _handleChannelMessage(message) {
            const {resModel, resId} = this.props.model.root;
            // Change remote dirty state according to remote message
            if (message.type === "change") {
                if (resModel === message.resModel && resId === message.resId) {
                    if (message.dirty && !this.dirtyRemotes.includes(message.uid)) {
                        this.dirtyRemotes.push(message.uid);
                    } else if (
                        !message.dirty &&
                        this.dirtyRemotes.includes(message.uid)
                    ) {
                        this.dirtyRemotes.splice(
                            this.dirtyRemotes.indexOf(message.uid),
                            1
                        );
                    }
                    if (message.saved) {
                        this.remoteSaved.value = true;
                    }
                }
                // Sync request: reply with current dirty state
            } else if (message.type === "sync") {
                if (resId && resModel === message.resModel && resId === message.resId) {
                    this._notifyConcurrentEditChange(resModel, resId, this.dirty);
                }
            }
        },

        _notifyConcurrentEditChange(resModel, resId, dirty) {
            if (!resId) {
                // Don't notify if record doesn't exist yet
                return;
            }
            this.broadcastChannel.postMessage({
                type: "change",
                resModel,
                resId,
                dirty,
                saved: this.recordSaved,
                uid: this._uid,
            });
            this.recordSaved = false;
        },
        _refreshConcurrentEditRemotes(resModel, resId) {
            this.dirtyRemotes.splice(0, this.dirtyRemotes.length);
            this.broadcastChannel.postMessage({
                type: "sync",
                resModel,
                resId,
                uid: this._uid,
            });
        },

        openConcurrentEditWarningPopover() {
            if (this._currentConcurrentEditPopover) {
                this.closeConcurrentEditWarningPopover();
            }
            if (!this._concurrentEditButtonRef.el) {
                return;
            }
            this._currentConcurrentEditPopover = this.popover.add(
                this._concurrentEditButtonRef.el,
                ConcurrentEditWarningPopover,
                {
                    onClose: this.closeConcurrentEditWarningPopover.bind(this),
                    userCount: this.dirtyRemotes.length,
                    refreshConcurrentEditRemotes: () => {
                        const {resModel, resId} = this.props.model.root;
                        this._refreshConcurrentEditRemotes(resModel, resId);
                    },
                    discardChanges: () => {
                        this.discard();
                    },
                },
                {
                    position: "bottom",
                    onClose: () => {
                        this._currentConcurrentEditPopover = null;
                    },
                    closeOnClickAway: false,
                }
            );
        },

        closeConcurrentEditWarningPopover() {
            if (this._currentConcurrentEditPopover) {
                this._currentConcurrentEditPopover();
                this._currentConcurrentEditPopover = null;
            }
        },

        toggleConcurrentEditWarningPopover() {
            if (this._currentConcurrentEditPopover) {
                this.closeConcurrentEditWarningPopover();
            } else {
                this.openConcurrentEditWarningPopover();
            }
        },

        openConcurrentSaveWarningPopover() {
            if (this._currentConcurrentSavePopover) {
                this.closeConcurrentSaveWarningPopover();
            }
            if (!this._concurrentSaveButtonRef.el) {
                return;
            }
            this._currentConcurrentSavePopover = this.popover.add(
                this._concurrentSaveButtonRef.el,
                ConcurrentSaveWarningPopover,
                {
                    onClose: this.closeConcurrentSaveWarningPopover.bind(this),
                    refreshConcurrentSaveRemotes: () => {
                        const {resModel, resId} = this.props.model.root;
                        this._refreshConcurrentSaveRemotes(resModel, resId);
                    },
                    refreshChanges: () => {
                        this.reloadRecord();
                    },
                },
                {
                    position: "bottom",
                    onClose: () => {
                        this._currentConcurrentSavePopover = null;
                    },
                    closeOnClickAway: false,
                }
            );
        },

        closeConcurrentSaveWarningPopover() {
            if (this._currentConcurrentSavePopover) {
                this._currentConcurrentSavePopover();
                this._currentConcurrentSavePopover = null;
            }
        },

        toggleConcurrentSaveWarningPopover() {
            if (this._currentConcurrentSavePopover) {
                this.closeConcurrentSaveWarningPopover();
            } else {
                this.openConcurrentSaveWarningPopover();
            }
        },

        async reloadRecord() {
            this.discard();
            await this.props.model.load({}, {keepChanges: true});
            this.remoteSaved.value = false;
        },

        get dirty() {
            return this.props.model.root.isDirty || this.props.fieldIsDirty;
        },

        get remoteDirty() {
            return this.dirtyRemotes.length > 0;
        },

        get showConcurrentEditWarning() {
            return this.remoteDirty && this.dirty;
        },
        get showConcurrentSaveWarning() {
            return this.remoteSaved.value && this.dirty;
        },
    }
);
