window.Udshed = window.Udshed || {};
window.Udshed.Insight = window.Udshed.Insight || {};
window.Udshed.Insight.Academic = window.Udshed.Insight.Academic || {};
window.Udshed.Insight.Academic.Queries =   {
   
    getQueriesDashbord(data,callback)
    {
        frappe.call({
            method: "udshed.api.statistic_course.statistic_year",
            args: data,
            callback: (e) => {
                console.log("User session data:", e.message);
                callback(e.message);
            },
            error: (err) => {
                console.error("Error fetching user session data:", err);
            }
        });

    },

}