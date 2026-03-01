frappe.pages['insight-enseignant'].on_page_load = function(wrapper) {

	frappe.require([
		'/assets/udshed/css/insight.css',
		'/assets/udshed/js/utils/utils.js', 
		'/assets/udshed/js/utils/utils_queries.js',
		'/assets/udshed/js/insight/ui/ui.js',
	]).then(async () => {
		var page = frappe.ui.make_app_page({
			parent: wrapper,
			title: 'Insight Enseignant',
			single_column: true
		});

		let filters = {
			academic_year: null,
			teacher: null
		};

		// page.set_primary_action("Exporter Excel", () => {
		// 	if (!datatable || !datatable.data) {
		// 		frappe.msgprint("Aucune donnée à exporter !");
		// 		return;
		// 	}

		// 	const wb = XLSX.utils.book_new();
		// 	const ws_data = [
		// 		["Nom", "Niveau", "Statut"], // entêtes
		// 		...datatable.data.map(row => row)
		// 	];

		// 	const ws = XLSX.utils.aoa_to_sheet(ws_data);
		// 	XLSX.utils.book_append_sheet(wb, ws, "Détails Cours");

		// 	XLSX.writeFile(wb, "Dashboard_Insights.xlsx");
		// });

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

		const teacher_field = page.add_field({
			fieldtype: 'Link',
			label: 'Teacher',
			fieldname: 'teacher',
			options: 'Teacher',
			change() {
				filters.teacher = this.get_value()
				loadPlanning(weekSelect,monthPicker,filters,calendar_zone,periods);
				Udshed.UI.update_page_actions(filters, btnEporterPDF,btnEnvoiMail)
			}
		});

		// Charger le contenu
    $(wrapper).find('.page-content').html(render_ui());
    
    // Initialiser avec les données d'essai
    initPage();
    
    // Afficher un indicateur que ce sont des données d'essai
    showMockDataIndicator();

	$(document).on("click", ".teacher_detail_btn", function () {
		const teacherId = $(this).data("teacher-id");
		viewTeacherDetails(teacherId)
		// Ici, vous pouvez charger les détails de l'enseignant
		console.log("Détails enseignant:", teacherId);
	})

	$(document).on("change", ".on-change-filter", function () {
		applyFilters();
	})

	
	
	})
}



// Variables globales
let currentData = null;
let evolutionChart = null;
let typeChart = null;
let levelChart = null;

function initPage() {
    loadFilterOptions();
    setupPeriodListener();
    applyFilters(); // Charge les données d'essai
}


