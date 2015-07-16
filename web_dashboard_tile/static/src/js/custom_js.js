//  @@@ web_dashboard_tile custom JS @@@
//#############################################################################
//    
//    Copyright (C) 2010-2013 OpenERP s.a. (<http://www.openerp.com>)
//    Copyright (C) 2014 initOS GmbH & Co. KG (<http://initos.com>)
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License as published
//    by the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU Affero General Public License for more details.
//
//    You should have received a copy of the GNU Affero General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
//#############################################################################

openerp.web_dashboard_tile = function (instance)
{
var QWeb = instance.web.qweb,
    _t =  instance.web._t,
   _lt = instance.web._lt;
_.mixin({
  sum: function (obj) { return _.reduce(obj, function (a, b) { return a + b; }, 0); }
});
    var module = instance.board.AddToDashboard;

    module.include({
        start: function () {
            this._super();
            var self = this;
            this.$('#add_dashboard_tile').on('click', this, function (){
              self.save_tile();
            })
        },
        render_data: function(dashboard_choices){
            var selection = instance.web.qweb.render(
                "SearchView.addtodashboard.selection", {
                    selections: dashboard_choices});
            this.$("form input").before(selection)
        },
        save_tile: function () {
            var self = this;
            var getParent = this.getParent();
            var view_parent = this.getParent().getParent();
            if (! view_parent.action || ! this.$el.find("select").val()) {
                this.do_warn("Can't find dashboard action");
                return;
            }
            
            var $name = this.$('#dashboard_tile_new_name');
            
            this.tile = new instance.web.Model('tile.tile');
            
            var private_filter = !this.$('#oe_searchview_custom_public').prop('checked');
            if (_.isEmpty($name.val())){
                this.do_warn(_t("Error"), _t("Filter name is required."));
                return false;
            }
            var search = this.view.build_search_data();
            var context = new instance.web.CompoundContext(getParent.dataset.get_context() || []);
            var domain = new instance.web.CompoundDomain(getParent.dataset.get_domain() || []);
            _.each(search.contexts, context.add, context);
            _.each(search.domains, domain.add, domain);

            var c = instance.web.pyeval.eval('context', context);
            for(var k in c) {
                if (c.hasOwnProperty(k) && /^search_default_/.test(k)) {
                    delete c[k];
                }
            }
            // TODO: replace this 6.1 workaround by attribute on <action/>
            c.dashboard_merge_domains_contexts = false;
            var d = instance.web.pyeval.eval('domain', domain);

            context.add({
                group_by: instance.web.pyeval.eval('groupbys', search.groupbys || [])
            });
            // Don't save user_context keys in the custom filter, otherwise end
            // up with e.g. wrong uid or lang stored *and used in subsequent
            // reqs*
            var ctx = context;
            _(_.keys(instance.session.user_context)).each(function (key) {
                delete ctx[key];
            });
            var filter = {
                name: $name.val(),
                user_id: private_filter ? instance.session.uid : false,
                model_id: self.view.model,
                //context: context,
                domain: d,
                action_id: view_parent.action.id,
            };
            // FIXME: current context?
            return self.tile.call('add', [filter]).done(function (id) {
                self.do_warn(_t("Success"), _t("Tile is created"));
            });

        }
    });
}
