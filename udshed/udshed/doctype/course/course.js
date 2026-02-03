// Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
// For license information, please see license.txt

frappe.ui.form.on("Course", {
    refresh: function (frm) {
        frm.set_value({
            "nombre_dheure_total":parseInt(frm.doc.nombre_dheure_cm) + parseInt(frm.doc.nombre_dheure_tp) 
        })
    },
	filiere(frm) {
        if(!frm.doc.filiere) {
            frm.set_value({ niveau: '', })
            return;
        }
        // frappe.db.get_list('Niveau', {
        //     filters: { 
        //         filiere: frm.doc.filiere
        //     },
        //     order_by: 'name asc',
        //     limit_page_length:1
        // }).then((r) =>{
        //     frm.set_value('niveau',r.length ? r)
        // })
        frm.fields_dict['niveau'].get_query = function (doc) {
            return {
                filters: {
                    filiere: frm.doc.filiere
                }
            }
        }
    }
});
