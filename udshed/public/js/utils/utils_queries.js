window.Udshed = window.Udshed || {};

window.Udshed.UtilsQueries  = {
   

    get_data_of_user(callback)
    {
        frappe.call({
            method: "udshed.api.user_data.get_user_context",
            callback: (e) => {
                console.log("User session data:", e.message);
                callback(e.message);
            },
            error: (err) => {
                console.error("Error fetching user session data:", err);
            }
        });

        frappe.call({
            method: "udshed.api.course.get_teaching_unit_by_year",            
            args: { 
                academic_year: "2025-2026",
                faculty:"FST"
            },
            callback: (e) => {
                // console.log("Udata selected:", e.message);
            },
            error: (err) => {
                console.error("Error fetching udata session data:", err);
            }
        });
    },

    loadLevels(filiere,niveau_field,callback_function) {
        if (!filiere) {
            niveau_field.df.options = [];
            niveau_field.refresh();
            callback_function(null);
            return;
        }

        frappe.call({
            method: "udshed.api.course.get_levels_for_field",
            freeze: true,
            freeze_message: __("Chargement des niveaux académique..."),
            args: { field_of_study: filiere },
            callback: (r) => {
                callback_function(r.message);                
            }
        });
    },

    loadRooms(batiment,salle_field,callback_function) {
        if (!batiment) {
            salle_field.df.options = [];
            salle_field.refresh();
            callback_function(null);
            return;
        }


        frappe.call({
            method: "udshed.api.building.get_room_by_building",
            freeze: true,
            freeze_message: __("Chargement des batiments..."),
            args: { building:batiment },
            callback: (r) => {
                callback_function(r.message);                
            }
        });
    },

}