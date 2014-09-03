openerp.web_warning_sound = function(instance) {
    var QWeb = instance.web.qweb;
    var _t = instance.web._t;

    instance.web.FormView = instance.web.FormView.extend({
        on_processed_onchange: function(result, processed) {
            try {
                if (!_.isEmpty(result.sound)) {
                    var audio = new Audio(result.sound);
                    audio.play();
                }
                if (result.value) {
                    this._internal_set_values(result.value, processed);
                }
                if (!_.isEmpty(result.warning)) {
                    instance.web.dialog($(QWeb.render("CrashManager.warning", result.warning)), {
                        title:result.warning.title,
                        modal: true,
                        buttons: [
                            {text: _t("Ok"), click: function() { $(this).dialog("close"); }}
                        ]
                    });
                }

                var fields = this.fields;
                _(result.domain).each(function (domain, fieldname) {
                    var field = fields[fieldname];
                    if (!field) { return; }
                    field.node.attrs.domain = domain;
                });

                return $.Deferred().resolve();
            } catch(e) {
                console.error(e);
                instance.webclient.crashmanager.show_message(e);
                return $.Deferred().reject();
            }
        },
    });

    instance.web.CrashManager = instance.web.CrashManager.extend({
        show_warning: function(error) {
            if (!this.active) {
                return;
            }
            var re = /{{\s*sound\s*:\s*(\S*)+\s*}}/;
            var matches = error.data.fault_code.match(re);
            if (matches && matches.length == 2) {
                var audio = new Audio(matches[1]);
                audio.play();
                error.data.fault_code = error.data.fault_code.replace(re, '');
            }
            instance.web.dialog($('<div>' + QWeb.render('CrashManager.warning', {error: error}) + '</div>'), {
                title: "OpenERP " + _.str.capitalize(error.type),
                buttons: [
                    {text: _t("Ok"), click: function() { $(this).dialog("close"); }}
                ]
            });
        },
    });
}
