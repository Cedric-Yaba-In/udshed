// Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
// For license information, please see license.txt

frappe.ui.form.on("Planning Period", {
	// Au chargement du formulaire
    refresh: function(frm) {
        format_time_without_seconds(frm, 'heure_de_debut');
        format_time_without_seconds(frm, 'heure_de_fin');
    },
    
    // Quand le champ change
    heure_de_debut: function(frm) {
        format_time_without_seconds(frm, 'heure_de_debut');
    },
    heure_de_fin: function(frm) {
        format_time_without_seconds(frm, 'heure_de_fin');
    },
});

function format_time_without_seconds(frm, fieldname) {
    if (frm.doc[fieldname]) {
        // Formater pour enlever les secondes
        let time_str = frm.doc[fieldname];
        
        // Si le format est HH:MM:SS, ne garder que HH:MM
        if (time_str && time_str.includes(':')) {
            let parts = time_str.split(':');
            if (parts.length >= 2) {
                // Ne garder que les heures et minutes
                let formatted = parts[0] + ':' + parts[1];
                
                // Mettre à jour si différent
                if (formatted !== time_str) {
                    frm.set_value(fieldname, formatted);
                }
            }
        }
    }
}
