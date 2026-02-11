window.Udshed = window.Udshed || {};

window.Udshed.Dialogs = {

    openCreatePlanningDialog(filter,day, halfDay,userContext,callbak) {
        if(!filter.academic_year) {
            frappe.msgprint({
                title: "Année académique requise",
                indicator: "red",
                message: "Veuillez sélectionner une année académique avant de créer une planification."
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
        

        // TODO check user context role
        // if(!Udshed.Perms.user_can_edit_planning_cell(filter,userContext)) return;

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
                    options: [ "Cours", "Traveaux Pratiques (TP)", "Controlle Continue (CC)", "Examen de session normal", "Examen de rattrapage"],
                    reqd: 1
                },
                {
                    fieldtype: "Link",
                    label: "Batiment",
                    fieldname: "batiment",
                    options: "Building",
                    change() {

                        Udshed.Queries.loadRooms(this.get_value(),cur_dialog.fields_dict.salle,(data)=>{
                            cur_dialog.fields_dict.salle.df.options = data;
                            cur_dialog.fields_dict.salle.refresh();
                        });
                    }
                },
                {
                    fieldtype: "Select",
                    label: "Salle",
                    fieldname: "salle",
                },                
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
                        // if (err.exc_type === "ValidationError") {
                        //     frappe.msgprint({
                        //     title: "Conflit de planning",
                        //     indicator: "red",
                        //     message: err.exception.split(":")[1]   // <-- ici ton texte: "Conflit de planning détecté..."
                        //     });
                        //     return;
                        // } else {
                        //     frappe.msgprint({
                        //     title: "Erreur inattendue",
                        //     indicator: "red",
                        //     message: "Une erreur est survenue, vérifiez la console."
                        //     });
                        //     console.error(err);
                        //     return;
                        // }
                        }
                });
            }
        });

        dialog.show();
    },


    openEditPlanningDialog(filter,day, halfDay,course,userContext,callback) {
        console.log("Cours ",course)
        // TODO check user context role
        // if(!Udshed.Perms.user_can_edit_planning_cell(filter,userContext)) return;
        const dialog = new frappe.ui.Dialog({
            title: "Modifier la planification",
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
                    reqd: 1,
                    default: course.item.cours,
                },
                { 
                    fieldtype: "Select",
                    label: "Type",
                    default: course.item.type,
                    fieldname: "course_type",
                    options: [ "Cours", "Traveaux Pratiques (TP)", "Controlle Continue (CC)", "Examen de session normal", "Examen de rattrapage"],
                    reqd: 1
                },
                {
                    fieldtype: "Link",
                    label: "Batiment",
                    fieldname: "batiment",
                    options: "Building",
                    default: course.item.batiment,
                    change() {

                        Udshed.Queries.loadRooms(this.get_value(),cur_dialog.fields_dict.salle,(data)=>{
                            cur_dialog.fields_dict.salle.df.options = data;
                            cur_dialog.fields_dict.salle.refresh();
                        });
                    }
                },
                {
                    fieldtype: "Select",
                    label: "Salle",
                    fieldname: "salle",
                    default: course.item.room
                },                
            ],
            primary_action_label: "Mettre à jour",
            // secondary_action_label:"Supprimer",
            primary_action(values) {
                frappe.call({
                    method: "udshed.api.planning_calendar.update_planning",
                    args: {
                        planning_item_name: course.item.name, // ID DocType
                        academic_year:filter.academic_year,
                        ...values,
                        day_of_week: day.toISOString().split('T')[0],
                        half_day: halfDay,
                    },
                    callback: () => {
                    dialog.hide();
                    callback();
                    frappe.show_alert({ message:__('Planning mis à jour.'), indicator:'green' });
                    }
                });
            }
        });
         dialog.$wrapper.find(".modal-footer").prepend(`
            <button class="btn btn-danger btn-delete-planning">
                <i class="fa fa-trash"></i> Supprimer
            </button>
        `);
        dialog.$wrapper.find(".btn-delete-planning").on("click", () => {
                frappe.confirm(
                    __("Voulez-vous vraiment supprimer ce planning ?"),
                    () => {
                        Udshed.Queries.deletePlanning(course.item.name,()=>{
                            dialog.hide();
                            callback();
                        });
                        
                    }
                );
        });
        dialog.show();
       
    }
};
/**End Dialog */