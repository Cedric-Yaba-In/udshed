// Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
// For license information, please see license.txt

frappe.ui.form.on("Teacher", {
	refresh(frm) {
        if( frappe.user.has_role('System Manager'))
        {
            if( frm.doc.user) {
                frm.add_custom_button(__('Compte utilisateur'), () => {
                    frappe.set_route("Form","User",frm.doc.user)
                });
            }
        }

        // frm.set_value({
        //   full_name: `${frm.doc.first_name || ''} ${frm.doc.last_name || ''}`,
        // })
    }
});
