/*******************************************************************************
See __openerp__.py file for Copyright and Licence Informations.
*******************************************************************************/

openerp.web_widget_float_formula = function (instance) {

    instance.web.FormView = instance.web.FormView.extend({
        /***********************************************************************
        Overload section 
        ***********************************************************************/

        /**
         * Overload : '_process_save' function 
            1: to force computation of formula if the user realize a keydown directly after the formula input in a tree view ;
            2: to clean up the '_formula_text' value in all case to avoid bugs in tree view ;
         */
        _process_save: function(save_obj) {
            for (var f in this.fields) {
                if (!this.fields.hasOwnProperty(f)) { continue; }
                f = this.fields[f];
                if (f.hasOwnProperty('_formula_text')){
                    currentval = f.$('input').attr('value')
                    if (typeof currentval != 'undefined'){
                        formula = f._get_valid_expression(currentval);
                        if (formula){
                            f._compute_result();
                        }
                    }
                    f._clean_formula_text();
                }
            }
            return this._super(save_obj);
        },

    });

    instance.web.form.FieldFloat = instance.web.form.FieldFloat.extend({
        /***********************************************************************
        Overload section 
        ***********************************************************************/

        /**
         * Overload : 'start' function to catch 'blur' and 'focus' events.
         */
        start: function() {
            this.on("blurred", this, this._compute_result);
            this.on("focused", this, this._display_formula);
            return this._super();
        },

        /**
         * Overload : 'initialize_content' function to clean '_formula_text' value.
         */
        initialize_content: function() {
            this._clean_formula_text();
            return this._super();
        },

        /***********************************************************************
        Custom section 
        ***********************************************************************/

        /**
         * keep in memory the formula to allow user to edit it again.
         The formula has to be keeped in memory until a 'save' action.
         */
        _formula_text: '',

        /**
         * Clean '_formula_text' value.
         */
        _clean_formula_text: function() {
            this._formula_text = '';
        },

        /**
         * Return a valid formula from a val, if possible.
         Otherwise, return false.
         */
        _get_valid_expression: function(val) {
            // Trim the value
            currenttxt = val.toString().replace(/^\s+|\s+$/g, '');
            // Test if the value is a formula
            if (currenttxt[0] == '=') {
                // allowed chars : [0-9] .,+-/*() and spaces
                myreg = RegExp('[0-9]|\\s|\\.|,|\\(|\\)|\\+|\\-|\\*|\\/','g')
                // Test to avoid code injonction in eval function.
                if (currenttxt.substring(1).replace(myreg, '') == ''){
                    try {
                        // Try to compute
                        formula = currenttxt.substring(1).replace(/,/g,'.');
                        var floatval = eval(formula);
                    }catch (e) {}
                    if (typeof (floatval) != 'undefined'){
                        return formula;
                    }
                }
            }
            return false;
        },

        /**
         * test if the content of the field is a valid formula, 
         * compute the result, and replace the current value by the final result.
         */
        _compute_result: function() {
            var formula
            // Erase old formula
            this._formula_text = '';
            
            formula = this._get_valid_expression(this.$el.find('input').attr('value'));
            if (formula){
                // Store new formula
                this._formula_text = "=" + formula;
                // put the result in the field
                this.set_value(eval(formula));
                // Force rendering anyway to avoid format loss if no change
                this.render_value();
            }
        },

        /**
         * Display the stored formula in the field, to allow modification.
         */
        _display_formula: function() {
            if (this._formula_text != ''){
                this.$el.find('input').val(this._formula_text);
            }
        },

    });
};
