//Copyright 2018 Therp BV <https://therp.nl>
//License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
/*global Uint8Array base64js*/

odoo.define('web_drop_target', function(require) {
    var    FormController = require('web.FormController');
    var    core = require('web.core');
    var qweb = core.qweb;

    // this is the main contribution of this addon: A mixin you can use
    // to make some widget a drop target. Read on how to use this yourself
    var DropTargetMixin = {
        // add the mime types you want to support here, leave empty for
        // all types. For more control, override _get_drop_items in your class
        _drop_allowed_types: [],

        _drop_overlay: null,

        start: function() {
            var result = this._super.apply(this, arguments);
            this.$el.on('drop.widget_events', this.proxy('_on_drop'));
            this.$el.on('dragenter.widget_events', this.proxy('_on_dragenter'));
            this.$el.on('dragover.widget_events', this.proxy('_on_dragenter'));
            this.$el.on('dragleave.widget_events', this.proxy('_on_dragleave'));
            return result;
        },

        _on_drop: function(e) {
            var self = this;
            var drop_items = this._get_drop_items(e);
            _.each(drop_items, function(drop_item) {
                var reader = new FileReader();
                reader.onloadend = self.proxy(
                    _.partial(self._handle_file_drop, drop_item.getAsFile())
                );
                reader.readAsArrayBuffer(drop_item.getAsFile());
            });
            this._remove_overlay();
            e.preventDefault();
        },

        _on_dragenter: function(e) {
            if(this._get_drop_items(e).length) {
                e.preventDefault();
                this._add_overlay();
                return false;
            }
        },

        _on_dragleave: function(e) {
            this._remove_overlay();
            e.preventDefault();
        },

        _get_drop_items: function(e) {
            var self = this,
                dataTransfer = e.originalEvent.dataTransfer,
                drop_items = [];
            _.each(dataTransfer.items, function(item) {
                if(
                    _.contains(self._drop_allowed_types, item.type) ||
                    _.isEmpty(self._drop_allowed_types)
                ) {
                    drop_items.push(item);
                }
            });
            return drop_items;
        },

        // eslint-disable-next-line no-unused-vars
        _handle_file_drop: function(drop_file, e) {
            // do something here, for example call the helper function below
            // e is the on_load_end handler for the FileReader above,
            // so e.target.result contains an ArrayBuffer of the data
        },

        _handle_file_drop_attach: function(
                drop_file, e, res_model, res_id, extra_data
        ) {
            // helper to upload an attachment and update the sidebar
            var self = this;
            return this._rpc({
                model: 'ir.attachment',
                method: 'create',
                args: [{
                    'name': drop_file.name,
                    'datas': base64js.fromByteArray(
                            new Uint8Array(e.target.result)
                        ),
                    'datas_fname': drop_file.name,
                    'res_model': res_model,
                    'res_id': res_id,
                }],
            })
            .then(function() {
                // try to find a sidebar and update it if we found one
                var p = self;
                while(p && !p.sidebar) {
                    p = p.getParent ? p.getParent() : null;
                }
                if(p) {
                    var sidebar = p.sidebar;
                    if(sidebar && _.isFunction(sidebar._onFileUploaded)) {
                        sidebar._onFileUploaded();
                    }
                }
            });
        },

        _add_overlay() {
            if(!this._drop_overlay){
                var o_content = jQuery('.o_content'),
                    view_manager = jQuery('.o_view_manager_content');
                this._drop_overlay = jQuery(
                    qweb.render('web_drop_target.drop_overlay')
                );
                var o_content_position = o_content.position();
                this._drop_overlay.css({
                    'top': o_content_position.top, 
                    'left': o_content_position.left,
                    'width': view_manager.width(),
                    'height': view_manager.height()
                });
                o_content.append(this._drop_overlay);
            }
        },
        
        _remove_overlay() {
            this._drop_overlay.remove();
            this._drop_overlay = null;
        },
    };

    // and here we apply the mixin to form views, allowing any files and
    // adding them as attachment
    FormController.include(_.extend(DropTargetMixin, {
        _get_drop_file: function() {
            // disable drag&drop when we're on an unsaved record
            if(!this.datarecord.id) {
                return null;
            }
            return this._super.apply(this, arguments);
        },
        _handle_file_drop: function(drop_file, e) {
            return this._handle_file_drop_attach(
                drop_file, e, this.renderer.state.model, this.renderer.state.res_id
            );
        }
    }));

    return {
        'DropTargetMixin': DropTargetMixin,
    };
});
