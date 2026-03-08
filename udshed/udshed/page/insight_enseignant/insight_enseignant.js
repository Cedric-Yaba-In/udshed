frappe.pages['insight-enseignant'].on_page_load = function(wrapper) {
    frappe.require([
		'/assets/udshed/css/insight.css',
		'/assets/udshed/js/utils/utils.js', 
		'/assets/udshed/js/utils/utils_queries.js',
		'/assets/udshed/js/insight/academic/year_insight.js',
		'/assets/udshed/js/insight/academic/faculte_insight.js',
		'/assets/udshed/js/insight/academic/fieldofstudy_insight.js',
		'/assets/udshed/js/insight/academic/fieldofstudylevel_insight.js',
		'/assets/udshed/js/insight/academic/queries.js',
		'/assets/udshed/js/insight/ui/ui.js',
	]).then(async () => {

        var page = frappe.ui.make_app_page({
            parent: wrapper,
            title: __('Suivi des Cours'),
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

        let levelMap = {}; // label => name

        page.set_primary_action("Exporter Excel", () => {
			
		},'octicon octicon-plus');

        $(`
			<div id="teacher-insight-page">
                <div id="loading" class="text-center py-5" style="display: none;">
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">${ __("Chargement...") }</span>
                    </div>
                </div>

                <!-- Dashboard Content -->
                <div id="dashboard-content">
                    <!-- Cette section sera dynamiquement remplie par JavaScript -->
                </div>
            </div>
		`).appendTo(wrapper);

        // Charger le contenu
        const content = $(wrapper).find('#dashboard-content');
        
        page.add_field({
			fieldtype: 'Link',
			label: 'Année académique',
			fieldname: 'academic_year',
			options: 'Academic Year',
			change(e) {
				filters.academic_year = this.get_value();
				Udshed.Utils.refresh_filter(filters,"academic_year",page,levelMap);
                if(!this.get_value()) return;
				show_dashboard(page,filters,{container:content})
                console.log("From academic")

			}
		});

		const faculty_field = page.add_field({
			fieldtype: 'Link',
			label: 'Faculté',
			fieldname: 'faculty',
			options: 'Faculty',
			change(e) {
				filters.faculty = this.get_value();
				Udshed.Utils.refresh_filter(filters,"faculty",page,levelMap);
                if(!this.get_value()) return;
				show_dashboard(page,filters,{container:content})
                console.log("From faculty")

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
				if(!this.get_value()) return
				show_dashboard(page,filters,content)
                console.log("From filiere")

				// Udshed.UI.update_page_actions(filters, btnEporterPDF,btnEnvoiMail)
				
			}
		});        

        const niveau_field = page.add_field({
			fieldtype: 'Select',
			label: 'Niveau',
			fieldname: 'niveau',
			change() {
				filters.niveau = levelMap[this.get_value()];
				if(!this.get_value()) return
                console.log("From niveau")
				// periods = this.get_value()==null ? [...defaultPeriods]: await Udshed.Queries.loadCoursePeriod(filters.niveau)
				show_dashboard(page,filters,content)
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
			change() {
				filters.semestre = this.get_value();
				if(!this.get_value()) return
                console.log("From semestre")

				// periods = this.get_value()==null ? [...defaultPeriods]: await Udshed.Queries.loadCoursePeriod(filters.niveau)
				show_dashboard(page,filters,content)
			}
		});
        const teacher_field = page.add_field({
			fieldtype: 'Link',
			label: 'Teacher',
			fieldname: 'teacher',
			options: 'Teacher',
			change() {
				filters.teacher = this.get_value();
				Udshed.Utils.refresh_filter(filters,"teacher",page,levelMap);
				show_dashboard(page,filters,content)
                console.log("Fron teacher")

			}
		});

               
        // Afficher un indicateur de données d'essai
        $(document).on("change", ".apply-filter-change", function () {
            applyFilters();
        })

        $(document).on("click", ".apply-custom-date", function () {
            applyCustomDate();
        })

        $(document).on("click", ".export-data", function () {
            exportData();
        })

        $(document).on("click", ".refresh-data", function () {
            refreshData();
        })

        $(document).on("click", ".data-navigate-to", function () {
            const navigateTo = $(this).data("navigate-to");
            navigateTo(navigateTo);

        })

        $(document).on("click", ".on-view-cours-details", function () {
            const progTo = $(this).data("view-cours-details");
            viewCourseDetail(prog);

        })
        
    })
}

function initUI(page_section)
{
	page_section.empty()
}

function show_dashboard(page,filters,page_section)
{
    //{container,evolutionChart}
	initUI(page_section.container)
	if(filters.academic_year && !filters.faculty && !filters.filiere && !filters.niveau)
	{

        window.Udshed.Insight.Academic.Queries.getQueriesYearDashbord(filters,(data)=>{
            //show for year
		    Udshed.Insight.Academic.Year.showAcademicYearInsights(page,filters,page_section,data)
        })
		
	}
	else if(filters.academic_year && filters.faculty && !filters.filiere && !filters.niveau)
	{
		console.log("Find from faculty")
		 window.Udshed.Insight.Academic.Queries.getQueriesFacultyDashbord(filters,(data)=>{
            //show for faculty
			Udshed.Insight.Academic.Faculty.showAcademicFacultyInsights(page,filters,page_section,data)
        })		
	}
	else if(filters.academic_year && filters.faculty && filters.filiere && !filters.niveau)
	{
		//show for filiere
		Udshed.Insight.Academic.FieldOfStudy.showAcademicFieldOfStudyInsights(page,filters,page_section)

	}
	else if(filters.academic_year && filters.faculty && filters.filiere && filters.niveau)
	{
		//show niveau
		Udshed.Insight.Academic.FieldOfStudyLevel.showAcademicFieldOfStudyLevelInsights(page,filters,page_section)
	}
	
}

function updatePageTitle() {
    let title = '';
    let subtitle = '';
    
    switch(currentView.level) {
        case 'global':
            title = 'Tableau de bord de suivi des cours';
            subtitle = 'Vue globale - Toutes les facultés';
            break;
        case 'faculty':
            title = `Faculté ${currentView.faculty}`;
            subtitle = `Vue d'ensemble de la faculté`;
            break;
        case 'program':
            title = `Filière ${currentView.program}`;
            subtitle = `Détail par niveau et par cours`;
            break;
        case 'level':
            title = `Niveau ${currentView.levelName} - ${currentView.program}`;
            subtitle = `Planning et progression détaillée`;
            break;
        case 'course':
            title = `Cours ${currentView.course}`;
            subtitle = `Historique complet et statistiques`;
            break;
    }
 ;
}




function initCourseCharts(data) {
    // Graphique d'assiduité
    new frappe.Chart("#attendance-chart", {
        data: {
            labels: data.attendance_evolution.map(a => {
                const date = new Date(a.date);
                return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            }),
            datasets: [
                {
                    name: "Taux de présence",
                    values: data.attendance_evolution.map(a => a.rate),
                    chartType: 'line'
                }
            ]
        },
        type: 'line',
        height: 250,
        colors: ['#17a2b8']
    });
    
    // Graphique des statuts
    new frappe.Chart("#course-status-chart", {
        data: {
            labels: data.by_status.map(s => s.status),
            datasets: [
                {
                    name: "Sessions",
                    values: data.by_status.map(s => s.count),
                    chartType: 'pie'
                }
            ]
        },
        type: 'pie',
        height: 250,
        colors: ['#28a745', '#ffc107', '#dc3545', '#fd7e14']
    });
}
