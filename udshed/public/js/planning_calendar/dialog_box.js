window.Udshed = window.Udshed || {};

window.Udshed.Dialogs = {

    openCreatePlanningDialog(filter,day,halfDay,halfLibelle,userContext,callbak) {
        if(!filter.academic_year) {
            frappe.msgprint({
                title: __("Année académique requise"),
                indicator: "red",
                message: __("Veuillez sélectionner une année académique avant de créer une planification.")
            });
            return;
        }

        if(!filter.faculty) {
        	frappe.msgprint({
        		title: __("Faculté requise"),
        		indicator: "red",
        		message: __("Veuillez sélectionner une faculté avant de créer une planification.")
        	});
        	return;
        }
        if(!filter.filiere)
        {
        	frappe.msgprint({
        		title: __("Filière requise"),
        		indicator: "red",
        		message: __("Veuillez sélectionner une filière avant de créer une planification.")
        	});
            return;
        }
        
        if(!filter.niveau) {
        	frappe.msgprint({
        		title: __("Niveau requis"),
        		indicator: "red",
        		message: __("Veuillez sélectionner un niveau avant de créer une planification.")
        	});
        	return;
        }       
        

        // TODO check user context role
        // if(!Udshed.Perms.user_can_edit_planning_cell(filter,userContext)) return;
        hafPeriod = halfLibelle?`(${halfLibelle})`:'';

        const dialog = new frappe.ui.Dialog({
            title: __(`Nouvelle planification du ${day.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })} ${hafPeriod}`),
            fields: [
                {
                    fieldtype: "Link",
                    label: __("Cours"),
                    fieldname: "cours",
                    options: "Teaching Unit",
                    get_query() {
                        return {
                            query:"udshed.api.course.get_teaching_unit_by_level",
                            freeze: true,
                            freeze_message: __("Chargement des cours..."),
                            filters: {
                                ...filter
                            }
                        };
                    },
                    reqd: 1,
                    change() {
                        // console.log("Value ",this.get_value())
                    //    cur_dialog.fields_dict.mode.set_value(this.get_value())
                    }
                },
                { 
                    fieldtype: "Select",
                    label: __("Type"),
                    fieldname: "course_type",
                    options: [ __("Cours"), 
                        __("Traveaux Pratiques (TP)"),
                         __("Controlle Continue (CC)"), 
                         __("Examen de session normal"),
                         __("Traveaux Dirigés (TD)"),
                          __("Examen de rattrapage")],
                    reqd: 1
                },
                { 
                    fieldtype: "Select",
                    label: __("Mode"),
                    fieldname: "mode",
                    options: [ "En présentiel", "En ligne"],
                    default:"En présentiel",
                    reqd: 1,
                    change:function (){
                        dialog.refresh()
                    }
                },
                {
                    fieldtype: "Link",
                    label: __("Batiment"),
                    fieldname: "batiment",
                    options: "Building",
                    depends_on:'eval:doc.mode=="En présentiel"',
                    change() {

                        Udshed.UtilsQueries.loadRooms(this.get_value(),cur_dialog.fields_dict.salle,(data)=>{
                            cur_dialog.fields_dict.salle.df.options = data;
                            cur_dialog.fields_dict.salle.refresh();
                        });
                    }
                },
                {
                    fieldtype: "Select",
                    label: __("Salle"),
                    fieldname: "salle",
                    depends_on:'eval:doc.mode=="En présentiel"',
                },                
            ],
            primary_action_label: __("Créer"),
            primary_action(values) {
                frappe.call({
                    method: "udshed.api.planning_calendar.create_planning",
                    args: {
                        academic_year:filter.academic_year,
                        freeze: true,
                        freeze_message: __("Nouvelle plannification en cours..."),
                        ...values,
                        day_of_week: day.toISOString().split('T')[0],
                        half_day: halfDay,
                    },
                    callback: (e) => {
                        dialog.hide();
                        frappe.show_alert({ message:__('Planning crée.'), indicator:'green' });
                        frappe.utils.play_sound("submit");
                        callbak();
                    },
                    error: (err) => {
                        frappe.utils.play_sound("error");
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


    openEditPlanningDialog(filter,day, halfDay,halfLibelle,course,userContext,callback) {

        // TODO check user context role
        // if(!Udshed.Perms.user_can_edit_planning_cell(filter,userContext)) return;
        const dialog = new frappe.ui.Dialog({
            title: __("Modifier la planification"),
            fields: [
                {
                    fieldtype: "Link",
                    label: __("Cours"),
                    fieldname: "cours",
                    options: "Teaching Unit",
                    get_query() {
                        return {
                            query:"udshed.api.course.get_teaching_unit_by_level",
                            freeze: true,
                            freeze_message: __("Chargement des cours..."),
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
                    label: __("Mode"),
                    fieldname: "mode",
                    options: [ "En présentiel", "En ligne"],
                    default:"En présentiel",
                    reqd: 1
                },
                { 
                    fieldtype: "Select",
                    label: "Type",
                    default: course.item.type,
                    fieldname: "course_type",
                    options: [  __("Cours"), __("Traveaux Pratiques (TP)"), __("Controlle Continue (CC)"), __("Examen de session normal"), __("Examen de rattrapage")],
                    reqd: 1
                },
                { 
                    fieldtype: "Select",
                    label: __("Mode"),
                    fieldname: "mode",
                    options: [ "En présentiel", "En ligne"],
                    default:course.item.mode,
                    reqd: 1,
                    change:function (){
                        dialog.refresh()
                    }
                },
                {
                    fieldtype: "Link",
                    label: __("Batiment"),
                    fieldname: "batiment",
                    options: "Building",
                    default: course.item.batiment,
                    depends_on:'eval:doc.mode=="En présentiel"',
                    change() {

                        Udshed.UtilsQueries.loadRooms(this.get_value(),cur_dialog.fields_dict.salle,(data)=>{
                            cur_dialog.fields_dict.salle.df.options = data;
                            cur_dialog.fields_dict.salle.refresh();
                        });
                    }
                },
                {
                    fieldtype: "Select",
                    label: __("Salle"),
                    fieldname: "salle",
                    default: course.item.room,
                    depends_on:'eval:doc.mode=="En présentiel"',
                },                
            ],
            primary_action_label: "Mettre à jour",
            // secondary_action_label:"Supprimer",
            primary_action(values) {
                frappe.call({
                    method: "udshed.api.planning_calendar.update_planning",
                    freeze: true,
                    freeze_message: __("Mise à jour du planning en cours..."),
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
                        frappe.utils.play_sound("submit");
                    },
                    error: (err) => {
                        console.error(err);
                        frappe.utils.play_sound("error");
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
                        Udshed.PlanningQueries.deletePlanning(course.item.name,()=>{
                            dialog.hide();
                            callback();
                        });
                        
                    }
                );
        });
        dialog.show();
       
    },

    openSendPlanningDialog(filter,userContext,callbak) {
       
        // hafPeriod = halfLibelle?`(${halfLibelle})`:'';

        const dialog = new frappe.ui.Dialog({
            title: __(`Nouvel envoi de planning par mail`),
            fields: [
                {
                    fieldtype: "Check",
                    label: __("Envoyer à tous les enseingnats"),
                    fieldname: "to_all_teacher",
                    depends_on:() => filter.niveau?true:false,
                    default:false
                },
                { 
                    fieldtype: "Check",
                    label: __("Envoyer à l'enseingnant"),
                    depends_on:() => filter.teacher?true:false,
                    fieldname: "to_teacher",
                    default:false
                },                
                {
                    fieldtype: "Check",
                    label: __("Recevoir le planning"),
                    fieldname: "to_me",
                    default:false
                },                
            ],
            primary_action_label: __("Envoyer le planning"),
            primary_action(values) {
                frappe.call({
                    method: "udshed.api.planning_calendar_email.send_planning_to_mail",
                    freeze: true,
                    freeze_message: "Envoi du planning en cours...",
                    args: {
                        filters:{...filter},
                        ...values,
                    },
                    callback: (e) => {
                        dialog.hide();
                        frappe.show_alert({ message:__('Planning envoyé.'), indicator:'green' });
                        frappe.utils.play_sound("submit");
                        callbak();
                    },
                    error: (err) => {
                        frappe.utils.play_sound("error");
                    }
                });
            }
        });

        dialog.show();
    },
};
/**End Dialog */