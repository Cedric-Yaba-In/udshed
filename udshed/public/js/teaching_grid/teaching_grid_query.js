window.Udshed = window.Udshed || {};
window.Udshed.TeachingGrid = window.Udshed.TeachingGrid || {};

window.Udshed.TeachingGrid.UtilsQueries = {
    
    load_data(args, callbackFunction) {

        frappe.call({
            method: 'udshed.api.teaching_grid.get_academic_teaching_unit',
            freeze: true,
            freeze_message: __("Chargement de la grille..."),
            args: {...args},
            callback: function(r) {
                
                if (r.message) {
                    callbackFunction(r.message)
                } else {
                    callbackFunction(null)
                }
            }
        });
    },
    import_grid(args,callbackFunction)
    {
        frappe.call({
            method: 'udshed.api.teaching_grid.import_grid',
            freeze: false,
            freeze_message: __("Importation de la grille..."),
            args: {...args},
            error:(error)=>{
                frappe.msgprint({
                        title: __('Erreur'),
                        message: error,
                        indicator: 'red'
                    });
                callbackFunction(null)
            },
            callback: function(r) {
                if (r.message) {
                    callbackFunction(r.message)
                } else {
                    callbackFunction(null)
                    frappe.msgprint({
                        title: __('Erreur'),
                        message: r.message,
                        indicator: 'red'
                    });
                }
            }
        });
    },    
    load_doctype_list(args,callbackFunction)
    {
        frappe.call({
            method: 'frappe.client.get',
            args: {...args},
            callback: function(r) {
                if (r.message) {
                    // nsage.teachers
                    callbackFunction(r.message);
                } else {
                    callbackFunction(null);
                }
            }
        });
    },

    download_template(callbackFunction= ()=>{})
    {
            frappe.call({
            method: 'udshed.api.teaching_grid.download_template',
            freeze: true,
            freeze_message: __("Génération du modele en cours..."),
            callback: function(r) {
                if (r.message && r.message.success) {
                    // Ouvrir l'URL du fichier
                    window.open(r.message.file_url);
                    
                    frappe.show_alert({
                        message: __('Téléchargement du template démarré'),
                        indicator: 'green',
                        seconds: 3
                    });
                    frappe.utils.play_sound("submit");

                } else {
                    frappe.msgprint({
                        title: __('Erreur'),
                        message: r.message.error || __('Impossible de générer le template'),
                        indicator: 'red'
                    });
                }
            }
        });
    },

    export_grid(filters,callbackFunction= ()=>{})
    {
            frappe.call({
            method: 'udshed.api.teaching_grid.export_grid',
            args:{...filters},
            freeze: true,
            freeze_message: __("Exportation de la grille en cours..."),
            callback: function(r) {
                if (r.message && r.message.success) {
                    // Ouvrir l'URL du fichier
                    window.open(r.message.file_url);
                    
                    frappe.show_alert({
                        message: __('Téléchargement de la grille démarré'),
                        indicator: 'green',
                        seconds: 3
                    });
                    frappe.utils.play_sound("submit");

                } else {
                    frappe.msgprint({
                        title: __('Erreur'),
                        message: r.message.error || __('Impossible d\'exporter la grille'),
                        indicator: 'red'
                    });
                }
            }
        });
    }
}