function render_ui()
{
	return `
	<div id="teacher-insight-page">
    <!-- En-tête -->
    <div class="page-header mb-4">
        <div class="row align-items-center">
            <div class="col">
                <h2 class="page-title">${ __("Insight Enseignant") }</h2>
                <p class="text-muted">${ __("Tableau de bord des activités pédagogiques") }</p>
            </div>
            <div class="col-auto">
                <button class="btn btn-outline-primary btn-sm" onclick="exportData()">
                    <i class="fa fa-download"></i> ${ __("Exporter") }
                </button>
                <button class="btn btn-primary btn-sm" onclick="refreshData()">
                    <i class="fa fa-refresh"></i> ${ __("Rafraîchir") }
                </button>
            </div>
        </div>
    </div>

    <!-- Barre de filtres élégante -->
    <div class="filters-bar frappe-card p-3 mb-4">
        <div class="row g-3 align-items-end">
            <div class="col-md-2">
                <label class="form-label text-muted small">${ __("Période") }</label>
                <select id="period-filter" class="form-control form-control-sm on-change-filter" onchange="applyFilters()">
                    <option value="semaine">${ __("Cette semaine") }</option>
                    <option value="mois" selected>${ __("Ce mois") }</option>
                    <option value="trimestre">${ __("Ce trimestre") }</option>
                    <option value="annee">${ __("Cette année") }</option>
                    <option value="personnalise">${ __("Personnalisé") }</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label text-muted small">${ __("Faculté") }</label>
                <select id="faculty-filter" class="form-control form-control-sm on-change-filter" onchange="applyFilters()">
                    <option value="">${ __("Toutes") }</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label text-muted small">${ __("Filière") }</label>
                <select id="program-filter" class="form-control form-control-sm on-change-filter" onchange="applyFilters()">
                    <option value="">${ __("Toutes") }</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label text-muted small">${ __("Niveau") }</label>
                <select id="level-filter" class="form-control form-control-sm on-change-filter" onchange="applyFilters()">
                    <option value="">${ __("Tous") }</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label text-muted small">${ __("Enseignant") }</label>
                <select id="teacher-filter" class="form-control form-control-sm on-change-filter" onchange="applyFilters()">
                    <option value="">${ __("Tous") }</option>
                </select>
            </div>
            <div class="col-md-1">
                <button class="btn btn-sm btn-outline-secondary w-100" onclick="clearFilters()">
                    <i class="fa fa-times"></i>
                </button>
            </div>
        </div>
        
        <!-- Filtres personnalisés (cachés par défaut) -->
        <div id="custom-date-range" class="row mt-3" style="display: none;">
            <div class="col-md-3">
                <input type="date" id="start-date" class="form-control form-control-sm" placeholder="Date début">
            </div>
            <div class="col-md-3">
                <input type="date" id="end-date" class="form-control form-control-sm" placeholder="Date fin">
            </div>
            <div class="col-md-2">
                <button class="btn btn-sm btn-primary" onclick="applyCustomDate()">${ __("Appliquer") }</button>
            </div>
        </div>
    </div>

    <!-- Loading -->
    <div id="loading" class="text-center py-5" style="display: none;">
        <div class="spinner-border text-primary" role="status">
            <span class="sr-only">${ __("Chargement...") }</span>
        </div>
    </div>

    <!-- Dashboard Content -->
    <div id="dashboard-content">
        <!-- KPIs Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card frappe-card p-3">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-primary-light me-3">
                            <i class="fa fa-book text-primary"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">${ __("Total Cours") }</div>
                            <div class="stat-value h3 mb-0" id="total-courses">0</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card frappe-card p-3">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-success-light me-3">
                            <i class="fa fa-users text-success"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">${ __("Enseignants Actifs") }</div>
                            <div class="stat-value h3 mb-0" id="active-teachers">0</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card frappe-card p-3">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-info-light me-3">
                            <i class="fa fa-clock-o text-info"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">${ __("Heures Effectuées") }</div>
                            <div class="stat-value h3 mb-0" id="total-hours">0h</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card frappe-card p-3">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-warning-light me-3">
                            <i class="fa fa-check-circle text-warning"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">${ __("Présence Moyenne") }</div>
                            <div class="stat-value h3 mb-0" id="avg-attendance">0%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Graphiques Row 1 -->
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="frappe-card p-3">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0">${ __("Évolution des Cours") }</h5>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary active" onclick="changeChartType('line')">📈</button>
                            <button class="btn btn-outline-secondary" onclick="changeChartType('bar')">📊</button>
                        </div>
                    </div>
                    <div id="evolution-chart" style="height: 300px;"></div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">${ __("Répartition par Type") }</h5>
                    <div id="course-type-chart" style="height: 300px;"></div>
                </div>
            </div>
        </div>

        <!-- Tableau des enseignants -->
        <div class="frappe-card p-3 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">${ __("Détail par Enseignant") }</h5>
                <div class="input-group input-group-sm" style="width: 250px;">
                    <span class="input-group-text bg-white border-end-0">
                        <i class="fa fa-search text-muted"></i>
                    </span>
                    <input type="text" class="form-control border-start-0" 
                           placeholder="${ __("Rechercher...") }" 
                           onkeyup="searchTable(this.value)">
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover table-sm" id="teachers-table">
                    <thead class="bg-light">
                        <tr>
                            <th>${ __("Enseignant") }</th>
                            <th>${ __("Département") }</th>
                            <th class="text-center">${ __("Cours") }</th>
                            <th class="text-center">${ __("Heures") }</th>
                            <th class="text-center">${ __("Cours Uniques") }</th>
                            <th class="text-center">${ __("Niveaux") }</th>
                            <th class="text-center">${ __("Présence") }</th>
                            <th class="text-center">${ __("Actions") }</th>
                        </tr>
                    </thead>
                    <tbody id="teachers-table-body">
                        <tr>
                            <td colspan="8" class="text-center text-muted py-4">
                                ${ __("Aucune donnée disponible") }
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Distribution par niveau -->
        <div class="row">
            <div class="col-md-6">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">${ __("Cours par Filière et Niveau") }</h5>
                    <div id="level-distribution" style="height: 300px;"></div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">${ __("Top Enseignants") }</h5>
                    <div id="top-teachers-list" class="list-group list-group-flush">
                        <!-- Rempli par JS -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    #teacher-insight-page {
        padding: 20px;
    }
    
    .filters-bar {
        background: white;
        border-radius: 10px;
    }
    
    .stat-card {
        transition: transform 0.2s, box-shadow 0.2s;
        border-left: 4px solid;
        border-left-color: transparent;
    }
    
    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
    }
    
    .bg-primary-light { background: rgba(66, 133, 244, 0.1); }
    .bg-success-light { background: rgba(52, 168, 83, 0.1); }
    .bg-info-light { background: rgba(24, 144, 255, 0.1); }
    .bg-warning-light { background: rgba(250, 173, 20, 0.1); }
    
    .table th {
        font-weight: 500;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .table td {
        vertical-align: middle;
    }
    
    .badge-course-type {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .badge-cm { background: #e3f2fd; color: #1976d2; }
    .badge-td { background: #e8f5e8; color: #2e7d32; }
    .badge-tp { background: #fff3e0; color: #f57c00; }
    
    .list-group-item {
        border: none;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .list-group-item:last-child {
        border-bottom: none;
    }
    
    .btn-outline-secondary.active {
        background-color: #f0f0f0;
        border-color: #d0d0d0;
    }
</style>`
}
function showMockDataIndicator() {
    // Ajouter un petit badge indiquant que ce sont des données d'essai
    const badge = `
        <div class="alert alert-info alert-dismissible fade show mb-3" role="alert" style="position: fixed; top: 60px; right: 20px; z-index: 1000; max-width: 300px;">
            <i class="fa fa-flask mr-2"></i>
            <strong>Mode développement</strong>
            <p class="small mb-0">Données d'essai - Les API seront connectées plus tard</p>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `;
    $('body').append(badge);
    
    // Auto-disparition après 5 secondes
    setTimeout(() => {
        $('.alert').fadeOut();
    }, 5000);
}

