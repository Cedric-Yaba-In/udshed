window.Udshed = window.Udshed || {};

window.Udshed.Dialogs = {

    openCreatePlanningDialog(filter,day, halfDay,callbak) {
        if(!filter.filiere)
        {
        	frappe.msgprint({
        		title: "Filière requise",
        		indicator: "red",
        		message: "Veuillez sélectionner une filière avant de créer une planification."
        	});
            return;
        }
        
        if(!filter.niveau) {
        	frappe.msgprint({
        		title: "Niveau requis",
        		indicator: "red",
        		message: "Veuillez sélectionner un niveau avant de créer une planification."
        	});
        	return;
        }
        if(!filter.faculty) {
        	frappe.msgprint({
        		title: "Faculté requise",
        		indicator: "red",
        		message: "Veuillez sélectionner une faculté avant de créer une planification."
        	});
        	return;
        }
        if(!filter.academic_year) {
            frappe.msgprint({
                title: "Année académique requise",
                indicator: "red",
                message: "Veuillez sélectionner une année académique avant de créer une planification."
            });
            return;
        }
        let translateValue = {"Morning":"Matin","Afternoon":"Après-midi"};
        const dialog = new frappe.ui.Dialog({
            title: `Nouvelle planification du ${day.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })} (${translateValue[halfDay]})`,
            fields: [
                {
                    fieldtype: "Link",
                    label: "Cours",
                    fieldname: "cours",
                    options: "Teaching Unit",
                    get_query() {
                        return {
                            query:"udshed.api.course.get_teaching_unit_by_level",
                            filters: {
                                ...filter
                            }
                        };
                    },
                    reqd: 1
                },
                { 
                    fieldtype: "Select",
                    label: "Type",
                    fieldname: "course_type",
                    options: [ "Cours", "Traveaux Pratiques (TP)", "Controlle Continue (CC)", "Examen de session normal", "Examen de rattrapage"]
                }
            ],
            primary_action_label: "Créer",
            primary_action(values) {
                frappe.call({
                    method: "udshed.api.planning_calendar.create_planning",
                    args: {
                        academic_year:filter.academic_year,
                    ...values,
                    day_of_week: day.toISOString().split('T')[0],
                    half_day: halfDay,
                    },
                    callback: (e) => {
                        dialog.hide();
                        frappe.show_alert({ message:__('Planning crée.'), indicator:'green' });
                        callbak();
                    },
                    error: (err) => {
                        // ici on reçoit l'exception Python
                        if (err.exc_type === "ValidationError") {
                            frappe.msgprint({
                            title: "Conflit de planning",
                            indicator: "red",
                            message: err.exception.split(":")[1]   // <-- ici ton texte: "Conflit de planning détecté..."
                            });
                            return;
                        } else {
                            frappe.msgprint({
                            title: "Erreur inattendue",
                            indicator: "red",
                            message: "Une erreur est survenue, vérifiez la console."
                            });
                            console.error(err);
                            return;
                        }
                        }
                });
            }
        });

        dialog.show();
    },


    openEditPlanningDialog(filter,course,callback) {
        const dialog = new frappe.ui.Dialog({
            title: "Modifier la planification",
            fields: [
                {
                    fieldtype: "Link",
                    label: "Cours",
                    fieldname: "subject",
                    options: "Course",
                    default: course.subject,
                    "reqd": 1
                },
                {
                    fieldtype: "Link",
                    label: "Salle",
                    fieldname: "room",
                    options: "Room",
                    default: course.room
                },
                {
                    fieldtype: "Select",
                    label: "Type",
                    fieldname: "course_type",
                    options: ["CM", "TP", "CC", "EXAM"],
                    default: course.course_type
                }
            ],
            primary_action_label: "Mettre à jour",
            primary_action(values) {
                frappe.call({
                    method: "udshed.api.update_planning",
                    args: {
                    name: course.name, // ID DocType
                    ...values
                    },
                    callback: () => {
                    dialog.hide();
                    callback();
                    frappe.show_alert({ message:__('Planning mis à jour.'), indicator:'green' });
                    }
                });
            }
        });

        dialog.show();
    }
};
/**End Dialog */