(function () {
    'use strict';

    var website = openerp.website;
    var _t = openerp._t;
    website.RTE.include({
        _config: function () {
            // add anchor button
            var config = this._super();
            config.plugins = config.plugins.concat(',link');
            _.each(config.toolbar, function (tb) {
                if (tb.name === 'span'){
                    tb.items.unshift('Anchor');
                }
            });
            return config;
        },
    });
})();