function loadFilterOptions() {
    frappe.call({
        method: 'udshed.api.test_api.get_filter_options',
        callback: function(r) {
            if (r.message) {
                populateSelect('faculty-filter', r.message.faculties);
                populateSelect('program-filter', r.message.programs);
                populateSelect('level-filter', r.message.levels);
                populateTeacherSelect(r.message.teachers);
                populatePeriodSelect(r.message.periods);
            }
        }
    });
}

function populateSelect(elementId, options) {
    const select = document.getElementById(elementId);
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">Tous</option>';
    
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
    });
    
    if (currentValue) select.value = currentValue;
}

function populateTeacherSelect(teachers) {
    const select = document.getElementById('teacher-filter');
    if (!select) return;
    
    select.innerHTML = '<option value="">Tous les enseignants</option>';
    
    teachers.forEach(t => {
        const option = document.createElement('option');
        option.value = t.name;
        option.textContent = t.teacher_name;
        select.appendChild(option);
    });
}

function populatePeriodSelect(periods) {
    const select = document.getElementById('period-filter');
    if (!select) return;
    
    select.innerHTML = '';
    
    periods.forEach(p => {
        const option = document.createElement('option');
        option.value = p.value;
        option.textContent = p.label;
        if (p.value === 'mois') option.selected = true;
        select.appendChild(option);
    });
}

function setupPeriodListener() {
    $('#period-filter').on('change', function() {
        if (this.value === 'personnalise') {
            $('#custom-date-range').slideDown();
        } else {
            $('#custom-date-range').slideUp();
            applyFilters();
        }
    });
}

