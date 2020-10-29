"use strict";
/* eslint strict: ["error", "global"] */
/* eslint-disable no-undef, no-implicit-globals, no-unused-vars */
/* Copyright Odoo S.A.
/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 */

 const ParentedMixin = {
    __parentedMixin : true,
    init: function () {
        this.__parentedDestroyed = false;
        this.__parentedChildren = [];
        this.__parentedParent = null;
    },
    /**
     * Set the parent of the current object. When calling this method, the
     * parent will also be informed and will return the current object
     * when its getChildren() method is called. If the current object did
     * already have a parent, it is unregistered before, which means the
     * previous parent will not return the current object anymore when its
     * getChildren() method is called.
     */
    setParent : function (parent) {
        if (this.getParent()) {
            if (this.getParent().__parentedMixin) {
                this.getParent().__parentedChildren = _.without(this
                        .getParent().getChildren(), this);
            }
        }
        this.__parentedParent = parent;
        if (parent && parent.__parentedMixin) {
            parent.__parentedChildren.push(this);
        }
    },
    /**
     * Return the current parent of the object (or null).
     */
    getParent : function () {
        return this.__parentedParent;
    },
    /**
     * Return a list of the children of the current object.
     */
    getChildren : function () {
        return _.clone(this.__parentedChildren);
    },
    /**
     * Returns true if destroy() was called on the current object.
     */
    isDestroyed : function () {
        return this.__parentedDestroyed;
    },
    /**
     * Utility method to only execute asynchronous actions if the current
     * object has not been destroyed.
     *
     * @param {Promise} promise The promise representing the asynchronous
     *                             action.
     * @param {bool} [reject=false] If true, the returned promise will be
     *                              rejected with no arguments if the current
     *                              object is destroyed. If false, the
     *                              returned promise will never be resolved
     *                              or rejected.
     * @returns {Promise} A promise that will mirror the given promise if
     *                       everything goes fine but will either be rejected
     *                       with no arguments or never resolved if the
     *                       current object is destroyed.
     */
    alive: function (promise, reject_call) {
        return new Promise((resolve, reject) => {
            promise.then(() => {
                if (!this.isDestroyed()) {
                    resolve.apply(def, arguments);
                }
            }, () => {
                if (!this.isDestroyed()) {
                    reject.apply(def, arguments);
                }
            }).always(function () {
                if (reject_call) {
                    // noop if def already resolved or rejected
                    reject();
                }
                // otherwise leave promise in limbo
            });
        });
    },
    /**
     * Inform the object it should destroy itself, releasing any
     * resource it could have reserved.
     */
    destroy : function () {
        _.each(this.getChildren(), function (el) {
            el.destroy();
        });
        this.setParent(undefined);
        this.__parentedDestroyed = true;
    },
    /**
     * Find the closest ancestor matching predicate
     */
    findAncestor: function (predicate) {
        var ancestor = this;
        while (ancestor && !(predicate(ancestor)) && ancestor.getParent) {
            ancestor = ancestor.getParent();
        }
        return ancestor;
    },
};
