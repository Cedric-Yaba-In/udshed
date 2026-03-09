frappe.pages['test_insigh'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __('Test Inssign'),
        single_column: true
    });

    // Charger le contenu
    $(wrapper).find('.page-content').html(render_ui());
    
    // Initialiser
    initPage();
    
    // Afficher un indicateur de données d'essai
    showMockDataIndicator();
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

	
};

// Variables globales
let currentData = null;
let currentView = {
    level: 'global',
    faculty: null,
    program: null,
    levelName: null,
    course: null
};
let evolutionChart = null;
let distributionChart = null;

function initPage() {
    loadFilterOptions();
    setupPeriodListener();
    applyFilters();
}

function showMockDataIndicator() {
    const badge = `
        <div class="alert alert-info alert-dismissible fade show mb-3" role="alert" style="position: fixed; top: 60px; right: 20px; z-index: 1000; max-width: 300px;">
            <i class="fa fa-flask mr-2"></i>
            <strong>Mode développement</strong>
            <p class="small mb-0">Données d'essai - Navigation hiérarchique active</p>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `;
    $('body').append(badge);
    
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

                // populateCourseSelect(r.message.courses);
                // populatePeriodSelect(r.message.periods);
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

function populateCourseSelect(courses) {
    const select = document.getElementById('course-filter');
    if (!select) return;
    
    select.innerHTML = '<option value="">Tous les cours</option>';
    
    courses.forEach(c => {
        const option = document.createElement('option');
        option.value = c.code;
        option.textContent = `${c.code} - ${c.name}`;
        select.appendChild(option);
    });
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

function onFacultyChange() {
    const faculty = $('#faculty-filter').val();
    if (faculty) {
        currentView.level = 'faculty';
        currentView.faculty = faculty;
        currentView.program = null;
        currentView.levelName = null;
        currentView.course = null;
        
        // Mettre à jour les filtres dépendants
        $('#program-filter').val('');
        $('#level-filter').val('');
        $('#course-filter').val('');
    }
    applyFilters();
}

function onProgramChange() {
    const program = $('#program-filter').val();
    if (program) {
        currentView.level = 'program';
        currentView.program = program;
        currentView.levelName = null;
        currentView.course = null;
        
        // Mettre à jour les filtres dépendants
        $('#level-filter').val('');
        $('#course-filter').val('');
    }
    applyFilters();
}

function onLevelChange() {
    const level = $('#level-filter').val();
    if (level) {
        currentView.level = 'level';
        currentView.levelName = level;
        currentView.course = null;
        
        // Mettre à jour les filtres dépendants
        $('#course-filter').val('');
    }
    applyFilters();
}

function onCourseChange() {
    const course = $('#course-filter').val();
    if (course) {
        currentView.level = 'course';
        currentView.course = course;
    }
    applyFilters();
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
    // Mettre à jour currentView avec les valeurs des filtres
    currentView.faculty = $('#faculty-filter').val() || null;
    currentView.program = $('#program-filter').val() || null;
    currentView.levelName = $('#level-filter').val() || null;
    currentView.course = $('#course-filter').val() || null;
    
    // Déterminer le niveau de vue
    if (currentView.course) currentView.level = 'course';
    else if (currentView.levelName) currentView.level = 'level';
    else if (currentView.program) currentView.level = 'program';
    else if (currentView.faculty) currentView.level = 'faculty';
    else currentView.level = 'global';
    
    const filters = {
        period: $('#period-filter').val(),
        faculty: currentView.faculty,
        program: currentView.program,
        level: currentView.levelName,
        course: currentView.course,
        teacher: $('#teacher-filter').val(),
        view_level: currentView.level
    };
    
    console.log('Filtres appliqués:', filters);
    
    $('#loading').show();
    $('#dashboard-content').empty();
    
    frappe.call({
        method: 'udshed.api.test_api.get_teacher_data',
        args: { filters: filters },
        callback: function(r) {
            if (r.message) {
                currentData = r.message;
                updateBreadcrumb();
                updatePageTitle();
                renderView(currentData);
            }
            $('#loading').hide();
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
        applyFilters();
    } else {
        frappe.msgprint(__('Veuillez sélectionner une date de début et de fin'));
    }
}

function updateBreadcrumb() {
    // Mettre à jour le fil d'Ariane
    if (currentView.faculty) {
        $('#faculty-breadcrumb').text(currentView.faculty).show();
    } else {
        $('#faculty-breadcrumb').hide();
    }
    
    if (currentView.program) {
        $('#program-breadcrumb').text(currentView.program).show();
    } else {
        $('#program-breadcrumb').hide();
    }
    
    if (currentView.levelName) {
        $('#level-breadcrumb').text(`Niveau ${currentView.levelName}`).show();
    } else {
        $('#level-breadcrumb').hide();
    }
    
    if (currentView.course) {
        $('#course-breadcrumb').text(currentView.course).show();
    } else {
        $('#course-breadcrumb').hide();
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
    
    $('#page-title').text(title);
    $('#page-subtitle').text(subtitle);
}

function navigateTo(level) {
    switch(level) {
        case 'global':
            currentView = {
                level: 'global',
                faculty: null,
                program: null,
                levelName: null,
                course: null
            };
            $('#faculty-filter').val('');
            $('#program-filter').val('');
            $('#level-filter').val('');
            $('#course-filter').val('');
            break;
            
        case 'faculty':
            if (currentView.faculty) {
                currentView.program = null;
                currentView.levelName = null;
                currentView.course = null;
                $('#program-filter').val('');
                $('#level-filter').val('');
                $('#course-filter').val('');
            }
            break;
            
        case 'program':
            if (currentView.program) {
                currentView.levelName = null;
                currentView.course = null;
                $('#level-filter').val('');
                $('#course-filter').val('');
            }
            break;
            
        case 'level':
            if (currentView.levelName) {
                currentView.course = null;
                $('#course-filter').val('');
            }
            break;
    }
    
    applyFilters();
}

function renderView(data) {
    const container = $('#dashboard-content');
    container.empty();
    
    switch(data.view_level) {
        case 'global':
            renderGlobalView(data, container);
            break;
        case 'faculty':
            renderFacultyView(data, container);
            break;
        case 'program':
            renderProgramView(data, container);
            break;
        case 'level':
            renderLevelView(data, container);
            break;
        case 'course':
            renderCourseView(data, container);
            break;
        default:
            renderGlobalView(data, container);
    }
}

function renderGlobalView(data, container) {
    const overview = data.overview;
    
    let html = `
        <!-- KPIs -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #007bff;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-primary-light me-3">
                            <i class="fa fa-calendar-check-o text-primary"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Total Sessions</div>
                            <div class="stat-value h3 mb-0">${overview.total_sessions}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #28a745;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-success-light me-3">
                            <i class="fa fa-clock-o text-success"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Heures effectuées</div>
                            <div class="stat-value h3 mb-0">${overview.total_hours_done}h</div>
                            <small class="text-muted">/${overview.total_hours_planned}h</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #ffc107;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-warning-light me-3">
                            <i class="fa fa-check-circle text-warning"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Taux complétion</div>
                            <div class="stat-value h3 mb-0">${overview.completion_rate}%</div>
                            <small class="text-muted">${overview.sessions_completed} terminés</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #17a2b8;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-info-light me-3">
                            <i class="fa fa-users text-info"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Présence moyenne</div>
                            <div class="stat-value h3 mb-0">${overview.avg_attendance}%</div>
                            <small class="text-muted">Délai moy. ${overview.avg_delay} min</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Graphiques -->
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Évolution des cours</h5>
                    <div id="evolution-chart" style="height: 300px;"></div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Répartition par statut</h5>
                    <div id="status-chart" style="height: 300px;"></div>
                </div>
            </div>
        </div>
        
        <!-- Résumé par faculté -->
        <div class="frappe-card p-3 mb-4">
            <h5 class="mb-3">Résumé par faculté</h5>
            <div class="row">
    `;
    
    data.faculty_summary.forEach(f => {
        html += `
            <div class="col-md-4 mb-3">
                <div class="program-card" onclick="navigateToFaculty('${f.name}')">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="mb-0">${f.name}</h6>
                        <span class="badge badge-${f.completion_color}">${f.completion_rate}%</span>
                    </div>
                    <div class="small text-muted mb-2">
                        <i class="fa fa-book mr-1"></i> ${f.programs} programmes · 
                        <i class="fa fa-clock-o mr-1"></i> ${f.sessions} sessions
                    </div>
                    <div class="progress progress-sm">
                        <div class="progress-bar bg-${f.completion_color}" style="width: ${f.completion_rate}%"></div>
                    </div>
                    <div class="d-flex justify-content-between mt-2 small">
                        <span>${f.hours_done}h effectuées</span>
                        <span>/${f.hours_planned}h</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <!-- Sessions récentes -->
        <div class="frappe-card p-3">
            <h5 class="mb-3">Sessions récentes</h5>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Cours</th>
                            <th>Type</th>
                            <th>Enseignant</th>
                            <th>Statut</th>
                            <th>Présence</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    data.recent_sessions.slice(0, 10).forEach(s => {
        const statusClass = `status-${s.status}`;
        html += `
            <tr>
                <td>${s.date}</td>
                <td><strong>${s.course_code}</strong><br><small>${s.course_name}</small></td>
                <td><span class="badge" style="background: ${s.course_type === 'CM' ? '#e3f2fd' : s.course_type === 'TD' ? '#e8f5e8' : '#fff3e0'}; color: ${s.course_type === 'CM' ? '#1976d2' : s.course_type === 'TD' ? '#2e7d32' : '#f57c00'};">${s.course_type}</span></td>
                <td>${s.teacher_name}</td>
                <td><span class="status-badge ${statusClass}">${getStatusLabel(s.status)}</span></td>
                <td>${s.attendance_rate > 0 ? s.attendance_rate + '%' : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewCourseDetail('${s.course_code}')">
                        <i class="fa fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.html(html);
    
    // Initialiser les graphiques
    initGlobalCharts(data);
}

function renderFacultyView(data, container) {
    const overview = data.overview;
    
    let html = `
        <!-- KPIs -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #007bff;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-primary-light me-3">
                            <i class="fa fa-calendar-check-o text-primary"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Total Sessions</div>
                            <div class="stat-value h3 mb-0">${overview.total_sessions}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #28a745;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-success-light me-3">
                            <i class="fa fa-clock-o text-success"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Taux complétion</div>
                            <div class="stat-value h3 mb-0">${overview.completion_rate}%</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #ffc107;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-warning-light me-3">
                            <i class="fa fa-graduation-cap text-warning"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Programmes</div>
                            <div class="stat-value h3 mb-0">${overview.programs_count}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #17a2b8;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-info-light me-3">
                            <i class="fa fa-users text-info"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Enseignants</div>
                            <div class="stat-value h3 mb-0">${overview.teachers_count}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Programmes -->
        <div class="frappe-card p-3 mb-4">
            <h5 class="mb-3">Programmes de la faculté</h5>
            <div class="row">
    `;
    
    data.program_summary.forEach(p => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="program-card" onclick="navigateToProgram('${p.name}')">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="mb-0">${p.name}</h6>
                        <span class="badge badge-${p.completion_color}">${p.completion_rate}%</span>
                    </div>
                    <div class="small text-muted mb-2">
                        <i class="fa fa-layer-group mr-1"></i> Niveaux: ${p.levels.join(', ')} · 
                        <i class="fa fa-users mr-1"></i> ${p.teachers} enseignants
                    </div>
                    <div class="progress progress-sm mb-2">
                        <div class="progress-bar bg-${p.completion_color}" style="width: ${p.completion_rate}%"></div>
                    </div>
                    <div class="d-flex justify-content-between small">
                        <span>${p.hours_done}h effectuées</span>
                        <span class="text-muted">${p.sessions} sessions</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <!-- Top enseignants et répartition -->
        <div class="row">
            <div class="col-md-6">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Top enseignants</h5>
                    <div class="list-group list-group-flush">
    `;
    
    data.top_teachers.forEach((t, index) => {
        html += `
            <div class="list-group-item d-flex align-items-center">
                <span class="badge bg-light me-3">#${index + 1}</span>
                <div class="flex-grow-1">
                    <strong>${t.name}</strong>
                    <div class="small text-muted">${t.sessions} sessions · ${t.hours}h</div>
                </div>
                <button class="btn btn-sm btn-outline-primary" onclick="viewTeacherDetails('${t.id}')">
                    <i class="fa fa-user"></i>
                </button>
            </div>
        `;
    });
    
    html += `
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Répartition par niveau</h5>
                    <div id="level-chart" style="height: 250px;"></div>
                </div>
            </div>
        </div>
    `;
    
    container.html(html);
    
    // Graphique des niveaux
    initLevelChart(data.by_level);
}

function renderProgramView(data, container) {
    const overview = data.overview;
    
    let html = `
        <!-- KPIs -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #007bff;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-primary-light me-3">
                            <i class="fa fa-calendar-check-o text-primary"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Sessions</div>
                            <div class="stat-value h3 mb-0">${overview.total_sessions}</div>
                            <small class="text-muted">${overview.sessions_completed} terminés</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #28a745;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-success-light me-3">
                            <i class="fa fa-clock-o text-success"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Heures</div>
                            <div class="stat-value h3 mb-0">${overview.total_hours_done}h</div>
                            <small class="text-muted">/${overview.total_hours_planned}h</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #ffc107;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-warning-light me-3">
                            <i class="fa fa-check-circle text-warning"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Complétion</div>
                            <div class="stat-value h3 mb-0">${overview.completion_rate}%</div>
                            <small class="text-muted">${overview.sessions_with_eval} évaluations</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #17a2b8;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-info-light me-3">
                            <i class="fa fa-users text-info"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Présence</div>
                            <div class="stat-value h3 mb-0">${overview.avg_attendance}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Niveaux -->
        <div class="frappe-card p-3 mb-4">
            <h5 class="mb-3">Niveaux</h5>
            <div class="row">
    `;
    
    data.level_summary.forEach(l => {
        html += `
            <div class="col-md-4 mb-3">
                <div class="program-card" onclick="navigateToLevel('${l.name}')">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="mb-0">Niveau ${l.name}</h6>
                        <span class="badge badge-${l.completion_color}">${l.completion_rate}%</span>
                    </div>
                    <div class="small text-muted mb-2">
                        <i class="fa fa-book mr-1"></i> ${l.courses} cours · 
                        <i class="fa fa-users mr-1"></i> ${l.students} étudiants
                    </div>
                    <div class="progress progress-sm mb-2">
                        <div class="progress-bar bg-${l.completion_color}" style="width: ${l.completion_rate}%"></div>
                    </div>
                    <div class="d-flex justify-content-between small">
                        <span>${l.hours_done}h effectuées</span>
                        <span class="text-muted">${l.sessions} sessions</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <!-- Cours -->
        <div class="frappe-card p-3">
            <h5 class="mb-3">Cours du programme</h5>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Intitulé</th>
                            <th>Type</th>
                            <th>Enseignant</th>
                            <th>Sessions</th>
                            <th>Heures</th>
                            <th>Complétion</th>
                            <th>Présence</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    data.course_summary.forEach(c => {
        html += `
            <tr class="cursor-pointer" onclick="navigateToCourse('${c.code}')">
                <td><strong>${c.code}</strong></td>
                <td>${c.name}</td>
                <td><span class="badge" style="background: ${c.type === 'CM' ? '#e3f2fd' : c.type === 'TD' ? '#e8f5e8' : '#fff3e0'}; color: ${c.type === 'CM' ? '#1976d2' : c.type === 'TD' ? '#2e7d32' : '#f57c00'};">${c.type}</span></td>
                <td>${c.teacher}</td>
                <td class="text-center">${c.sessions}</td>
                <td>${c.hours_done}h <small class="text-muted">/${c.hours_planned}h</small></td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="progress flex-grow-1 me-2" style="height: 6px; width: 60px;">
                            <div class="progress-bar bg-${c.completion_color}" style="width: ${c.completion_rate}%"></div>
                        </div>
                        <small>${c.completion_rate}%</small>
                    </div>
                </td>
                <td>${c.avg_attendance}%</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); viewCourseDetail('${c.code}')">
                        <i class="fa fa-chevron-right"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.html(html);
}

function renderLevelView(data, container) {
    const overview = data.overview;
    
    let html = `
        <!-- KPIs -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #007bff;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-primary-light me-3">
                            <i class="fa fa-calendar-check-o text-primary"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Sessions</div>
                            <div class="stat-value h3 mb-0">${overview.total_sessions}</div>
                            <small class="text-muted">${overview.sessions_completed} terminés</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #28a745;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-success-light me-3">
                            <i class="fa fa-clock-o text-success"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Taux complétion</div>
                            <div class="stat-value h3 mb-0">${overview.completion_rate}%</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #ffc107;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-warning-light me-3">
                            <i class="fa fa-graduation-cap text-warning"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Cours</div>
                            <div class="stat-value h3 mb-0">${overview.courses_count}</div>
                            <small class="text-muted">${overview.sessions_with_eval} évaluations</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #17a2b8;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-info-light me-3">
                            <i class="fa fa-users text-info"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Présence</div>
                            <div class="stat-value h3 mb-0">${overview.avg_attendance}%</div>
                            <small class="text-muted">Délai ${overview.avg_delay} min</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Cours du niveau -->
        <div class="frappe-card p-3 mb-4">
            <h5 class="mb-3">Cours du niveau ${data.level}</h5>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Cours</th>
                            <th>Type</th>
                            <th>Enseignant</th>
                            <th>Sessions</th>
                            <th>Heures</th>
                            <th>Complétion</th>
                            <th>Présence</th>
                            <th>Évals</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    data.course_summary.forEach(c => {
        html += `
            <tr class="cursor-pointer" onclick="navigateToCourse('${c.code}')">
                <td><strong>${c.code}</strong><br><small>${c.name}</small></td>
                <td><span class="badge" style="background: ${c.type === 'CM' ? '#e3f2fd' : c.type === 'TD' ? '#e8f5e8' : '#fff3e0'}; color: ${c.type === 'CM' ? '#1976d2' : c.type === 'TD' ? '#2e7d32' : '#f57c00'};">${c.type}</span></td>
                <td>${c.teacher}</td>
                <td class="text-center">${c.sessions} <small class="text-muted">(${c.sessions_completed} OK)</small></td>
                <td>${c.hours_done}h <small class="text-muted">/${c.hours_planned}h</small></td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="progress flex-grow-1 me-2" style="height: 6px; width: 60px;">
                            <div class="progress-bar bg-${c.completion_color}" style="width: ${c.completion_rate}%"></div>
                        </div>
                        <small>${c.completion_rate}%</small>
                    </div>
                </td>
                <td>${c.avg_attendance}%</td>
                <td class="text-center"><span class="badge bg-light">${c.evaluations}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); viewCourseDetail('${c.code}')">
                        <i class="fa fa-chevron-right"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Calendrier -->
        <div class="frappe-card p-3">
            <h5 class="mb-3">Calendrier des sessions</h5>
            <div class="row">
    `;
    
    // Afficher les 7 prochains jours
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        
        html += `
            <div class="col calendar-day">
                <div class="small text-muted mb-2">${dayName} ${date.getDate()}</div>
        `;
        
        if (data.calendar[dateStr]) {
            data.calendar[dateStr].forEach(event => {
                html += `
                    <div class="calendar-event" onclick="viewSessionDetail('${event.course}', '${dateStr}')">
                        <div class="font-weight-bold">${event.time}</div>
                        <div>${event.course}</div>
                        <div class="small text-muted">${event.teacher}</div>
                    </div>
                `;
            });
        } else {
            html += `<div class="text-muted small">Aucune session</div>`;
        }
        
        html += `</div>`;
    }
    
    html += `
            </div>
        </div>
    `;
    
    container.html(html);
}

function renderCourseView(data, container) {
    const overview = data.overview;
    const course = data.course;
    
    let html = `
        <!-- En-tête du cours -->
        <div class="frappe-card p-4 mb-4">
            <div class="row">
                <div class="col-md-8">
                    <h3>${course.name}</h3>
                    <p class="text-muted mb-2">${course.code} · ${course.type} · Niveau ${course.level}</p>
                    <div class="d-flex align-items-center">
                        <div class="avatar avatar-sm bg-primary-light me-2" style="width: 32px; height: 32px; border-radius: 8px; background: #e3f2fd; display: flex; align-items: center; justify-content: center;">
                            ${course.teacher.charAt(0)}
                        </div>
                        <span>${course.teacher}</span>
                        <button class="btn btn-sm btn-outline-primary ms-3" onclick="viewTeacherDetails('${course.teacher_id}')">
                            <i class="fa fa-user"></i> Voir l'enseignant
                        </button>
                    </div>
                </div>
                <div class="col-md-4 text-right">
                    <div class="d-flex justify-content-end">
                        <div class="text-center me-4">
                            <div class="h4 mb-0">${overview.completion_rate}%</div>
                            <div class="small text-muted">Complétion</div>
                        </div>
                        <div class="text-center">
                            <div class="h4 mb-0">${overview.avg_attendance}%</div>
                            <div class="small text-muted">Présence</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- KPIs -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card p-3" style="border-left-color: #007bff;">
                    <div class="small text-muted">Sessions</div>
                    <div class="h3 mb-0">${overview.total_sessions}</div>
                    <small class="text-muted">${overview.sessions_completed} terminés · ${overview.sessions_planned} à venir</small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card p-3" style="border-left-color: #28a745;">
                    <div class="small text-muted">Heures effectuées</div>
                    <div class="h3 mb-0">${overview.total_hours_done}h</div>
                    <small class="text-muted">sur ${overview.total_hours_planned}h prévues</small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card p-3" style="border-left-color: #ffc107;">
                    <div class="small text-muted">Annulations/Reports</div>
                    <div class="h3 mb-0">${overview.sessions_cancelled + overview.sessions_rescheduled}</div>
                    <small class="text-muted">${overview.sessions_cancelled} annulés · ${overview.sessions_rescheduled} reportés</small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card p-3" style="border-left-color: #17a2b8;">
                    <div class="small text-muted">Évaluations</div>
                    <div class="h3 mb-0">${overview.evaluations_count}</div>
                    <small class="text-muted">sessions d'évaluation</small>
                </div>
            </div>
        </div>
        
        <!-- Graphiques -->
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Évolution de l'assiduité</h5>
                    <div id="attendance-chart" style="height: 250px;"></div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Statut des sessions</h5>
                    <div id="course-status-chart" style="height: 250px;"></div>
                </div>
            </div>
        </div>
        
        <!-- Liste des sessions -->
        <div class="frappe-card p-3">
            <h5 class="mb-3">Historique des sessions</h5>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Horaire</th>
                            <th>Salle</th>
                            <th>Statut</th>
                            <th>Présence</th>
                            <th>Retard</th>
                            <th>Évaluation</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    data.sessions.forEach(s => {
        const statusClass = `status-${s.status}`;
        html += `
            <tr>
                <td>${s.date}</td>
                <td>${s.start_time} - ${s.end_time}</td>
                <td>${s.room}</td>
                <td><span class="status-badge ${statusClass}">${getStatusLabel(s.status)}</span></td>
                <td>${s.attendance_rate > 0 ? s.attendance_rate + '%' : '-'}</td>
                <td>${s.delay_minutes > 0 ? s.delay_minutes + ' min' : '-'}</td>
                <td>${s.has_evaluation ? '<span class="badge bg-success">' + s.evaluation_type + '</span>' : '-'}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Évaluations -->
        ${data.evaluations.length > 0 ? `
        <div class="frappe-card p-3 mt-4">
            <h5 class="mb-3">Évaluations</h5>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Présence</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.evaluations.map(e => `
                            <tr>
                                <td>${e.date}</td>
                                <td>${e.type}</td>
                                <td>${e.attendance}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ''}
    `;
    
    container.html(html);
    
    // Initialiser les graphiques du cours
    initCourseCharts(data);
}

function initGlobalCharts(data) {
    // Graphique d'évolution
    if (evolutionChart) evolutionChart.destroy();
    
    evolutionChart = new frappe.Chart("#evolution-chart", {
        data: {
            labels: data.evolution.map(d => {
                const date = new Date(d.date);
                return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            }),
            datasets: [
                {
                    name: "Planifiés",
                    values: data.evolution.map(d => d.planned),
                    chartType: 'line'
                },
                {
                    name: "Terminés",
                    values: data.evolution.map(d => d.completed),
                    chartType: 'line'
                }
            ]
        },
        type: 'line',
        height: 280,
        colors: ['#ffc107', '#28a745']
    });
    
    // Graphique des statuts
    new frappe.Chart("#status-chart", {
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
        height: 280,
        colors: ['#ffc107', '#17a2b8', '#28a745', '#dc3545', '#fd7e14']
    });
}

function initLevelChart(levelData) {
    new frappe.Chart("#level-chart", {
        data: {
            labels: levelData.map(l => l.level),
            datasets: [
                {
                    name: "Sessions",
                    values: levelData.map(l => l.count),
                    chartType: 'bar'
                }
            ]
        },
        type: 'bar',
        height: 250,
        colors: ['#007bff']
    });
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

function getStatusLabel(status) {
    const labels = {
        'planned': 'Planifié',
        'in_progress': 'En cours',
        'completed': 'Terminé',
        'cancelled': 'Annulé',
        'rescheduled': 'Reporté'
    };
    return labels[status] || status;
}

// Fonctions de navigation
function navigateToFaculty(facultyName) {
    $('#faculty-filter').val(facultyName);
    onFacultyChange();
}

function navigateToProgram(programName) {
    $('#program-filter').val(programName);
    onProgramChange();
}

function navigateToLevel(levelName) {
    $('#level-filter').val(levelName);
    onLevelChange();
}

function navigateToCourse(courseCode) {
    $('#course-filter').val(courseCode);
    onCourseChange();
}

function viewCourseDetail(courseCode) {
    navigateToCourse(courseCode);
}

function viewTeacherDetails(teacherId) {
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

function viewSessionDetail(courseCode, date) {
    frappe.show_alert({
        message: `Détails de la session du ${date} pour ${courseCode}`,
        indicator: 'blue'
    });
    // Dans une version réelle, ouvrir une modale avec les détails
}

function showTeacherDetailsModal(teacher) {
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
    
    frappe.show_alert({
        message: __('Préparation de l\'export...'),
        indicator: 'blue'
    });
    
    // Simuler un export
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cours-${currentView.level}-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    frappe.show_alert({
        message: __('Export terminé'),
        indicator: 'green'
    });
}

function refreshData() {
    frappe.show_alert({
        message: __('Rafraîchissement des données...'),
        indicator: 'blue'
    });
    applyFilters();
}

function clearFilters() {
    $('#faculty-filter').val('');
    $('#program-filter').val('');
    $('#level-filter').val('');
    $('#course-filter').val('');
    $('#teacher-filter').val('');
    $('#period-filter').val('mois');
    $('#custom-date-range').slideUp();
    
    currentView = {
        level: 'global',
        faculty: null,
        program: null,
        levelName: null,
        course: null
    };
    
    applyFilters();
}

function render_ui()
{
	return `
	<div id="teacher-insight-page">
    <!-- En-tête -->
    <div class="page-header mb-4">
        <div class="row align-items-center">
            <div class="col">
                <div class="d-flex align-items-center">
                    <!-- Fil d'Ariane de navigation -->
                    <div id="breadcrumb" class="d-flex align-items-center">
                        <span class="breadcrumb-item cursor-pointer data-navigate-to" data-navigate-to="global" onclick="navigateTo('global')">
                            <i class="fa fa-home"></i> Accueil
                        </span>
                        <span id="faculty-breadcrumb" class="breadcrumb-item cursor-pointer data-navigate-to" data-navigate-to="faculty" onclick="navigateTo('faculty')" style="display: none;"></span>
                        <span id="program-breadcrumb" class="breadcrumb-item cursor-pointer data-navigate-to" data-navigate-to="faculty" onclick="navigateTo('program')" style="display: none;"></span>
                        <span id="level-breadcrumb" class="breadcrumb-item cursor-pointer data-navigate-to" data-navigate-to="faculty" onclick="navigateTo('level')" style="display: none;"></span>
                        <span id="course-breadcrumb" class="breadcrumb-item" style="display: none;"></span>
                    </div>
                </div>
                <h2 class="page-title mt-2" id="page-title">Tableau de bord de suivi des cours</h2>
                <p class="text-muted" id="page-subtitle">Vue globale - Toutes les facultés</p>
            </div>
            <div class="col-auto">
                <button class="btn btn-outline-primary btn-sm me-2 export-data" onclick="exportData()">
                    <i class="fa fa-download"></i> ${ __("Exporter") }
                </button>
                <button class="btn btn-primary btn-sm refresh-data" onclick="refreshData()">
                    <i class="fa fa-refresh"></i> ${ __("Rafraîchir") }
                </button>
            </div>
        </div>
    </div>

    <!-- Barre de filtres -->
    <div class="filters-bar frappe-card p-3 mb-4">
        <div class="row g-3 align-items-end">
            <div class="col-md-2">
                <label class="form-label text-muted small">${ __("Période") }</label>
                <select id="period-filter" class="form-control form-control-sm apply-filter-change" onchange="applyFilters()">
                    <option value="semaine">${ __("Cette semaine") }</option>
                    <option value="mois" selected>${ __("Ce mois") }</option>
                    <option value="trimestre">${ __("Ce trimestre") }</option>
                    <option value="annee">${ __("Cette année") }</option>
                    <option value="personnalise">${ __("Personnalisé") }</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label text-muted small">${ __("Faculté") }</label>
                <select id="faculty-filter" class="form-control form-control-sm apply-filter-change" onchange="onFacultyChange()">
                    <option value="">${ __("Toutes") }</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label text-muted small">${ __("Filière") }</label>
                <select id="program-filter" class="form-control form-control-sm apply-filter-change" onchange="onProgramChange()">
                    <option value="">${ __("Toutes") }</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label text-muted small">${ __("Niveau") }</label>
                <select id="level-filter" class="form-control form-control-sm apply-filter-change" onchange="onLevelChange()">
                    <option value="">${ __("Tous") }</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label text-muted small">${ __("Cours") }</label>
                <select id="course-filter" class="form-control form-control-sm apply-filter-change" onchange="onCourseChange()">
                    <option value="">${ __("Tous") }</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label text-muted small">${ __("Enseignant") }</label>
                <select id="teacher-filter" class="form-control form-control-sm apply-filter-change" onchange="applyFilters()">
                    <option value="">${ __("Tous") }</option>
                </select>
            </div>
        </div>
        
        <!-- Filtres personnalisés -->
        <div id="custom-date-range" class="row mt-3" style="display: none;">
            <div class="col-md-3">
                <input type="date" id="start-date" class="form-control form-control-sm" placeholder="Date début">
            </div>
            <div class="col-md-3">
                <input type="date" id="end-date" class="form-control form-control-sm" placeholder="Date fin">
            </div>
            <div class="col-md-2">
                <button class="btn btn-sm btn-primary apply-custom-date" onclick="applyCustomDate()">${ __("Appliquer") }</button>
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
        <!-- Cette section sera dynamiquement remplie par JavaScript -->
    </div>
</div>

<style>
    #teacher-insight-page {
        padding: 20px;
    }
    
    .filters-bar {
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    /* Fil d'Ariane */
    .breadcrumb-item {
        position: relative;
        padding-right: 20px;
        color: #6c757d;
        font-size: 0.9rem;
    }
    
    .breadcrumb-item:after {
        content: '/';
        position: absolute;
        right: 8px;
        color: #adb5bd;
    }
    
    .breadcrumb-item:last-child:after {
        content: '';
    }
    
    .breadcrumb-item.cursor-pointer:hover {
        color: #007bff;
        text-decoration: underline;
    }
    
    /* Cartes de statistiques */
    .stat-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        transition: transform 0.2s, box-shadow 0.2s;
        border-left: 4px solid;
    }
    
    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.1);
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
    
    /* Badges de statut */
    .status-badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 500;
        display: inline-block;
    }
    
    .status-planned { background: #fff3cd; color: #856404; }
    .status-in_progress { background: #d1ecf1; color: #0c5460; }
    .status-completed { background: #d4edda; color: #155724; }
    .status-cancelled { background: #f8d7da; color: #721c24; }
    .status-rescheduled { background: #fff3e0; color: #f57c00; }
    
    /* Cartes de programme/niveau */
    .program-card {
        background: white;
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 12px;
        border: 1px solid #f0f0f0;
        transition: all 0.2s;
        cursor: pointer;
    }
    
    .program-card:hover {
        border-color: #007bff;
        box-shadow: 0 4px 8px rgba(0,123,255,0.1);
    }
    
    .progress-sm {
        height: 6px;
        border-radius: 3px;
    }
    
    /* Tableau responsive */
    .table th {
        font-weight: 600;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #6c757d;
        border-top: none;
    }
    
    .table td {
        vertical-align: middle;
        padding: 12px 8px;
    }
    
    /* Calendrier */
    .calendar-day {
        border-left: 1px solid #f0f0f0;
        padding: 8px;
        min-height: 100px;
    }
    
    .calendar-day:first-child {
        border-left: none;
    }
    
    .calendar-event {
        background: #e3f2fd;
        border-radius: 4px;
        padding: 4px 8px;
        margin-bottom: 4px;
        font-size: 0.75rem;
        cursor: pointer;
    }
    
    .calendar-event:hover {
        background: #bbdefb;
    }
</style>
	`
}