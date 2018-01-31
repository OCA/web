odoo.define('web.tab_focus', function (require) {
    'use strict';
    var FormRenderingEngine = require('web.FormRenderingEngine');

    FormRenderingEngine.include({
        process_notebook: function($notebook) {
            var $new_notebook = this._super.call(this, $notebook);
            if(!!$notebook.attr('focus-var')) {
                var focus_var = $notebook.attr('focus-var');
                this.view.on("load_record", this, function(record) {
                    var field_value = record[focus_var];
                    var original_pages = $notebook.find('> page');
                    var tabs = $new_notebook.find('ul.nav.nav-tabs > li');
                    var contents = $new_notebook.find('div.tab-content > div.tab-pane');
                    for(var i=0; i<original_pages.length; i++) {
                        var original_page = original_pages.eq(i);
                        var focus_val = original_page.attr('focus-val');
                        if(focus_val === field_value) {
                            tabs.removeClass('active');
                            tabs.eq(i).addClass('active');
                            contents.removeClass('active');
                            contents.eq(i).addClass('active');
                            break;
                        }
                    }
                });
            }
            return $new_notebook;
        }
    });
});
