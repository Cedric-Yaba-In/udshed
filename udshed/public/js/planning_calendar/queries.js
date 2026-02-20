window.Udshed = window.Udshed || {};

window.Udshed.Queries  = {
    fetchPlanningItems(filter,currentWeekStart,callback_function) {
        if(!Udshed.Utils.isValidFecthDataFilter(filter))
        {
           console.warn("Missing filters, cannot fetch planning items")
            callback_function([]);
            return; 
        }
        // ex:

        frappe.call({
            method: "udshed.api.planning_calendar.get_week_planning",
            freeze: true,
            freeze_message: __("Chargement du planning..."),
            args: { 
                // academic_year: filter.academic_year,
                // filiere: filter.filiere,
                // niveau: filter.niveau,
                ...filter,
                week_start: currentWeekStart.toISOString().split('T')[0]// format YYYY-MM-DD
            },
            callback: (res) => {
                if(!res.message) return callback_function([])
                const items = res.message; // supposons que l'API retourne une liste d'items
                let item_map = new Map()
                for(let item of items) {
                    if(item_map.has(`${item.cours}-${item.date}-${item.period}`)) {
                        item_map.get(`${item.cours}-${item.date}-${item.period}`).teachers.push(item.enseignant);
                    } else {
                        item_map.set(`${item.cours}-${item.date}-${item.period}`, {
                            ...item,
                            teachers: [item.enseignant]
                        }
                        );
                    }
                }
                return callback_function(Array.from(item_map.values()));
            }
        });
    },

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
        console.log("Batimer",batiment)


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

    deletePlanning(planning_name,callback_function=()=>{})
    {
        frappe.call({
            method: "udshed.api.planning_calendar.delete_planning",
            freeze: true,
            freeze_message: __("Suppression du planning en cours..."),
            args: { planning_name:planning_name },
            callback: (r) => {
                callback_function(r.message);                
            }
        });
    },

    loadCoursePeriod(level)
    {
        return new Promise((resolve, reject) => {
            frappe.call({
                method: "udshed.api.planning_calendar.get_period",
                freeze: true,
                freeze_message: __("Chargement des périodes de cours..."),
                args: { field_of_study_level: level },
                callback: (r) => {
                    resolve(r.message);
                }
            });
        })
    },

    loadCourseDefaultPeriod()
    {
        return new Promise((resolve, reject) => {
            frappe.call({
                method: "udshed.api.planning_calendar.get_default_period",
                freeze: true,
                freeze_message: __("Chargement de la période de cours par défaut..."),
                callback: (r) => {
                    resolve(r.message);
                }
            });
        })
    }
    
}