frappe.require('/assets/udshed/css/planning_academique.css');
/** Show Dialog when open cell */
function openCreatePlanningDialog(day, halfDay) {
  const dialog = new frappe.ui.Dialog({
    title: "Nouvelle planification",
    fields: [
      {
        fieldtype: "Link",
        label: "Cours",
        fieldname: "subject",
        options: "Course",
        reqd: 1
      },
      {
        fieldtype: "Link",
        label: "Salle",
        fieldname: "room",
        options: "Room",
        reqd: 1
      },
      {
        fieldtype: "Select",
        label: "Type",
        fieldname: "course_type",
        options: ["CM", "TP", "CC", "EXAM"]
      }
    ],
    primary_action_label: "Créer",
    primary_action(values) {
      frappe.call({
        method: "udshed.api.create_planning",
        args: {
          ...values,
          day_of_week: day,
          half_day: halfDay,
          week_start: frappe.datetime.obj_to_str(currentWeekStart)
        },
        callback: () => {
          dialog.hide();
          loadPlanning(
            document.getElementById("week-select"),
            document.getElementById("month-picker")
          );
        }
      });
    }
  });

  dialog.show();
}


function openEditPlanningDialog(course) {
  const dialog = new frappe.ui.Dialog({
    title: "Modifier la planification",
    fields: [
      {
        fieldtype: "Link",
        label: "Cours",
        fieldname: "subject",
        options: "Course",
        default: course.subject
      },
      {
        fieldtype: "Link",
        label: "Salle",
        fieldname: "room",
        options: "Room",
        default: course.room
      },
      {
        fieldtype: "Select",
        label: "Type",
        fieldname: "course_type",
        options: ["CM", "TP", "CC", "EXAM"],
        default: course.course_type
      }
    ],
    primary_action_label: "Mettre à jour",
    primary_action(values) {
      frappe.call({
        method: "udshed.api.update_planning",
        args: {
          name: course.name, // ID DocType
          ...values
        },
        callback: () => {
          dialog.hide();
          loadPlanning(
            document.getElementById("week-select"),
            document.getElementById("month-picker")
          );
        }
      });
    }
  });

  dialog.show();
}

/**End Dialog */

/**Grid show */
function render_grid(items) {
    let grid = {
        "Monday": { "Morning": null, "Afternoon": null },
        "Tuesday": { "Morning": null, "Afternoon": null },
        "Wednesday": { "Morning": null, "Afternoon": null },
        "Thursday": { "Morning": null, "Afternoon": null },
        "Friday": { "Morning": null, "Afternoon": null },
        "Saturday": { "Morning": null, "Afternoon": null }
    };

    items.forEach(item => {
        grid[item.day_of_week][item.half_day] = item;
    });

    // ici tu construis le HTML de la table
}



