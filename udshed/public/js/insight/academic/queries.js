window.Udshed = window.Udshed || {};
window.Udshed.Insight = window.Udshed.Insight || {};
window.Udshed.Insight.Academic = window.Udshed.Insight.Academic || {};
window.Udshed.Insight.Academic.Queries =   {
   
    getQueriesYearDashbord(data,callback)
    {
        frappe.call({
            method: "udshed.api.statistic_course.statistic_year",
            freeze:true,
            freeze_message: __("Chargement du tableau analytique..."),
            args: data,
            callback: (e) => {
                console.log("User session Year:", e.message);
                callback(e.message);
            },
            error: (err) => {
                console.error("Error fetching user session data:", err);
            }
        });

    },
    getQueriesFacultyDashbord(data,callback)
    {
        frappe.call({
            method: "udshed.api.statistic_course.statistic_cours_faculte",
            freeze:true,
            freeze_message: __("Chargement du tableau analytique..."),
            args: data,
            callback: (e) => {
                console.log("User session Faculty:", e.message);
                callback(e.message);
            },
            error: (err) => {
                console.error("Error fetching user session data:", err);
            }
        });

    },
    getQueriesFieldOfStudyDashbord(data,callback)
    {
        frappe.call({
            method: "udshed.api.statistic_course.statistic_fieldofstudy",
            freeze:true,
            freeze_message: __("Chargement du tableau analytique..."),
            args: data,
            callback: (e) => {
                console.log("User session field of study:", e.message);
                callback(e.message);
            },
            error: (err) => {
                console.error("Error fetching user session data:", err);
            }
        });
    },
    getQueriesFieldOfStudyLevelDashbord(data,callback)
    {
        frappe.call({
            method: "udshed.api.statistic_course.statistic_level",
            freeze:true,
            freeze_message: __("Chargement du tableau analytique..."),
            args: data,
            callback: (e) => {
                console.log("User session level:", e.message);
                callback(e.message);
            },
            error: (err) => {
                console.error("Error fetching user session data:", err);
            }
        });

    },
    getQueriesTeacherDashbord(data,callback)
    {
        frappe.call({
            method: "udshed.api.statistic_course.statistic_teacher",
            freeze:true,
            freeze_message: __("Chargement du tableau analytique..."),
            args: data,
            callback: (e) => {
                console.log("User session teacher:", e.message);
                callback(e.message);
            },
            error: (err) => {
                console.error("Error fetching user session data:", err);
            }
        });
    },

}