function applyFilters() {
    const filters = {
        period: $('#period-filter').val(),
        faculty: $('#faculty-filter').val(),
        program: $('#program-filter').val(),
        level: $('#level-filter').val(),
        teacher: $('#teacher-filter').val()
    };
    
    // Afficher les filtres appliqués (debug)
    console.log('Filtres appliqués:', filters);
    
    $('#loading').show();
    $('#dashboard-content').hide();
    
    // Appel à l'API avec données mock
    frappe.call({
        method: 'udshed.api.test_api.get_teacher_data',
        args: { filters: filters },
        callback: function(r) {
            if (r.message) {
                currentData = r.message;
                updateDashboard(r.message);
                
                // Afficher les infos de debug
                if (r.message.debug_info) {
                    console.log('Période:', r.message.debug_info.period, '- Jours:', r.message.debug_info.days);
                }
            }
            $('#loading').hide();
            $('#dashboard-content').fadeIn();
        }
    });
}

function applyCustomDate() {
    const start = $('#start-date').val();
    const end = $('#end-date').val();
    
    if (start && end) {
        frappe.show_alert({
            message: __('Filtres personnalisés: du {0} au {1}', [start, end]),
            indicator: 'green'
        });
        applyFilters(); // Dans la vraie version, on passerait les dates
    } else {
        frappe.msgprint(__('Veuillez sélectionner une date de début et de fin'));
    }
}

function clearFilters() {
    $('#faculty-filter').val('');
    $('#program-filter').val('');
    $('#level-filter').val('');
    $('#teacher-filter').val('');
    $('#period-filter').val('mois');
    $('#custom-date-range').slideUp();
    applyFilters();
    
    frappe.show_alert({
        message: __('Filtres réinitialisés'),
        indicator: 'blue'
    });
}

function updateDashboard(data) {
    updateKPI(data.overview);
    updateCharts(data);
    updateTeachersTable(data.courses_by_teacher);
    updateLevelDistribution(data.courses_by_level);
    updateTopTeachers(data.top_teachers);
}

function updateKPI(overview) {
    // Animation des chiffres
    animateValue('total-courses', 0, overview.total_courses, 800);
    animateValue('active-teachers', 0, overview.active_teachers, 800);
    animateValue('total-hours', 0, overview.total_hours, 800, 'h');
    animateValue('avg-attendance', 0, overview.avg_attendance, 800, '%');
}

function animateValue(elementId, start, end, duration, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 10);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current) + suffix;
    }, 10);
}

function updateCharts(data) {
    // Graphique d'évolution
    if (evolutionChart) evolutionChart.destroy();
    
    evolutionChart = new frappe.Chart("#evolution-chart", {
        title: "Évolution des cours",
        data: {
            labels: data.evolution.map(d => {
                // Formater la date pour l'affichage
                const date = new Date(d.date);
                return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            }),
            datasets: [
                {
                    name: "Nombre de cours",
                    values: data.evolution.map(d => d.courses_count),
                    chartType: 'line'
                },
                {
                    name: "Heures effectuées",
                    values: data.evolution.map(d => d.total_hours),
                    chartType: 'line'
                }
            ]
        },
        type: 'line',
        height: 280,
        colors: ['#4285f4', '#34a853'],
        tooltipOptions: {
            formatTooltipX: d => d,
            formatTooltipY: d => d + (d === 'Heures effectuées' ? 'h' : '')
        }
    });
    
    // Graphique des types de cours
    if (typeChart) typeChart.destroy();
    
    const typeData = data.overview.by_type || [];
    typeChart = new frappe.Chart("#course-type-chart", {
        title: "Répartition par type",
        data: {
            labels: typeData.map(t => t.course_type || 'Non spécifié'),
            datasets: [
                {
                    name: "Nombre de cours",
                    values: typeData.map(t => t.count),
                    chartType: 'pie'
                }
            ]
        },
        type: 'pie',
        height: 280,
        colors: ['#4285f4', '#34a853', '#fbbc05', '#ea4335'],
        legend: true
    });
}