function show_calendar(grid_wrapper, grid_data={
        "Monday": { "Morning": null, "Afternoon": null },
        "Tuesday": { "Morning": null, "Afternoon": null },
        "Wednesday": { "Morning": null, "Afternoon": null },
        "Thursday": { "Morning": null, "Afternoon": null },
        "Friday": { "Morning": null, "Afternoon": null },
        "Saturday": { "Morning": null, "Afternoon": null }
    })
{
	grid_wrapper.empty();

	let morningPlan = [];
	let afternoonPlan = [];

	// Construire les lignes du matin et de l'après-midi
	for (let day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]) {
		let morningItem = grid_data[day]["Morning"];
		let afternoonItem = grid_data[day]["Afternoon"];

		morningPlan.push(morningItem ? `
			<div class="planning-cell" data-day="${day}" data-half="${morningItem.half_day}" data-course='${JSON.stringify(morningItem)}'>
				<div class="planning-item">
					<div class="planning-item-title">${morningItem.subject}</div>
					<div class="planning-item-meta">${morningItem.level} – ${morningItem.room}</div>
				</div>
			</div>` : `<div class="planning-cell empty" data-day="${day}" data-half="Morning">
				 <div class="no-course">Pas cours</div>
			</div>`);

		afternoonPlan.push(afternoonItem ? `
			<div class="planning-cell" data-day="${day}" data-half="${afternoonItem.half_day}" data-course='${JSON.stringify(afternoonItem)}'>
				<div class="planning-item">
					<div class="planning-item-title">${afternoonItem.subject}</div>
					<div class="planning-item-meta">${afternoonItem.level} – ${afternoonItem.room}</div>
				</div>
			</div>` : `<div class="planning-cell empty" data-day="${day}" data-half="Afternoon">
			 <div class="no-course">Pas cours</div>
			</div>`);
	}

	return `
		<div class="planning-calendar" id="planning_calendar">

		<div class="planning-nav">
			<div class="planning-nav-left">
				<button class="btn btn-default btn-sm" id="prev-week">
				◀
				</button>

				<button class="btn btn-default btn-sm" id="today-week">
				Aujourd’hui
				</button>

				<button class="btn btn-default btn-sm" id="next-week">
				▶
				</button>
			</div>

			<div class="planning-nav-center">
				<span id="week-label"></span>
			</div>

			<div class="planning-nav-right">
				<select id="month-picker" class="form-control input-sm"></select>
  				<select id="week-select" class="form-control input-sm"></select>
			</div>
			</div>


			<div class="planning-grid">

				<div></div>
				<div class="planning-header">Lundi</div>
				<div class="planning-header">Mardi</div>
				<div class="planning-header">Mercredi</div>
				<div class="planning-header">Jeudi</div>
				<div class="planning-header">Vendredi</div>
				<div class="planning-header">Samedi</div>

				<div class="planning-time-label">
				<span>Matin</span>
				<div class="planning-time-range">08:00 - 12:00</div>
				</div>
				
				${morningPlan.join('')}

				<div class="planning-time-label">
					<span>Après-midi</span>
					<div class="planning-time-range">13:00 - 17:00</div>
				</div>				
				${afternoonPlan.join('')}
			</div>
		</div>`
	
} 

function loadPlanning(weekSelect,monthPicker) {
  updateWeekLabel();
  syncSelectors(weekSelect,monthPicker);

  console.log("Planning chargé :", currentWeekStart);

  // 🔁 ICI tu recharges ta grille
  // ex:
  // fetchPlanningItems(currentWeekStart)
  console.log("Chargement semaine :", currentWeekStart);
}

/** End show grid */

/**Grid days */
function createLocalDate(year, month, day) {
  return new Date(year, month, day, 12, 0, 0);
}


function getMonday(date) {
	console.log("Date for getMonday:", date);
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
//   return new Date(d.setDate(diff));
	return createLocalDate(d.getFullYear(), d.getMonth(), diff);
}
var currentWeekStart = getMonday(new Date());

function updateWeekLabel() {
  const start = new Date(currentWeekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const options = { day: '2-digit', month: 'long', year: 'numeric' };

  document.getElementById("week-label").innerText =
    `Semaine du ${start.toLocaleDateString('fr-FR', options)} au ${end.toLocaleDateString('fr-FR', options)}`;
}

function initMonthPicker(monthPicker) {
  const now = new Date();
  const year = now.getFullYear();

  for (let m = 0; m < 12; m++) {
    const date = new Date(year, m, 1);
    const option = document.createElement("option");

    option.value = `${year}-${m}`;
    option.text = date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });

    if (m === now.getMonth()) option.selected = true;
    monthPicker.appendChild(option);
  }
}

