// Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
// For license information, please see license.txt

frappe.ui.form.on("Field of study", {
	before_save: function (frm) {
        console.log(frm.doc)
        if(frm.doc.field_of_study_level.length == 0)
        {
            frappe.show_alert({ message:__('Niveaux d\'études manquants.'), indicator:'red' });
            frappe.throw(null);
        }
	},
});