function updateTeachersTable(teachers) {
    const tbody = $('#teachers-table-body');
    tbody.empty();
    
    if (!teachers || teachers.length === 0) {
        tbody.append('<tr><td colspan="8" class="text-center text-muted py-4">Aucune donnée disponible</td></tr>');
        return;
    }
    
    teachers.forEach(t => {
        // Déterminer la couleur de la barre de progression
        let progressClass = 'bg-success';
        if (t.avg_attendance < 70) progressClass = 'bg-danger';
        else if (t.avg_attendance < 85) progressClass = 'bg-warning';
        
        const row = `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar avatar-sm bg-primary-light me-2" style="width: 32px; height: 32px; border-radius: 8px; background: #e3f2fd; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #1976d2;">
                            ${t.avatar || t.teacher_name.charAt(0)}
                        </div>
                        <div>
                            <div class="font-weight-bold">${t.teacher_name || 'Non assigné'}</div>
                            <small class="text-muted">${t.department || ''}</small>
                        </div>
                    </div>
                </td>
                <td>${t.department || '-'}</td>
                <td class="text-center"><span class="badge" style="background: #e8f0fe; color: #1a73e8; padding: 4px 8px; border-radius: 12px;">${t.courses_count}</span></td>
                <td class="text-center"><span class="font-weight-medium">${t.total_hours}h</span></td>
                <td class="text-center">${t.unique_courses}</td>
                <td class="text-center">${t.levels_count}</td>
                <td class="text-center" style="min-width: 100px;">
                    <div class="d-flex align-items-center">
                        <div class="progress flex-grow-1" style="height: 6px; margin-right: 8px;">
                            <div class="progress-bar ${progressClass}" style="width: ${t.avg_attendance}%"></div>
                        </div>
                        <small class="text-muted" style="min-width: 35px;">${t.avg_attendance}%</small>
                    </div>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary teacher_detail_btn" data-teacher-id="${t.teacher}" onclick="viewTeacherDetails('${t.teacher}')" style="border-radius: 6px;">
                        <i class="fa fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
}

function updateLevelDistribution(levels) {
    if (levelChart) levelChart.destroy();
    
    if (!levels || levels.length === 0) {
        $('#level-distribution').html('<div class="text-center text-muted py-5">Aucune donnée disponible</div>');
        return;
    }
    
    // Prendre les 10 premiers pour éviter la surcharge
    const topLevels = levels.slice(0, 10);
    
    levelChart = new frappe.Chart("#level-distribution", {
        title: "Distribution par filière/niveau",
        data: {
            labels: topLevels.map(l => `${l.program.substring(0, 10)} - ${l.level}`),
            datasets: [
                {
                    name: "Nombre de cours",
                    values: topLevels.map(l => l.courses_count),
                    chartType: 'bar'
                }
            ]
        },
        type: 'bar',
        height: 280,
        colors: ['#4285f4']
    });
}

function updateTopTeachers(topTeachers) {
    const container = $('#top-teachers-list');
    container.empty();
    
    if (!topTeachers || topTeachers.length === 0) {
        container.append('<div class="text-center text-muted py-3">Aucune donnée</div>');
        return;
    }
    
    topTeachers.forEach((t, index) => {
        // Icône différente pour les 3 premiers
        let trophyIcon = 'fa-trophy';
        let trophyColor = '#ffc107';
        
        if (index === 0) trophyColor = '#ffd700';
        else if (index === 1) trophyColor = '#c0c0c0';
        else if (index === 2) trophyColor = '#cd7f32';
        
        const item = `
            <div class="list-group-item d-flex align-items-center" style="border: none; border-bottom: 1px solid #f0f0f0; padding: 12px 0;">
                <div class="me-3" style="width: 24px; text-align: center;">
                    <i class="fa ${trophyIcon}" style="color: ${trophyColor};"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="font-weight-bold">${t.teacher_name}</div>
                    <small class="text-muted">${t.courses_count} cours · ${t.total_hours}h</small>
                </div>
                <div class="ms-3">
                    <span class="badge" style="background: #f0f0f0; color: #666; padding: 4px 10px; border-radius: 12px;">#${index + 1}</span>
                </div>
            </div>
        `;
        container.append(item);
    });
}

function searchTable(query) {
    const filter = query.toLowerCase();
    const rows = document.querySelectorAll('#teachers-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(filter)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Afficher le nombre de résultats
    const visibleRows = Array.from(rows).filter(r => r.style.display !== 'none').length;
    if (visibleRows === 0) {
        if ($('#no-results-message').length === 0) {
            $('#teachers-table-body').append('<tr id="no-results-message"><td colspan="8" class="text-center text-muted py-4">Aucun résultat trouvé</td></tr>');
        }
    } else {
        $('#no-results-message').remove();
    }
}

function changeChartType(type) {
    if (!currentData) return;
    
    // Mettre à jour le bouton actif
    $('.btn-group .btn').removeClass('active');
    $(event.target).addClass('active');
    
    // Recréer le graphique avec le nouveau type
    if (evolutionChart) evolutionChart.destroy();
    
    evolutionChart = new frappe.Chart("#evolution-chart", {
        title: "Évolution des cours",
        data: {
            labels: currentData.evolution.map(d => {
                const date = new Date(d.date);
                return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            }),
            datasets: [
                {
                    name: "Nombre de cours",
                    values: currentData.evolution.map(d => d.courses_count),
                    chartType: type
                }
            ]
        },
        type: type,
        height: 280,
        colors: ['#4285f4']
    });
}

function viewTeacherDetails(teacherId) {
	console.log("Teacher details")
    // Dans la version développement, afficher une modale avec les données d'essai
    frappe.call({
        method: 'udshed.api.test_api.get_teacher_details',
        args: { teacher_id: teacherId },
        callback: function(r) {
            if (r.message) {
                showTeacherDetailsModal(r.message);
            }
        }
    });
}

function showTeacherDetailsModal(teacher) {
    // Créer une modale avec les détails de l'enseignant
    const dialog = new frappe.ui.Dialog({
        title: `Détails - ${teacher.name}`,
        size: 'large',
        fields: [
            {
                fieldtype: 'HTML',
                fieldname: 'details',
                options: `
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <p><i class="fa fa-envelope text-muted mr-2"></i> ${teacher.email}</p>
                            <p><i class="fa fa-phone text-muted mr-2"></i> ${teacher.phone}</p>
                        </div>
                        <div class="col-md-6">
                            <p><i class="fa fa-building text-muted mr-2"></i> ${teacher.department}</p>
                            <p><i class="fa fa-flask text-muted mr-2"></i> ${teacher.specialty}</p>
                        </div>
                    </div>
                    
                    <h6 class="mt-3 mb-2">Statistiques</h6>
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="frappe-card p-2 text-center">
                                <div class="h5 mb-0">${teacher.stats.total_courses}</div>
                                <div class="small text-muted">Cours</div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="frappe-card p-2 text-center">
                                <div class="h5 mb-0">${teacher.stats.total_hours}h</div>
                                <div class="small text-muted">Heures</div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="frappe-card p-2 text-center">
                                <div class="h5 mb-0">${teacher.stats.avg_attendance}%</div>
                                <div class="small text-muted">Présence</div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="frappe-card p-2 text-center">
                                <div class="h5 mb-0">${teacher.stats.punctuality}%</div>
                                <div class="small text-muted">Ponctualité</div>
                            </div>
                        </div>
                    </div>
                    
                    <h6 class="mb-2">Cours enseignés</h6>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Intitulé</th>
                                <th>Niveau</th>
                                <th>Volume</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${teacher.courses.map(c => `
                                <tr>
                                    <td>${c.code}</td>
                                    <td>${c.name}</td>
                                    <td>${c.level}</td>
                                    <td>${c.hours}h</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `
            }
        ],
        primary_action_label: __('Fermer'),
        primary_action: function() {
            dialog.hide();
        }
    });
    
    dialog.show();
}

function exportData() {
    if (!currentData) return;
    
    // Simuler l'export
    frappe.show_alert({
        message: __('Export simulé - Les données sont dans la console'),
        indicator: 'green'
    });
    
    console.log('Données exportées:', currentData);
    
    // Créer un fichier JSON téléchargeable
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `teacher-insight-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function refreshData() {
    frappe.show_alert({
        message: __('Rafraîchissement des données...'),
        indicator: 'blue'
    });
    applyFilters();
}