function getWeeksOfMonth(year, month) {
  const weeks = [];
  const firstDay = createLocalDate(year, month, 1);
  const lastDay = createLocalDate(year, month + 1, 0);

  let current = getMonday(firstDay);

  while (current <= lastDay) {
    weeks.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

function updateWeekSelect(year, month,weekSelect) {
  weekSelect.innerHTML = "";

  const weeks = getWeeksOfMonth(year, month);

  weeks.forEach((weekStart, index) => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);

    const option = document.createElement("option");
    option.value = weekStart.getTime();

    option.text = `Semaine ${index + 1} : ${
      weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    } - ${
      end.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    }`;

    weekSelect.appendChild(option);
  });
}

function getFirstWeekInsideMonth(weeks, year, month) {
  return weeks.find(weekStart => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return (
      weekStart.getMonth() === month ||
      weekEnd.getMonth() === month
    );
  });
}




function syncSelectors(weekSelect,monthPicker) {

	const year = currentWeekStart.getFullYear();
	const month = monthPicker.value.split("-")[1];

	updateWeekSelect(year, Number(month),weekSelect);
	weekSelect.value = currentWeekStart.getTime();
}


/**Grid end days */





frappe.pages['planning-academique'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Planning',
		single_column: true
	});

	page.set_primary_action('Actualiser', () => {
		 let filters = {
			filiere: page.fields_dict.filiere.get_value(),
			niveau: page.fields_dict.niveau.get_value(),
			academic_year: page.fields_dict.academic_year.get_value()
		};

		show_calendar(filters);
    });

	// page.add_field({
	// 	fieldtype: 'Link',
	// 	label: 'Année académique',
	// 	fieldname: 'academic_year',
	// 	options: 'Academic Year'
	// });

	page.add_field({
		fieldtype: 'Link',
		label: 'Faculté',
		fieldname: 'faculty',
		options: 'Faculty'
	});

	page.add_field({
		fieldtype: 'Link',
		label: 'Filière',
		fieldname: 'filiere',
		options: 'Field of study'
	});

	page.add_field({
		fieldtype: 'Link',
		label: 'Niveau',
		fieldname: 'niveau',
		options: 'Field of study Level'
	});



	let grid_wrapper = $('<div id="planning-grid-wrapper"></div>');
	$(wrapper).append(grid_wrapper);

	// afficher la grille vide au chargement
	grid_wrapper.html(show_calendar(grid_wrapper));

	const monthPicker = document.getElementById("month-picker");
	const weekSelect = document.getElementById("week-select");

	console.log("Week select element:", weekSelect,monthPicker);

	document.getElementById("prev-week").onclick = () => {
		currentWeekStart.setDate(currentWeekStart.getDate() - 7);
		loadPlanning(weekSelect,monthPicker);
	};

	document.getElementById("next-week").onclick = () => {
		currentWeekStart.setDate(currentWeekStart.getDate() + 7);
		loadPlanning(weekSelect,monthPicker);
	};

	document.getElementById("today-week").onclick = () => {
		currentWeekStart = getMonday(new Date());
		loadPlanning(weekSelect,monthPicker);
	};

	
	monthPicker.addEventListener("change", function () {
		const [year, month] = this.value.split("-").map(Number);
		updateWeekSelect(year, month,weekSelect);

		// 🔑 On force la 1ère semaine visible du mois
		const weeks = getWeeksOfMonth(year, month);
		currentWeekStart = getFirstWeekInsideMonth(weeks, year, month);

		loadPlanning(weekSelect,monthPicker);
	});

	weekSelect.addEventListener("change", (e) => {

		currentWeekStart = new Date(Number(e.currentTarget.value));
		loadPlanning(weekSelect,monthPicker);
	});


	initMonthPicker(monthPicker);
	updateWeekSelect(new Date().getFullYear(), new Date().getMonth(),weekSelect);
	loadPlanning(weekSelect,monthPicker);

	// Evenement sur les celuules de planning

	$(document).on("click", ".planning-cell", function () {
		const day = $(this).data("day");
		const half = $(this).data("half");
		const courseData = $(this).data("course");

		if (courseData) {
			openEditPlanningDialog(courseData);
		} else {
			openCreatePlanningDialog(day, half);
		}
	});

	
}