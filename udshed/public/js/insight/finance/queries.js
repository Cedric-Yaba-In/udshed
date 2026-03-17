window.Udshed = window.Udshed || {};
window.Udshed.Insight = window.Udshed.Insight || {};
window.Udshed.Insight.Finance = window.Udshed.Insight.Finance || {};
window.Udshed.Insight.Finance.Queries =   {
   
    getQueriesYearDashbord(data,callback)
    {
        frappe.call({
            method: "udshed.api.statistic_course_finance.statistic_year",
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
            method: "udshed.api.statistic_course_finance.statistic_cours_faculte",
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
            method: "udshed.api.statistic_course_finance.statistic_fieldofstudy",
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