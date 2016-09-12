/* 
Copyright 2016 ThinkOpen Solutions
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/

(function(){

    "use strict";

    var _t = openerp._t;
    var _lt = openerp._lt;
    var QWeb = openerp.qweb;
    var web_switch_lang = openerp.web_switch_lang = {};

    web_switch_lang.SwitchButton = openerp.Widget.extend({
        template: 'web_switch_lang.SwitchButton',
        events: {
            "click": "clicked",
        },
        init: function(parent, langs) {
        	this._super(parent);
        	this.langs = langs;
        },
        start: function() {
        	this._super();
        	var is_eng = (function(l) { return l['local_code'] === 'en_US'; });
        	var other_lang = _.chain(this.langs).reject(is_eng).first().value();
        	if(openerp.session.user_context.lang === 'en_US') {
        		var selected = 'EN';
        		var unselected = other_lang['iso_code'].toUpperCase();
        		this.switch_to = 'en_US';
        	} else {
        		var selected = other_lang['iso_code'].toUpperCase();
        		var unselected = 'EN';
        		this.switch_to = other_lang['local_code'];
        	}
        	this.$el.find('.selected-lang').text(selected);
        	this.$el.find('.unselected-lang').text(unselected);
        },
        clicked: function(ev) {
            ev.preventDefault();
            this.trigger("clicked", this.switch_to);
        },
    });
    
    var switch_language = function(event, lang) {
    	var Users = new openerp.web.Model('res.users');
    	Users.call('write', [openerp.session.uid, {'lang': lang}]).then(function() {
    		window.location.reload();
    	});
    };

    if(openerp.web && openerp.web.UserMenu) {
        openerp.web.UserMenu.include({
            do_update: function(){
                var self = this;
                var Users = new openerp.web.Model('res.users');
                Users.call('has_group', ['base.group_user']).done(function(is_employee) {
                    if (is_employee) {
                        self.update_promise.then(function() {
                        	self.rpc("/web/session/get_installed_languages", {}).done(function(langs) {
                        		var button = new openerp.web_switch_lang.SwitchButton(this, langs);
                        		button.on("clicked", this, switch_language);
                        		button.appendTo(window.$('.oe_systray'));
                        	});
                        });
                    }
                });
                return this._super.apply(this, arguments);
            },
        });
    }

    return web_switch_lang;
})();
