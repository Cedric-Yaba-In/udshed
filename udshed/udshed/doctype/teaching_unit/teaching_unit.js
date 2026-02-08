// Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
// For license information, please see license.txt

frappe.ui.form.on("Course Field of study level item", {
	filiere(frm, cdt, cdn){

        let row = frappe.get_doc(cdt, cdn);
        console.log("Row ",row)
		// reset le niveau pour cette ligne
		row.niveau = null;
		frm.refresh_field('course_levels');

		// met à jour le get_query du champ 'niveau' pour cette ligne
		frm.fields_dict['course_levels'].grid.update_docfield_property('niveau', 'get_query', function() {
            console.log("get_query called for niveau with filiere:", row);
			if (!row.filiere) {
				return {}; // pas de filtre si aucune filière
			}

			// let row = locals[cdt][cdn];

			return {
				query: "udshed.api.course.get_levels",
				filters: { parent: row.filiere } // filtre Link vers Field of Study Level
			};
		});
	},
});
