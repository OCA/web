 odoo.define("web_addline_large_btn.EditableListRenderer", function(require) {
     "use strict";

     const ListRenderer = require('web.ListRenderer');

     ListRenderer.include({
         _renderRows: function() {
             let self = this;
             let attrs = this.arch.attrs;
             let model = this.state.model;
             let $rows = this._super();
             let use_large_addline_btn = attrs.use_large_addline_btn ? true : false;
             let use_large_addline_model = attrs.use_large_addline_model ? attrs.use_large_addline_model : false;
             let use_large_addline_btn_class = attrs.use_large_addline_btn_class || 'btn btn-primary';
             if ($rows && use_large_addline_btn && use_large_addline_model && $rows.length && model == use_large_addline_model) {
                 for (let i = 0; i < $rows.length; i++) {
                     let ele = $rows[i].find('td a[role="button"]');
                     if (ele.length) {
                         $rows[i].find('td a[role="button"]').addClass(use_large_addline_btn_class);
                     }
                 }
             }
             return $rows;
         }
     })
 })