/* @author: Hoang Phan <pquochoang2007@gmail.com> */

openerp.image_viewer = function (instance) {

    var mail = instance.mail;

    var load_scripts = _.once(function () {
        instance.web.loadJS('/image_viewer/static/lib/fancybox/lib/jquery.mousewheel-3.0.6.pack.js');
        instance.web.loadCSS("/image_viewer/static/lib/fancybox/source/jquery.fancybox.css?v=2.1.5");
        instance.web.loadJS("/image_viewer/static/lib/fancybox/source/jquery.fancybox.pack.js?v=2.1.5");
        instance.web.loadCSS("/image_viewer/static/lib/fancybox/source/helpers/jquery.fancybox-buttons.css?v=1.0.5");
        instance.web.loadJS("/image_viewer/static/lib/fancybox/source/helpers/jquery.fancybox-buttons.js?v=1.0.5");
        instance.web.loadJS("/image_viewer/static/lib/fancybox/source/helpers/jquery.fancybox-media.js?v=1.0.6");
        instance.web.loadCSS("/image_viewer/static/lib/fancybox/source/helpers/jquery.fancybox-thumbs.css?v=1.0.7");
        instance.web.loadJS("/image_viewer/static/lib/fancybox/source/helpers/jquery.fancybox-thumbs.js?v=1.0.7");
    });

    mail.MessageCommon.include({
        init: function (parent, datasets, options) {
            this._super(parent, datasets, options);
            load_scripts();
        },
        build_wg: function (id) {
            this.$el.find('#' + id).fancybox({
                prevEffect: '',
                nextEffect: '',
                helpers: {
                    title: { type: 'outside' },
                    thumbs: { width: 50, height: 50}
                },
                beforeLoad: function () {
                    // trigger before image load
                },
                afterShow: function () {
                    // trigger when image has been shown
                }
            });
        },
        load_base64: function () {
            var self = this;
            var model = new instance.Model('ir.attachment');
            var allow_types = {
                png: 'image/png',
                jpeg: 'image/jpeg',
                jpg: 'image/jpeg',
                gif: 'image/gif'
            };
            _.each(this.attachment_ids, function (attachment) {
                model.query(['datas', 'datas_fname', 'name']).filter([
                    ['id', '=', attachment.id],
                ]).all().then(function (r) {
                    r = _.filter(r, function(rr) {
                        var res = /.*\.(\w+)$/.exec(rr.name);
                        return ~_.indexOf(_.keys(allow_types), res != null ? res[1] : '');
                    });
                    var render = _.after(r.length, self.build_wg.bind(self));
                    _.each(r, function (r) {
                        var res = /.*\.(\w+)$/.exec(r.name);
                        var img = $(_.str.sprintf("img[src*='id=%s']", r.id), self.$(".oe_msg_attachment_list"));
                        if (img.length) {
                            var identity = _.uniqueId('fbx_');
                            var href = _.str.sprintf("data:%s;base64,%s", allow_types[res[1]], r.datas);
                            img.parent()
                                .attr('id', identity)
                                .removeAttr('target')
                                .attr({href: href, title: _.str.sprintf('<a href="%s">%s</a>', attachment.url, r.name)});
                            render(identity);
                        }
                    });
                });
            });
        },
        display_attachments: function () {
            this._super();
            _.defer(_.bind(this.load_base64, this));
        }
    });
}