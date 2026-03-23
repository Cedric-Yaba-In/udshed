// Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
// For license information, please see license.txt

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
                make_download(r.message)
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
                make_download(r.message)
            },
            error: function(r) {
                console.log("Error ",r)
                frappe.msgprint(__("Erreur lors de la génération du contrat"));
            }
        });
    }

});

function make_download(data)
{
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "contract_to_signed.docx";
    link.click();
}
