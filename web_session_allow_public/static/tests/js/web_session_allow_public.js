/* Copyright 2016 LasLabs Inc.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
 */

odoo.define_section('web_session_allow_public',
                    ['web.Model'],
                    function(test) {
    "use strict";

    test('It should allow a model call',
         {asserts: 1},
         function(assert, Model)
    {
            
        var searched = false;
        var d = $.Deferred();
        
        setTimeout(function() {
            if (searched) {
                assert.ok(searched);
                d.resolve();
            }
        }, 100);
        
        new Model('res.partner')
            .call('search_read', [])
            .then(function() {
                searched = true;
            });
            
    });

});
