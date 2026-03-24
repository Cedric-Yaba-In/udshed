// Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
// For license information, please see license.txt
frappe.require('/assets/udshed/js/utils/utils.js');


frappe.ui.form.on("Teacher", {
	refresh(frm) {
        if( frappe.user.has_role('System Manager') || frappe.user.has_role("Administrator"))
        {
            if( frm.doc.user) {
                frm.add_custom_button(__('Compte utilisateur'), () => {
                    frappe.set_route("Form","User",frm.doc.user)
                });
            }
        }
    },
});

frappe.ui.form.on('Teacher Academic Contract', {

    download_signed_contract: function(frm, cdt, cdn) {

        let row = locals[cdt][cdn];

        frappe.call({
            method: "udshed.api.generate_teacher_doc.download_signed_contract",
            args: {
                url_file:row.signed_contract
            },
            freeze: true,
            freeze_message: __("Téléchargement du contrat en cours..."),
            callback: function(r) {
                Udshed.Utils.make_download_file_word(r.message)
            },
            error: function(r) {
                frappe.msgprint(__("Erreur lors du téléchargement du contrat"));
            }
        });


    },
    signed_contract:function(frm){

    },
    download_contract_to_signed:function() {
        frappe.call({
            method: "udshed.api.generate_teacher_doc.download_contract_to_signed",
            args: {},
            freeze: true,
            freeze_message: __("Téléchargement du modèle en cours..."),
            callback: function(r) {
                Udshed.Utils.make_download_file_word(r.message)
            },
            error: function(r) {
                console.log("Error ",r)
                frappe.msgprint(__("Erreur lors de la génération du contrat"));
            }
        });
    }

});

