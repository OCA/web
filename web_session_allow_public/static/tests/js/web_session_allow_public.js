/* Copyright 2016 LasLabs Inc.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
 */

odoo.define_section('web_session_allow_public',
                    ['web.Model'],
                    function(test) {
    "use strict";

    test('It should allow a model call',
         {asserts: 1, rpc: 'rpc'},
         function(assert, Model)
    {
        
        var res = new Model('res.partner').call('search_read', []);
        
        res.then(function() {
            assert.ok(true);
            self.resolve();
        });
        
        return res;
        
    });

});
