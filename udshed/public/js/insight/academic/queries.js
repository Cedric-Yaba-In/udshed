window.Udshed = window.Udshed || {};
window.Udshed.Insight = window.Udshed.Insight || {};
window.Udshed.Insight.Academic = window.Udshed.Insight.Academic || {};
window.Udshed.Insight.Academic.Queries =   {
   
    getQueriesYearDashbord(data,callback)
    {
        frappe.call({
            method: "udshed.api.statistic_course.statistic_year",
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

}