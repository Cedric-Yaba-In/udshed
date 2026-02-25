frappe.pages['insight-academique'].on_page_load = function(wrapper) {

	frappe.require([
		'/assets/udshed/css/insight.css',
		'/assets/udshed/js/utils/utils.js', 
		'/assets/udshed/js/utils/utils_queries.js',
		'/assets/udshed/js/insight/academique/year_insight.js',
		'/assets/udshed/js/insight/academique/faculte_insight.js',
		'/assets/udshed/js/insight/academique/fieldofstudy_insight.js',
		'/assets/udshed/js/insight/academique/fieldofstudylevel_insight.js',
		'/assets/udshed/js/insight/ui/ui.js',
	]).then(async () => {
		var page = frappe.ui.make_app_page({
			parent: wrapper,
			title: 'Insight Académique',
			single_column: true
		});

		let filters = {
			academic_year: null,
			faculty: null,
			filiere: null,
			niveau: null,
			semestre:null,
			teacher: null
		};

		// =====================================================
    	// 🔎 FILTRES
    	// =====================================================

		// Container principal
		const container = $(`
			<div class="insight-wrapper">
				<div class="insight-header"></div>

				<div class="insight-kpi-row"></div>

				<div class="insight-chart-section card"></div>

				<div class="insight-table-section card"></div>
			</div>
		`).appendTo(page.body);

		const header = container.find(".insight-header");
		const kpiRow = container.find(".insight-kpi-row");
		const chartSection = container.find(".insight-chart-section");
		const tableSection = container.find(".insight-table-section");

		let levelMap = {}; // label => name
		page.set_primary_action("Exporter Excel", () => {
			if (!datatable || !datatable.data) {
				frappe.msgprint("Aucune donnée à exporter !");
				return;
			}

			const wb = XLSX.utils.book_new();
			const ws_data = [
				["Nom", "Niveau", "Statut"], // entêtes
				...datatable.data.map(row => row)
			];

			const ws = XLSX.utils.aoa_to_sheet(ws_data);
			XLSX.utils.book_append_sheet(wb, ws, "Détails Cours");

			XLSX.writeFile(wb, "Dashboard_Insights.xlsx");
		});
		// Filtre
		page.add_field({
			fieldtype: 'Link',
			label: 'Année académique',
			fieldname: 'academic_year',
			options: 'Academic Year',
			change() {
				filters.academic_year = this.get_value();
				Udshed.Utils.refresh_filter(filters,"academic_year",page,levelMap);
				// show_calendar(filters);
				showDashboard(page,filters,{tableSection,chartSection,kpiRow,header})
			}
		});

		const faculty_field = page.add_field({
			fieldtype: 'Link',
			label: 'Faculté',
			fieldname: 'faculty',
			options: 'Faculty',
			change() {
				filters.faculty = this.get_value();
				Udshed.Utils.refresh_filter(filters,"faculty",page,levelMap);
				showDashboard(page,filters,{tableSection,chartSection,kpiRow,header})

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
				filters.filiere = this.get_value();
				Udshed.Utils.refresh_filter(filters,"filiere",page,levelMap);

				Udshed.UtilsQueries.loadLevels(this.get_value(),niveau_field,(levels)=>{
					levelMap = levels ? levels.reduce((acc, curr) => {
						acc[curr.level] = curr.name;
						return acc;
					}, {}) : {};
					niveau_field.df.options = levels ? levels.map((value)=>({value:value.level,name:value.name})) || [] : [];
					niveau_field.refresh();
				});
				// periods = [...defaultPeriods]
				showDashboard(page,filters,{tableSection,chartSection,kpiRow,header})

				// Udshed.UI.update_page_actions(filters, btnEporterPDF,btnEnvoiMail)
				
			}
		});

		const niveau_field = page.add_field({
			fieldtype: 'Select',
			label: 'Niveau',
			fieldname: 'niveau',
			async change() {
				filters.niveau = levelMap[this.get_value()];
				// periods = this.get_value()==null ? [...defaultPeriods]: await Udshed.Queries.loadCoursePeriod(filters.niveau)
				showDashboard(page,filters,{tableSection,chartSection,kpiRow,header})
			}
		});
		const semestre_field = page.add_field({
			fieldtype: 'Select',
			label: 'Semestre',
			fieldname: 'semestre',
			options: [
				{value:'semestre1', label:'Semestre 1'},
				{value:'semestre2', label:'Semestre 2'},
			],
			async change() {
				filters.semestre = this.get_value();
				// periods = this.get_value()==null ? [...defaultPeriods]: await Udshed.Queries.loadCoursePeriod(filters.niveau)
				showDashboard(page,filters,{tableSection,chartSection,kpiRow,header})
			}
		});
	
		// let content_data = $('<div id="insight-academique-wrapper"></div>');
		// $(wrapper).append(content_data);
		// content_data.html(render());
		
	
	})
}

function initUI(page_section)
{
	// page.body.find(".insight-header").empty()
	// page.body.find(".insight-kpi-row").empty()
	// page.body.find(".insight-chart-section").empty()
	// page.body.find(".insight-table-section").empty()
	console.log("PAge Section ",page_section.tableSection)
	page_section.tableSection.empty()
	page_section.chartSection.empty()
	page_section.header.empty()
	page_section.kpiRow.empty()
}

function showDashboard(page,filters,page_section)
{
	initUI(page_section)
	if(filters.academic_year && !filters.faculty && !filters.filiere && !filters.niveau)
	{
		//show for year
		Udshed.Insight.Academic.Year.showAcadmicYearInsights(page,filters,page_section)
	}
	else if(filters.academic_year && filters.faculty && !filters.filiere && !filters.niveau)
	{
		//show for faculty
		Udshed.Insight.Academic.Faculty.showAcadmicFacultyInsights(page,filters,page_section)
		
	}
	else if(filters.academic_year && filters.faculty && filters.filiere && !filters.niveau)
	{
		//show for filiere
		Udshed.Insight.Academic.FieldOfStudy.showAcadmicFieldOfStudyInsights(page,filters,page_section)

	}
	else if(filters.academic_year && filters.faculty && filters.filiere && filters.niveau)
	{
		//show niveau
		Udshed.Insight.Academic.FieldOfStudyLevel.showAcadmicFieldOfStudyLevelInsights(page,filters,page_section)
	}
	
}