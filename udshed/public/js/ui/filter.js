window.Udshed = window.Udshed || {};


window.Udshed.UI = window.Udshed.UI || {}

window.Udshed.UI_Filter = {
    initFilter() {
        return {
			academic_year: null,
			faculty: null,
			filiere: null,
			niveau: null,
			teacher: null
		};
    },

    initFilterUi(page)
    {
        const academic_field = page.add_field({
			fieldtype: 'Link',
			label: 'Année académique',
			fieldname: 'academic_year',
			options: 'Academic Year',
			change() {
				// filters.academic_year = this.get_value();
				// Udshed.Utils.refresh_filter(filters,"academic_year",page,levelMap);
				// Udshed.UI.update_page_actions(filters, btnEporterPDF,btnEnvoiMail)
				// periods = [...defaultPeriods]
                console.log("Change 1")
				// show_calendar(filters);

			}
		});

        const faculty_field = page.add_field({
			fieldtype: 'Link',
			label: 'Faculté',
			fieldname: 'faculty',
			options: 'Faculty',
			change() {
				// filters.faculty = this.get_value();
				// Udshed.Utils.refresh_filter(filters,"faculty",page,levelMap);
				// periods = [...defaultPeriods]
				// Udshed.UI.update_page_actions(filters, btnEporterPDF,btnEnvoiMail)
			}
		});

        const filiere_field = page.add_field({
			fieldtype: 'Link',
			label: 'Filière',
			fieldname: 'filiere',
			options: 'Field of study',
			get_query() {
				if (!faculty_field.get_value()) {
					return {};
				}

				return {
					filters: {
						faculte: faculty_field.get_value()
					}
				};
			}, 
			change() {
				// filters.filiere = this.get_value();
				// Udshed.Utils.refresh_filter(filters,"filiere",page,levelMap);

				// Udshed.Queries.loadLevels(this.get_value(),niveau_field,(levels)=>{
				// 	levelMap = levels ? levels.reduce((acc, curr) => {
				// 		acc[curr.level] = curr.name;
				// 		return acc;
				// 	}, {}) : {};
				// 	niveau_field.df.options = levels ? levels.map((value)=>({value:value.level,name:value.name})) || [] : [];
				// 	niveau_field.refresh();
				// });
				// periods = [...defaultPeriods]
				// Udshed.UI.update_page_actions(filters, btnEporterPDF,btnEnvoiMail)
				
			}
		});

        const niveau_field = page.add_field({
			fieldtype: 'Select',
			label: 'Niveau',
			fieldname: 'niveau',
			async change() {
				// filters.niveau = levelMap[this.get_value()];
				// periods = this.get_value()==null ? [...defaultPeriods]: await Udshed.Queries.loadCoursePeriod(filters.niveau)
				// loadPlanning(weekSelect,monthPicker,filters,calendar_zone,periods);
				// Udshed.UI.update_page_actions(filters, btnEporterPDF,btnEnvoiMail)
			}
		});
		const teacher_field = page.add_field({
			fieldtype: 'Link',
			label: 'Teacher',
			fieldname: 'teacher',
			options: 'Teacher',
			change() {
				// filters.teacher = this.get_value()
				// loadPlanning(weekSelect,monthPicker,filters,calendar_zone,periods);
				// Udshed.UI.update_page_actions(filters, btnEporterPDF,btnEnvoiMail)
			}
		});
        return { academic_field, faculty_field, filiere_field, niveau_field}
    }
}
