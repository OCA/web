/*global openerp, _, $ */

openerp.web_tree_no_open = function (instance) {

    instance.web.ListView.List.include({
        row_clicked: function (e, view) {
            if( this.view.is_action_enabled('open') )
                this._super.apply(this, arguments);
        },
    });

}
