// Copyright (c) 2026, Cédric Nguendap Bedjama and contributors
// For license information, please see license.txt

function getDateFromTime(time)
{
    let new_date = new Date()
    let infos_date = time.split(":")
    new_date.setHours(parseInt(infos_date[0]))
    new_date.setMinutes(parseInt(infos_date[1]))
    return new_date;
}

frappe.ui.form.on("Udshed Setting", {
	before_save(frm) {
        if(getDateFromTime(frm.doc.start_hours_morning) >= getDateFromTime(frm.doc.end_hours_morning))
        {
            frappe.show_alert({ message:__('L\'heure de fin de cours en matinée doit être suppérieur a celle du debut de cours en matinée.'), indicator:'red' });
            frappe.throw(null);
        }

        if(getDateFromTime(frm.doc.start_hours_evening) >= getDateFromTime(frm.doc.end_hours_evening))
        {
            frappe.show_alert({ message:__('L\'heure de fin de cours en soirée doit être suppérieur a celle du debut de cours en soirée.'), indicator:'red' });
            frappe.throw(null);
        }
	},
});
