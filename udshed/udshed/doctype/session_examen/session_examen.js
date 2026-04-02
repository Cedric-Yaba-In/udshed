// Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
// For license information, please see license.txt

frappe.ui.form.on("Session Examen Field of study Level", {
	filiere(frm, cdt, cdn){
        console.log("Filiere changed:", frm.doc.filiere);
		// met à jour le get_query du champ 'niveau' pour cette ligne
		frm.fields_dict['classes_concernees'].grid.update_docfield_property('niveau', 'get_query', function() {
			let row = locals[cdt][cdn];


			if (!row.filiere) {
				return {}; // pas de filtre si aucune filière
			}

			// console.log("Setting get_query for niveau with filiere:", locals);

			return {
				query: "udshed.api.course.get_levels",
				filters: { parent: row.filiere } // filtre Link vers Field of Study Level
			};
		});
	},
});