
frappe.pages['planning-academique'].on_page_load = function(wrapper) {
	
	frappe.require([
		'/assets/udshed/css/planning_academique.css',
		'/assets/udshed/js/planning_calendar/dialog_box.js',
		'/assets/udshed/js/planning_calendar/date_utils.js',
		'/assets/udshed/js/planning_calendar/utils.js',
		'/assets/udshed/js/planning_calendar/queries.js',
		'/assets/udshed/js/planning_calendar/ui.js',
		'/assets/udshed/js/planning_calendar/permission.js'
	]).then(() => {

		var currentWeekStart = Udshed.DateUtils.getMonday(new Date());

		
		function loadPlanning(weekSelect,monthPicker,filters,calendar_zone) {
			Udshed.DateUtils.updateWeekLabel(currentWeekStart);
			Udshed.DateUtils.syncSelectors(weekSelect,monthPicker,currentWeekStart);
			Udshed.Queries.fetchPlanningItems(filters,currentWeekStart,(items)=>{
				Udshed.UI.show_calendar(calendar_zone, Udshed.UI.get_grid_calendar_item(items,filters));
			});
		}


	
		let page = frappe.ui.make_app_page({
			parent: wrapper,
			title: 'Planning',
			single_column: true
		});

		let filters = {
			academic_year: null,
			faculty: null,
			filiere: null,
			niveau: null
		};

		let levelMap = {}; // label => name




		let grid_wrapper = $('<div id="planning-grid-wrapper"></div>');
		$(wrapper).append(grid_wrapper);

		// afficher la grille vide au chargement
		grid_wrapper.html(Udshed.UI.show_calendar_hearder());
		calendar_zone = grid_wrapper.find("#planning_calendar .planning-grid");
		Udshed.UI.show_calendar(calendar_zone);

		const monthPicker = document.getElementById("month-picker");
		const weekSelect = document.getElementById("week-select");

		
		page.set_primary_action('Actualiser', () => {
			let filters = {
				filiere: page.fields_dict.filiere.get_value(),
				niveau: page.fields_dict.niveau.get_value(),
				academic_year: page.fields_dict.academic_year.get_value()
			};
			// show_calendar(filters);
			loadPlanning(grid_wrapper,weekSelect,monthPicker,filters,calendar_zone)
		});

		page.add_menu_item("Exporter en PDF", () => {
			let filters = {
				faculty: page.fields_dict.faculty.get_value(),
				filiere: page.fields_dict.filiere.get_value(),
				niveau: page.fields_dict.niveau.get_value(),
				week_start: currentWeekStart.toISOString().split('T')[0],
				academic_year: page.fields_dict.academic_year.get_value()
			};

			let url = `/api/method/udshed.www.planning_pdf.generate_planning_pdf?filters=${encodeURIComponent(JSON.stringify(filters))}`;
			window.open(url);
		});

		// get_data_of_user();

		page.add_field({
			fieldtype: 'Link',
			label: 'Année académique',
			fieldname: 'academic_year',
			options: 'Academic Year',
			change() {
				filters.academic_year = this.get_value();
				Udshed.Utils.refresh_filter(filters,"academic_year",page,levelMap);
				// show_calendar(filters);

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

				Udshed.Queries.loadLevels(this.get_value(),niveau_field,(levels)=>{
					levelMap = levels ? levels.reduce((acc, curr) => {
						acc[curr.level] = curr.name;
						return acc;
					}, {}) : {};
					niveau_field.df.options = levels ? levels.map((value)=>({value:value.level,name:value.name})) || [] : [];
					niveau_field.refresh();
				});
			}
		});

		const niveau_field = page.add_field({
			fieldtype: 'Select',
			label: 'Niveau',
			fieldname: 'niveau',
			change() {
				filters.niveau = levelMap[this.get_value()];
				loadPlanning(weekSelect,monthPicker,filters,calendar_zone);
			}
		});

		document.getElementById("prev-week").onclick = () => {
			currentWeekStart.setDate(currentWeekStart.getDate() - 7);
			loadPlanning(weekSelect,monthPicker,filters,calendar_zone);
		};

		document.getElementById("next-week").onclick = () => {
			currentWeekStart.setDate(currentWeekStart.getDate() + 7);
			loadPlanning(weekSelect,monthPicker,filters,calendar_zone);
		};

		document.getElementById("today-week").onclick = () => {
			currentWeekStart = Udshed.DateUtils.getMonday(new Date());
			loadPlanning(weekSelect,monthPicker,filters,calendar_zone);
		};

	
		monthPicker.addEventListener("change", function () {
			const [year, month] = this.value.split("-").map(Number);
			Udshed.DateUtils.updateWeekSelect(year, month,weekSelect);

			// 🔑 On force la 1ère semaine visible du mois
			const weeks = Udshed.DateUtils.getWeeksOfMonth(year, month);
			currentWeekStart = Udshed.DateUtils.getFirstWeekInsideMonth(weeks, year, month);
			loadPlanning(weekSelect,monthPicker,filters,calendar_zone);
		});

		weekSelect.addEventListener("change", (e) => {
			currentWeekStart = new Date(Number(e.currentTarget.value));
			loadPlanning(weekSelect,monthPicker,filters,calendar_zone);
		});


		Udshed.DateUtils.initMonthPicker(monthPicker);
		Udshed.DateUtils.updateWeekSelect(new Date().getFullYear(), new Date().getMonth(),weekSelect);
		
		loadPlanning(weekSelect,monthPicker,filters,calendar_zone);
		Udshed.Utils.refresh_filter(filters,null,page,levelMap);

		let userContext = null;
		Udshed.Queries.get_data_of_user((data) => {
			userContext = Udshed.Perms.normalizeUserContext(data);
			
			if(Udshed.Perms.should_apply_filter(userContext))
			{
				//Apply filters
				//academic_year
				page.fields_dict.academic_year.get_query = () => ({
					filters: {
						name: ["in", userContext.academic_year]
					}
				});
				
				
				//faculty
				page.fields_dict.faculty.get_query = () => ({
					filters: {
						name: ["in", userContext.faculty]
					}
				});

				//filiere
				page.fields_dict.filiere.get_query = () => {
					let f = faculty_field.get_value();
					return {
						filters: {
							name: ["in", userContext.filiere],
							...(f ? { faculte: f } : {})
						}
					};
				};


				const allowedNiveau = new Set(userContext.niveau);

				niveau_field.df.options = niveau_field.df.options.filter(o =>
					allowedNiveau.has(levelMap[o.value])
				);
				niveau_field.refresh();
			}
			
			//Apply default value
			if(userContext.default_academic_year) {
				page.fields_dict.academic_year.set_value(userContext.default_academic_year);
				filters.academic_year = userContext.default_academic_year;
			}

			if(userContext.faculty.length > 0) {
				page.fields_dict.faculty.set_value(userContext.faculty[0])
				filters.faculty = userContext.faculty[0];
			}
			// if (userContext.locks.faculty ) page.fields_dict.faculty.$input.prop("disabled", true);


			
			if(userContext.filiere.length > 0) {
				filters.filiere = userContext.filiere[0]
				page.fields_dict.filiere.set_value(userContext.filiere[0])
			}
			// if (userContext.locks.fileire ) page.fields_dict.filiere.$input.prop("disabled", true);
			
		});

		// Evenement sur les celuules de planning
		

		$(document).on("click", ".planning-cell", function () {
			currentDay = new Date(parseInt(weekSelect.value)); // Récupérer la date de la semaine sélectionnée
			let day ={ "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4,"Saturday": 5}
			currentDay.setDate(currentDay.getDate() + day[($(this).data("day"))]);
			const half = $(this).data("half");
			const courseData = $(this).data("course");

			console.log("User Context ",userContext)
			if (courseData) {
				Udshed.Dialogs.openEditPlanningDialog(filters,courseData,userContext,() => {
					loadPlanning(weekSelect,monthPicker,filters,calendar_zone)
				});
			} else {
				Udshed.Dialogs.openCreatePlanningDialog(filters,currentDay,half,userContext, () => {
					loadPlanning(weekSelect,monthPicker,filters,calendar_zone)
				});
			}
		});	
	})

};








