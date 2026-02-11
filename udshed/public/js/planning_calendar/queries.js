window.Udshed = window.Udshed || {};

window.Udshed.Queries  = {
    fetchPlanningItems(filter,currentWeekStart,callback_function) {
        // 🔑 ICI tu fais ton appel API pour récupérer les items de la semaine

        if(!filter.academic_year || !filter.filiere || !filter.niveau) {
                console.warn("Missing filters, cannot fetch planning items")
                callback_function([]);
                return;
            }
        // ex:
        frappe.call({
            method: "udshed.api.planning_calendar.get_week_planning",
            args: { 
                academic_year: filter.academic_year,
                filiere: filter.filiere,
                niveau: filter.niveau,
                week_start: currentWeekStart.toISOString().split('T')[0]// format YYYY-MM-DD
            },
            callback: (res) => {
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
                callback_function(Array.from(item_map.values()));
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
            args: { building:batiment },
            callback: (r) => {
                callback_function(r.message);                
            }
        });
    },

    deletePlanning(planning_name,callback_function=()=>{})
    {
        console.log("Planing Name delete ",planning_name)
        frappe.call({
            method: "udshed.api.planning_calendar.delete_planning",
            args: { planning_name:planning_name },
            callback: (r) => {
                callback_function(r.message);                
            }
        });
    }
}