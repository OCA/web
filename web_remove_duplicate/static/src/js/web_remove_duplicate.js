/* Web Remove Duplicate
   @author: Denis Roussel <denis.roussel@acsone.eu>
   Inspired by the module web_eradicate_duplicate of Alexis Delattre
*/

openerp.web_remove_duplicate = function (instance) {
    var _t = instance.web._t;

    instance.web.FormView.include({
        load_form: function(data) {
            this._super(data);
            // Remove More > Duplicate button except admin
            // if the form has the attribute 'remove_duplicate'
            if (
                    this.sidebar &&
                    this.sidebar.items &&
                    this.sidebar.items.other &&
                    this.session.uid != 1 &&
                    this.fields_view.arch.attrs.remove_duplicate) {
                var new_items_other = _.reject(this.sidebar.items.other, function (item) {
                    return item.label === _t('Duplicate');
                });
                this.sidebar.items.other = new_items_other;
            }
        }
    });
};

/*
EXAMPLE : enable duplicate on account.move :
<record id="view_move_form" model="ir.ui.view">
    <field name="name">remove_duplicate.account_move_form</field>
    <field name="model">account.move</field>
    <field name="inherit_id" ref="account.view_move_form"/>
    <field name="arch" type="xml">
        <xpath expr="/form" position="attributes">
            <attribute name="remove_duplicate">True</attribute>
        </xpath>
    </field>
</record>
*/