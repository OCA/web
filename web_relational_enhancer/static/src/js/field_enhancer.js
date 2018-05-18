odoo.define('web_relational_enhancer.field_enhancer', function(require) {
    /**
       Enhance many2one dropdown and many2many_tags tag
       with additional fields on the 'display_name'
     */

    var relational = require('web.form_relational'),
        common     = require('web.form_common'),
        core       = require('web.core'),
        Model      = require('web.DataModel'),
        _t         = core._t,
        data       = require('web.data')

    function getRelationalField(field, entryList, fields, shouldSkipEntries=true) {
        let dataset = new data.DataSet(this, field.relation),
            def     = new $.Deferred(),
            ids     = _.pluck(_.filter(entryList, entry => {
                        return ( !shouldSkipEntries || !(entry.label.includes('Create') || entry.label.includes('Search')))
            }), 'id')

        try {
            dataset.read_ids(ids, fields).then(res => {
                def.resolve(res)
            })
        } catch(err) {
            console.log(err)
            def.reject()
        }

        return def
    }

    function enhanceMany2ManyTag(data) {
        /**
           If 'display_fields' (comma-separated fields names) is present in 'options'
           this method adds them in the displayed tag.
        */
        let self = this

        if (data.length && 'display_fields' in this.options) {
            let fields  = this.options['display_fields'].split(','),
                results = getRelationalField(this.field, data, fields, false),
                def     = new $.Deferred()

            results.done(res => {
                _(res).each((obj, i) => {
                    _(fields).each(field => {
                        if ( obj[field] ) {
                            data[i].display_name += `\xa0-\xa0${obj[field]}`
                        } else {
                            console.log(`Field: '${field}' does not exist in model: ${self.field.relation}`)
                        }
                    })
                })


                def.resolve(data)
            }).fail(err => console.log(`Error getting relational fields. Error: ${err}`))

            return def
        } else
            return data
    }

    function enhanceMany2OneEntryLabel(result) {

        let self = this

        if (result.length && 'display_fields' in this.options) {
            let fields  = this.options['display_fields'].split(','),
                results = getRelationalField(this.field, result, fields),
                def     = new $.Deferred()

            results.done(res => {
                _(res).each((obj, i) => {
                    _(fields).each(field => {
                        if ( obj[field] ) {
                            result[i].label += `\xa0-\xa0${obj[field]}`
                        } else {
                            console.log(`Field: '${field}' does not exist in model: ${self.field.relation}`)
                        }
                    })
                })


                def.resolve(result)
            }).fail(err => console.log(`Error getting relational fields. Error: ${err}`))

            return def
        }

        return result
    }


    relational.FieldMany2ManyTags.include({
        render_tag(data) {
            let self = this,
                _super = this._super,
                def  = enhanceMany2ManyTag.bind(self)(data)

            if (!Array.isArray(def)) {
                def.done(res => {
                    _super.bind(self)(res)
                })
            } else
                this._super(data)
        }
    })

    relational.FieldMany2One.include({
        render_editable: function() {
            /**
               If 'display_fields' (comma-separated fields names) is present in 'options'
               this method adds them in the displayed dropdown entry.
               We can't use super 'cause of this arch
             */
            var self = this
            this.$input = this.$('input')

            this.init_error_displayer()
            self.$input.on('focus', function() {
                self.hide_error_displayer()
            })

            this.$dropdown = this.$('.o_dropdown_button')
            this.$follow_button = this.$('.o_external_button')

            this.$follow_button.click(function(ev) {
                ev.preventDefault()
                if (!self.get('value')) {
                    self.focus()
                    return
                }
                var context = self.build_context().eval()
                var model_obj = new Model(self.field.relation)
                model_obj.call('get_formview_id', [[self.get('value')], context]).then(function(view_id){
                    var pop = new common.FormViewDialog(self, {
                        res_model: self.field.relation,
                        res_id: self.get('value'),
                        context: self.build_context(),
                        title: _t('Open: ') + self.string,
                        view_id: view_id,
                        readonly: !self.can_write
                    }).open()
                    pop.on('write_completed', self, function(){
                        self.display_value = {}
                        self.display_value_backup = {}
                        self.render_value()
                        self.focus()
                        self.trigger('changed_value')
                    })
                })
            })

            // some behavior for input
            var input_changed = function() {
                if (self.current_display !== self.$input.val()) {
                    self.current_display = self.$input.val()
                    if (self.$input.val() === '') {
                        self.internal_set_value(false)
                        self.floating = false
                    } else {
                        self.floating = true
                    }
                }
            }
            this.$input.keydown(input_changed)
            this.$input.change(input_changed)
            this.$input.on('click', function() {
                if (self.$input.autocomplete('widget').is(':visible')) {
                    self.$input.autocomplete('close')
                } else {
                    if (self.get('value') && ! self.floating) {
                        self.$input.autocomplete('search', '')
                    } else {
                        self.$input.autocomplete('search')
                    }
                }
            })

            // Autocomplete close on dialog content scroll
            var close_autocomplete = _.debounce(function() {
                if (self.$input.autocomplete('widget').is(':visible')) {
                    self.$input.autocomplete('close')
                }
            }, 50)
            this.$input.closest('.modal .modal-content').on('scroll', this, close_autocomplete)

            self.ed_def = $.Deferred()
            self.uned_def = $.Deferred()
            var ed_delay = 200
            var ed_duration = 15000
            var anyoneLoosesFocus = function (e) {
                if (self.ignore_focusout) { return }
                var used = false
                if (self.floating) {
                    if (self.last_search.length > 0) {
                        if (self.last_search[0][0] != self.get('value')) {
                            self.display_value = {}
                            self.display_value_backup = {}
                            self.display_value['' + self.last_search[0][0]] = self.last_search[0][1]
                            self.reinit_value(self.last_search[0][0])
                            self.last_search = []
                        } else {
                            used = true
                            self.render_value()
                        }
                    } else {
                        used = true
                    }
                    self.floating = false
                }
                var has_changed = (self.get('value') === false || self.display_value['' + self.get('value')] !== self.$input.val())
                if (used && has_changed && ! self.no_ed && ! (self.options && (self.options.no_create || self.options.no_quick_create))) {
                    self.ed_def.reject()
                    self.uned_def.reject()
                    self.ed_def = $.Deferred()
                    self.ed_def.done(function() {
                        self.can_create && self.$input && self.show_error_displayer()
                        ignore_blur = false
                        self.trigger('focused')
                    })
                    ignore_blur = true
                    setTimeout(function() {
                        self.ed_def.resolve()
                        self.uned_def.reject()
                        self.uned_def = $.Deferred()
                        self.uned_def.done(function() {
                            self.hide_error_displayer()
                        })
                        setTimeout(function() {self.uned_def.resolve()}, ed_duration)
                    }, ed_delay)
                } else {
                    self.no_ed = false
                    self.ed_def.reject()
                }
            }
            var ignore_blur = false
            this.$input.on({
                focusout: anyoneLoosesFocus,
                focus: function () { self.trigger('focused') },
                autocompleteopen: function () { ignore_blur = true },
                autocompleteclose: function () { setTimeout(function() {ignore_blur = false},0) },
                blur: function () {
                    // autocomplete open
                    if (ignore_blur) { $(this).focus(); return }
                    if (_(self.getChildren()).any(function (child) {
                        return child instanceof common.ViewDialog
                    })) { return }
                    self.trigger('blurred')
                }
            })

            var isSelecting = false
            // autocomplete
            this.$input.autocomplete({
                source: function(req, resp) {
                    self.get_search_result(req.term).done(function(result) {
                        let def = enhanceMany2OneEntryLabel.bind(self)(result)

                        if(!Array.isArray(def)) {
                            def.done(res => {
                                resp(res)
                            })
                        } else
                            resp(result)
                    })
                },
                select: function(event, ui) {
                    isSelecting = true
                    var item = ui.item
                    if (item.id) {
                        self.display_value = {}
                        self.display_value_backup = {}
                        self.display_value['' + item.id] = item.name
                        self.reinit_value(item.id)
                    } else if (item.action) {
                        item.action()
                        // Cancel widget blurring, to avoid form blur event
                        self.trigger('focused')
                    }
                    return false
                },
                focus: function(e, ui) {
                    e.preventDefault()
                },
                autoFocus: true,
                html: true,
                // disabled to solve a bug, but may cause others
                //close: anyoneLoosesFocus,
                minLength: 0,
                delay: 200
            })
            // set position for list of suggestions box
            this.$input.autocomplete( 'option', 'position', { my : 'left top', at: 'left bottom' } )
            // used to correct a bug when selecting an element by pushing 'enter' in an editable list
            this.$input.keyup(function(e) {
                if (e.which === 13) { // ENTER
                    if (isSelecting)
                        e.stopPropagation()
                }
                isSelecting = false
            })
            this.setupFocus(this.$follow_button)
        },
    })

})
