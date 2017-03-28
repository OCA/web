/**
*    Copyright 2013 Matthieu Moquet
*    Copyright 2016-2017 LasLabs Inc.
*    License MIT (https://opensource.org/licenses/MIT)
**/

(function() {
    'use strict';

    Darkroom.Transformation = Transformation;

    function Transformation(options) {
        this.options = options;
    }

    Transformation.prototype = {
        applyTransformation: function() { /* no-op */ }
    };

    // Inspired by Backbone.js extend capability.
    Transformation.extend = function(protoProps) {
        var parent = this;
        var child;

        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function() { return parent.apply(this, arguments); };
        }

        Darkroom.Utils.extend(child, parent);

        var Surrogate = function() { this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();

        if (protoProps) Darkroom.Utils.extend(child.prototype, protoProps);

        child.__super__ = parent.prototype;
        
        return child;
    };
})();
