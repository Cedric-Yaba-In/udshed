frappe.pages['test_insigh'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __('Test Inssign'),
        single_column: true
    });

    // Charger le contenu
    $(wrapper).find('.page-content').html(`
        <div id="finance-insight-page">
            <!-- En-tête -->
            <div class="page-header mb-4">
                <div class="row align-items-center">
                    <div class="col">
                        <div id="breadcrumb" class="d-flex align-items-center mb-2">
                            <span class="breadcrumb-item cursor-pointer" onclick="navigateTo('global')">
                                <i class="fa fa-home"></i> Accueil
                            </span>
                            <span id="faculty-breadcrumb" class="breadcrumb-item cursor-pointer data-navigate-to" data-navigate-to="faculty" onclick="navigateTo('faculty')" style="display: none;"></span>
                            <span id="program-breadcrumb" class="breadcrumb-item cursor-pointer data-navigate-to" data-navigate-to="program" onclick="navigateTo('program')" style="display: none;"></span>
                            <span id="level-breadcrumb" class="breadcrumb-item cursor-pointer data-navigate-to" data-navigate-to="level" onclick="navigateTo('level')" style="display: none;"></span>
                            <span id="teacher-breadcrumb" class="breadcrumb-item" style="display: none;"></span>
                        </div>
                        <h2 class="page-title" id="page-title">Tableau de bord financier</h2>
                        <p class="text-muted" id="page-subtitle">Gestion des paiements des enseignants vacataires</p>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-outline-primary btn-sm me-2 export-data" onclick="exportData()">
                            <i class="fa fa-download"></i> Exporter
                        </button>
                        <button class="btn btn-primary btn-sm refresh-data" onclick="refreshData()">
                            <i class="fa fa-refresh"></i> Rafraîchir
                        </button>
                    </div>
                </div>
            </div>

            <!-- Filtres -->
            <div class="filters-bar frappe-card p-3 mb-4">
                <div class="row g-3 align-items-end">
                    <div class="col-md-2">
                        <label class="form-label text-muted small">Période</label>
                        <select id="period-filter" class="form-control form-control-sm on-period-change" onchange="onPeriodChange()">
                            <option value="mois">Ce mois</option>
                            <option value="trimestre" selected>Ce trimestre</option>
                            <option value="semestre">Ce semestre</option>
                            <option value="annee">Cette année</option>
                            <option value="personnalise">Personnalisé</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label text-muted small">Faculté</label>
                        <select id="faculty-filter" class="form-control form-control-sm on-faculty-change" onchange="onFacultyChange()">
                            <option value="">Toutes</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label text-muted small">Filière</label>
                        <select id="program-filter" class="form-control form-control-sm on-program-change" onchange="onProgramChange()">
                            <option value="">Toutes</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label text-muted small">Niveau</label>
                        <select id="level-filter" class="form-control form-control-sm on-level-change" onchange="onLevelChange()">
                            <option value="">Tous</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label text-muted small">Enseignant</label>
                        <select id="teacher-filter" class="form-control form-control-sm on-teacher-change" onchange="onTeacherChange()">
                            <option value="">Tous</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label text-muted small">Semestre</label>
                        <select id="semestre-filter" class="form-control form-control-sm apply-filter-change" onchange="applyFilters()">
                            <option value="">Tous</option>
                            <option value="S1">Semestre 1</option>
                            <option value="S2">Semestre 2</option>
                        </select>
                    </div>
                </div>
                
                <!-- Date personnalisée -->
                <div id="custom-date-range" class="row mt-3" style="display: none;">
                    <div class="col-md-3">
                        <input type="month" id="start-month" class="form-control form-control-sm" placeholder="Mois début">
                    </div>
                    <div class="col-md-3">
                        <input type="month" id="end-month" class="form-control form-control-sm" placeholder="Mois fin">
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-sm btn-primary apply-custom-date" onclick="applyCustomDate()">Appliquer</button>
                    </div>
                </div>
            </div>

            <!-- Loading -->
            <div id="loading" class="text-center py-5" style="display: none;">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Chargement...</span>
                </div>
            </div>

            <!-- Dashboard Content -->
            <div id="dashboard-content"></div>
        </div>
    `);
    
    // Styles
    addCustomStyles();
    
    // Initialiser
    initPage();
    
    // Indicateur données mock
    showMockDataIndicator();

    showMockDataIndicator();

	$(document).on("change", ".apply-filter-change", function () {
		applyFilters();
	})

    $(document).on("change", ".on-period-change", function () {
		onPeriodChange();
	})

    $(document).on("change", ".on-faculty-change", function () {
		onFacultyChange();
	})

    $(document).on("change", ".on-program-change", function () {
		onProgramChange();
	})

    $(document).on("change", ".on-level-change", function () {
		onLevelChange();
	})

    $(document).on("change", ".on-teacher-change", function () {
		onTeacherChange();
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
		const navTo = $(this).data("navigate-to");
		navigateTo(navTo);

	})

    $(document).on("click", ".teacher-navigate-to", function () {
		const navigateTo = $(this).data("teacher-navigate-to");
		navigateToTeacher(navigateTo);

	})

    $(document).on("click", ".program-navigate-to", function () {
		const progTo = $(this).data("program-navigate-to");
		navigateToProgram(prog);

	})

    $(document).on("click", ".on-view-cours-details", function () {
		const progTo = $(this).data("view-cours-details");
		viewCourseDetail(prog);

	})


};

function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #finance-insight-page {
            padding: 20px;
        }
        
        .filters-bar {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
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
        
        .bg-primary-light { background: rgba(0, 123, 255, 0.1); }
        .bg-success-light { background: rgba(40, 167, 69, 0.1); }
        .bg-warning-light { background: rgba(255, 193, 7, 0.1); }
        .bg-info-light { background: rgba(23, 162, 184, 0.1); }
        .bg-danger-light { background: rgba(220, 53, 69, 0.1); }
        
        .amount-positive {
            color: #28a745;
            font-weight: 600;
        }
        
        .amount-negative {
            color: #dc3545;
            font-weight: 600;
        }
        
        .grade-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .grade-Doctorant { background: #e3f2fd; color: #1976d2; }
        .grade-Assistant { background: #e8f5e8; color: #2e7d32; }
        .grade-Maître-Assistant { background: #fff3e0; color: #f57c00; }
        .grade-Maître-de-Conférences { background: #f3e5f5; color: #7b1fa2; }
        .grade-Professeur { background: #ffebee; color: #c62828; }
        
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
        
        .currency-cell {
            font-family: 'Courier New', monospace;
            font-weight: 600;
            text-align: right;
        }
    `;
    document.head.appendChild(style);
}

// Variables globales
let currentData = null;
let currentView = {
    level: 'global',
    faculty: null,
    program: null,
    levelName: null,
    teacher: null
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
            <p class="small mb-0">Données financières mock - Tous les montants sont en FCFA</p>
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
                populateSelect('semestre-filter', r.message.semestres);
                populateTeacherSelect(r.message.teachers);
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
        option.value = t.id;
        option.textContent = `${t.name} (${t.grade})`;
        select.appendChild(option);
    });
}

function onPeriodChange() {
    const period = $('#period-filter').val();
    if (period === 'personnalise') {
        $('#custom-date-range').slideDown();
    } else {
        $('#custom-date-range').slideUp();
        applyFilters();
    }
}

function onFacultyChange() {
    const faculty = $('#faculty-filter').val();
    if (faculty) {
        currentView.level = 'faculty';
        currentView.faculty = faculty;
        currentView.program = null;
        currentView.levelName = null;
        currentView.teacher = null;
        
        $('#program-filter').val('');
        $('#level-filter').val('');
        $('#teacher-filter').val('');
    }
    applyFilters();
}

function onProgramChange() {
    const program = $('#program-filter').val();
    if (program) {
        currentView.level = 'program';
        currentView.program = program;
        currentView.levelName = null;
        currentView.teacher = null;
        
        $('#level-filter').val('');
        $('#teacher-filter').val('');
    }
    applyFilters();
}

function onLevelChange() {
    const level = $('#level-filter').val();
    if (level) {
        currentView.level = 'level';
        currentView.levelName = level;
        currentView.teacher = null;
        
        $('#teacher-filter').val('');
    }
    applyFilters();
}

function onTeacherChange() {
    const teacher = $('#teacher-filter').val();
    if (teacher) {
        currentView.level = 'teacher';
        currentView.teacher = teacher;
    }
    applyFilters();
}

function setupPeriodListener() {
    // Déjà géré dans onPeriodChange
}

function applyFilters() {
    // Mettre à jour currentView
    currentView.faculty = $('#faculty-filter').val() || null;
    currentView.program = $('#program-filter').val() || null;
    currentView.levelName = $('#level-filter').val() || null;
    currentView.teacher = $('#teacher-filter').val() || null;
    
    if (currentView.teacher) currentView.level = 'teacher';
    else if (currentView.levelName) currentView.level = 'level';
    else if (currentView.program) currentView.level = 'program';
    else if (currentView.faculty) currentView.level = 'faculty';
    else currentView.level = 'global';
    
    const filters = {
        period: $('#period-filter').val(),
        faculty: currentView.faculty,
        program: currentView.program,
        level: currentView.levelName,
        teacher: currentView.teacher,
        semestre: $('#semestre-filter').val(),
        view_level: currentView.level
    };
    
    $('#loading').show();
    $('#dashboard-content').empty();
    
    frappe.call({
        method: 'udshed.api.test_api.get_finance_data',
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
    const start = $('#start-month').val();
    const end = $('#end-month').val();
    
    if (start && end) {
        frappe.show_alert({
            message: `Période du ${start} au ${end}`,
            indicator: 'green'
        });
        applyFilters();
    } else {
        frappe.msgprint('Veuillez sélectionner une période');
    }
}

function updateBreadcrumb() {
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
    
    if (currentView.teacher) {
        const teacher = currentData?.teacher?.name || 'Enseignant';
        $('#teacher-breadcrumb').text(teacher).show();
    } else {
        $('#teacher-breadcrumb').hide();
    }
}

function updatePageTitle() {
    let title = '';
    let subtitle = '';
    
    switch(currentView.level) {
        case 'global':
            title = 'Tableau de bord financier global';
            subtitle = 'Gestion des paiements des enseignants vacataires';
            break;
        case 'faculty':
            title = `Faculté ${currentView.faculty}`;
            subtitle = 'Analyse financière par programme et niveau';
            break;
        case 'program':
            title = `Programme ${currentView.program}`;
            subtitle = 'Détail des coûts par cours et enseignant';
            break;
        case 'level':
            title = `Niveau ${currentView.levelName}`;
            subtitle = 'Analyse des coûts par cours';
            break;
        case 'teacher':
            title = currentData?.teacher?.name || 'Enseignant';
            subtitle = `Grade: ${currentData?.teacher?.grade} · Taux horaire: ${formatCurrency(currentData?.teacher?.taux_horaire)}/h`;
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
                teacher: null
            };
            $('#faculty-filter').val('');
            $('#program-filter').val('');
            $('#level-filter').val('');
            $('#teacher-filter').val('');
            break;
            
        case 'faculty':
            if (currentView.faculty) {
                currentView.program = null;
                currentView.levelName = null;
                currentView.teacher = null;
                $('#program-filter').val('');
                $('#level-filter').val('');
                $('#teacher-filter').val('');
            }
            break;
            
        case 'program':
            if (currentView.program) {
                currentView.levelName = null;
                currentView.teacher = null;
                $('#level-filter').val('');
                $('#teacher-filter').val('');
            }
            break;
            
        case 'level':
            if (currentView.levelName) {
                currentView.teacher = null;
                $('#teacher-filter').val('');
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
        case 'teacher':
            renderTeacherView(data, container);
            break;
        default:
            renderGlobalView(data, container);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount).replace('XOF', 'FCFA');
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
                            <i class="fa fa-clock-o text-primary"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Heures effectuées</div>
                            <div class="stat-value h3 mb-0">15 h</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #28a745;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-success-light me-3">
                            <i class="fa fa-money text-success"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Total payé</div>
                            <div class="stat-value h3 mb-0">${formatCurrency(50000)}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #ffc107;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-warning-light me-3">
                            <i class="fa fa-users text-warning"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Enseignants actifs</div>
                            <div class="stat-value h3 mb-0">15</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #17a2b8;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-info-light me-3">
                            <i class="fa fa-percent text-info"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Taux horaire moyen</div>
                            <div class="stat-value h3 mb-0">${formatCurrency(105)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Graphiques -->
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Évolution mensuelle des paiements</h5>
                    <div id="monthly-chart" style="height: 300px;"></div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Répartition par grade</h5>
                    <div id="grade-chart" style="height: 300px;"></div>
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
                        <span class="badge bg-light">${f.programs} prog.</span>
                    </div>
                    <div class="row g-2 mb-2">
                        <div class="col-6">
                            <div class="small text-muted">Heures</div>
                            <div class="font-weight-bold">${f.hours}h</div>
                        </div>
                        <div class="col-6">
                            <div class="small text-muted">Montant</div>
                            <div class="font-weight-bold amount-positive">${formatCurrency(f.amount)}</div>
                        </div>
                    </div>
                    <div class="progress progress-sm">
                        <div class="progress-bar bg-primary" style="width: ${(f.amount / data.overview.total_paid * 100)}%"></div>
                    </div>
                    <div class="small text-muted mt-1">${f.sessions} sessions · ${f.teachers.size} enseignants</div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <!-- Répartition par grade et top enseignants -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Détail par grade</h5>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Grade</th>
                                <th class="text-center">Enseignants</th>
                                <th class="text-center">Heures</th>
                                <th class="text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    data.grade_summary.forEach(g => {
        html += `
            <tr>
                <td><span class="grade-badge grade-${g.grade.replace(' ', '-')}">${g.grade}</span></td>
                <td class="text-center">${g.teachers.size}</td>
                <td class="text-center">${g.hours}h</td>
                <td class="currency-cell">${formatCurrency(g.amount)}</td>
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-md-6">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Top enseignants</h5>
                    <div class="list-group list-group-flush">
    `;
    
    data.top_teachers.forEach((t, index) => {
        html += `
            <div class="list-group-item d-flex align-items-center cursor-pointer teacher-navigate-to " data-teacher-navigate-to="${t.id}" onclick="navigateToTeacher('${t.id}')">
                <span class="badge bg-light me-3" style="min-width: 30px;">#${index + 1}</span>
                <div class="flex-grow-1">
                    <strong>${t.name}</strong>
                    <div class="small text-muted">${t.grade} · ${t.sessions} sessions · ${t.hours}h</div>
                </div>
                <div class="amount-positive font-weight-bold">${formatCurrency(t.amount)}</div>
            </div>
        `;
    });
    
    html += `
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Transactions récentes -->
        <div class="frappe-card p-3">
            <h5 class="mb-3">Dernières transactions</h5>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Enseignant</th>
                            <th>Cours</th>
                            <th>Niveau</th>
                            <th>Heures</th>
                            <th>Taux</th>
                            <th class="text-right">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    data.recent_transactions.forEach(t => {
        html += `
            <tr>
                <td>${t.date}</td>
                <td><strong>${t.teacher_name}</strong><br><small>${t.teacher_grade}</small></td>
                <td>${t.course_code}<br><small>${t.course_name}</small></td>
                <td>${t.level}</td>
                <td>${t.hours_actual}h</td>
                <td>${formatCurrency(t.taux_horaire)}/h</td>
                <td class="currency-cell amount-positive">${formatCurrency(t.montant)}</td>
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
                            <i class="fa fa-clock-o text-primary"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Heures</div>
                            <div class="stat-value h3 mb-0">${overview.total_hours}h</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #28a745;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-success-light me-3">
                            <i class="fa fa-money text-success"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Total payé</div>
                            <div class="stat-value h3 mb-0">${formatCurrency(overview.total_paid)}</div>
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
            <h5 class="mb-3">Programmes</h5>
            <div class="row">
    `;
    
    data.program_summary.forEach(p => {
        html += `
            <div class="col-md-4 mb-3">
                <div class="program-card program-navigate-to" data-program-navigate-to="${p.name}" onclick="navigateToProgram('${p.name}')">
                    <h6 class="mb-2">${p.name}</h6>
                    <div class="row g-2 mb-2">
                        <div class="col-6">
                            <div class="small text-muted">Heures</div>
                            <div class="font-weight-bold">${p.hours}h</div>
                        </div>
                        <div class="col-6">
                            <div class="small text-muted">Montant</div>
                            <div class="font-weight-bold amount-positive">${formatCurrency(p.amount)}</div>
                        </div>
                    </div>
                    <div class="progress progress-sm mb-2">
                        <div class="progress-bar bg-primary" style="width: ${(p.amount / data.overview.total_paid * 100)}%"></div>
                    </div>
                    <div class="small text-muted">
                        ${p.levels.size} niveaux · ${p.teachers.size} enseignants · ${p.sessions} sessions
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <!-- Niveaux et types -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Répartition par niveau</h5>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Niveau</th>
                                <th class="text-center">Heures</th>
                                <th class="text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    data.level_summary.forEach(l => {
        html += `
            <tr>
                <td><strong>${l.level}</strong></td>
                <td class="text-center">${l.hours}h</td>
                <td class="currency-cell">${formatCurrency(l.amount)}</td>
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-md-6">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Par type de cours</h5>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th class="text-center">Sessions</th>
                                <th class="text-center">Heures</th>
                                <th class="text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    data.type_summary.forEach(t => {
        html += `
            <tr>
                <td>
                    <span class="badge" style="background: ${t.type === 'CM' ? '#e3f2fd' : t.type === 'TD' ? '#e8f5e8' : '#fff3e0'}; color: ${t.type === 'CM' ? '#1976d2' : t.type === 'TD' ? '#2e7d32' : '#f57c00'};">${t.type}</span>
                </td>
                <td class="text-center">${t.sessions}</td>
                <td class="text-center">${t.hours}h</td>
                <td class="currency-cell">${formatCurrency(t.amount)}</td>
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    container.html(html);
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
                            <i class="fa fa-clock-o text-primary"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Heures</div>
                            <div class="stat-value h3 mb-0">${overview.total_hours}h</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #28a745;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-success-light me-3">
                            <i class="fa fa-money text-success"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Total payé</div>
                            <div class="stat-value h3 mb-0">${formatCurrency(overview.total_paid)}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card" style="border-left-color: #ffc107;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-warning-light me-3">
                            <i class="fa fa-book text-warning"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Cours</div>
                            <div class="stat-value h3 mb-0">${overview.courses_count}</div>
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
        
        <!-- Niveaux -->
        <div class="frappe-card p-3 mb-4">
            <h5 class="mb-3">Niveaux</h5>
            <div class="row">
    `;
    
    data.level_summary.forEach(l => {
        html += `
            <div class="col-md-4 mb-3">
                <div class="program-card" onclick="navigateToLevel('${l.level}')">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="mb-0">Niveau ${l.level}</h6>
                        <span class="badge bg-light">${l.courses.size} cours</span>
                    </div>
                    <div class="row g-2 mb-2">
                        <div class="col-6">
                            <div class="small text-muted">Heures</div>
                            <div class="font-weight-bold">${l.hours}h</div>
                        </div>
                        <div class="col-6">
                            <div class="small text-muted">Montant</div>
                            <div class="font-weight-bold amount-positive">${formatCurrency(l.amount)}</div>
                        </div>
                    </div>
                    <div class="progress progress-sm mb-2">
                        <div class="progress-bar bg-primary" style="width: ${(l.amount / data.overview.total_paid * 100)}%"></div>
                    </div>
                    <div class="small text-muted">
                        ${l.teachers.size} enseignants · ${l.sessions} sessions
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <!-- Cours -->
        <div class="frappe-card p-3 mb-4">
            <h5 class="mb-3">Cours</h5>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Cours</th>
                            <th>Type</th>
                            <th>Enseignant</th>
                            <th>Grade</th>
                            <th class="text-center">Sessions</th>
                            <th class="text-center">Heures</th>
                            <th class="text-center">Taux/h</th>
                            <th class="text-right">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    data.course_summary.forEach(c => {
        html += `
            <tr class="cursor-pointer on-view-cours-details" data-view-cours-details="${c.code}" onclick="viewCourseDetail('${c.code}')">
                <td><strong>${c.code}</strong><br><small>${c.name}</small></td>
                <td><span class="badge" style="background: ${c.type === 'CM' ? '#e3f2fd' : c.type === 'TD' ? '#e8f5e8' : '#fff3e0'}; color: ${c.type === 'CM' ? '#1976d2' : c.type === 'TD' ? '#2e7d32' : '#f57c00'};">${c.type}</span></td>
                <td>${c.teacher}</td>
                <td><span class="grade-badge grade-${c.teacher_grade.replace(' ', '-')}">${c.teacher_grade}</span></td>
                <td class="text-center">${c.sessions}</td>
                <td class="text-center">${c.hours}h</td>
                <td class="text-center">${formatCurrency(c.taux_horaire)}</td>
                <td class="currency-cell amount-positive">${formatCurrency(c.amount)}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Enseignants -->
        <div class="frappe-card p-3">
            <h5 class="mb-3">Enseignants</h5>
            <div class="row">
    `;
    
    data.teacher_summary.forEach(t => {
        html += `
            <div class="col-md-4 mb-3">
                <div class="program-card teacher-navigate-to" data-teacher-navigate-to="${t.id}" onclick="navigateToTeacher('${t.id}')">
                    <div class="d-flex align-items-center mb-2">
                        <div class="avatar avatar-sm bg-primary-light me-2" style="width: 32px; height: 32px; border-radius: 8px; background: #e3f2fd; display: flex; align-items: center; justify-content: center;">
                            ${t.name.charAt(0)}
                        </div>
                        <div>
                            <strong>${t.name}</strong>
                            <div class="small text-muted">${t.grade}</div>
                        </div>
                    </div>
                    <div class="row g-2 mb-2">
                        <div class="col-4">
                            <div class="small text-muted">Heures</div>
                            <div class="font-weight-bold">${t.hours}h</div>
                        </div>
                        <div class="col-4">
                            <div class="small text-muted">Taux</div>
                            <div class="font-weight-bold">${formatCurrency(t.taux_horaire)}</div>
                        </div>
                        <div class="col-4">
                            <div class="small text-muted">Montant</div>
                            <div class="font-weight-bold amount-positive">${formatCurrency(t.amount)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
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
            <div class="col-md-4">
                <div class="stat-card" style="border-left-color: #007bff;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-primary-light me-3">
                            <i class="fa fa-clock-o text-primary"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Heures</div>
                            <div class="stat-value h3 mb-0">${overview.total_hours}h</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card" style="border-left-color: #28a745;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-success-light me-3">
                            <i class="fa fa-money text-success"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Total payé</div>
                            <div class="stat-value h3 mb-0">${formatCurrency(overview.total_paid)}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-card" style="border-left-color: #17a2b8;">
                    <div class="d-flex align-items-center">
                        <div class="stat-icon bg-info-light me-3">
                            <i class="fa fa-book text-info"></i>
                        </div>
                        <div>
                            <div class="stat-label text-muted small">Cours</div>
                            <div class="stat-value h3 mb-0">${overview.courses_count}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Cours du niveau -->
        <div class="frappe-card p-3">
            <h5 class="mb-3">Cours du niveau ${data.level}</h5>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Cours</th>
                            <th>Type</th>
                            <th>Enseignant</th>
                            <th class="text-center">Sessions</th>
                            <th class="text-center">Heures</th>
                            <th class="text-right">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    data.course_summary.forEach(c => {
        html += `
            <tr>
                <td><strong>${c.code}</strong><br><small>${c.name}</small></td>
                <td><span class="badge" style="background: ${c.type === 'CM' ? '#e3f2fd' : c.type === 'TD' ? '#e8f5e8' : '#fff3e0'}; color: ${c.type === 'CM' ? '#1976d2' : c.type === 'TD' ? '#2e7d32' : '#f57c00'};">${c.type}</span></td>
                <td>${c.teacher}</td>
                <td class="text-center">${c.sessions}</td>
                <td class="text-center">${c.hours}h</td>
                <td class="currency-cell amount-positive">${formatCurrency(c.amount)}</td>
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

function renderTeacherView(data, container) {
    const teacher = data.teacher;
    const overview = data.overview;
    
    let html = `
        <!-- Informations enseignant -->
        <div class="frappe-card p-4 mb-4">
            <div class="row">
                <div class="col-md-8">
                    <div class="d-flex align-items-center mb-3">
                        <div class="avatar avatar-lg bg-primary-light me-3" style="width: 64px; height: 64px; border-radius: 12px; background: #e3f2fd; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #1976d2;">
                            ${teacher.name.charAt(0)}
                        </div>
                        <div>
                            <h3 class="mb-1">${teacher.name}</h3>
                            <p class="mb-1">
                                <span class="grade-badge grade-${teacher.grade.replace(' ', '-')} me-2">${teacher.grade}</span>
                                <span class="badge ${teacher.status === 'Actif' ? 'bg-success' : 'bg-danger'}">${teacher.status}</span>
                            </p>
                            <p class="text-muted small mb-0">
                                <i class="fa fa-credit-card mr-1"></i> IBAN: ${teacher.iban}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 text-right">
                    <div class="h2 amount-positive mb-1">${formatCurrency(overview.total_paid)}</div>
                    <div class="text-muted">Total payé sur la période</div>
                    <div class="mt-2">
                        <span class="badge bg-light">Taux horaire: ${formatCurrency(teacher.taux_horaire)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- KPIs -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card p-3" style="border-left-color: #007bff;">
                    <div class="small text-muted">Heures effectuées</div>
                    <div class="h3 mb-0">${overview.total_hours}h</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card p-3" style="border-left-color: #28a745;">
                    <div class="small text-muted">Sessions</div>
                    <div class="h3 mb-0">${overview.total_sessions}</div>
                    <small class="text-muted">${overview.sessions_effectuees} effectuées · ${overview.sessions_annulees} annulées</small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card p-3" style="border-left-color: #ffc107;">
                    <div class="small text-muted">Moyenne mensuelle</div>
                    <div class="h3 mb-0">${formatCurrency(overview.avg_monthly)}</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card p-3" style="border-left-color: #17a2b8;">
                    <div class="small text-muted">Taux horaire effectif</div>
                    <div class="h3 mb-0">${formatCurrency(overview.avg_hourly)}</div>
                </div>
            </div>
        </div>
        
        <!-- Graphiques -->
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Évolution mensuelle</h5>
                    <div id="teacher-monthly-chart" style="height: 250px;"></div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="frappe-card p-3">
                    <h5 class="mb-3">Répartition par cours</h5>
                    <div id="teacher-courses-chart" style="height: 250px;"></div>
                </div>
            </div>
        </div>
        
        <!-- Cours enseignés -->
        <div class="frappe-card p-3 mb-4">
            <h5 class="mb-3">Cours enseignés</h5>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Cours</th>
                            <th>Type</th>
                            <th>Faculté</th>
                            <th>Programme</th>
                            <th>Niveau</th>
                            <th class="text-center">Sessions</th>
                            <th class="text-center">Heures</th>
                            <th class="text-right">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    data.course_summary.forEach(c => {
        html += `
            <tr>
                <td><strong>${c.code}</strong><br><small>${c.name}</small></td>
                <td><span class="badge" style="background: ${c.type === 'CM' ? '#e3f2fd' : c.type === 'TD' ? '#e8f5e8' : '#fff3e0'}; color: ${c.type === 'CM' ? '#1976d2' : c.type === 'TD' ? '#2e7d32' : '#f57c00'};">${c.type}</span></td>
                <td>${c.faculty}</td>
                <td>${c.program}</td>
                <td>${c.level}</td>
                <td class="text-center">${c.sessions}</td>
                <td class="text-center">${c.hours}h</td>
                <td class="currency-cell amount-positive">${formatCurrency(c.amount)}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Historique des paiements -->
        <div class="frappe-card p-3">
            <h5 class="mb-3">Historique des paiements</h5>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Cours</th>
                            <th>Type</th>
                            <th>Heures</th>
                            <th>Taux</th>
                            <th class="text-right">Montant</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    data.recent_transactions.forEach(t => {
        html += `
            <tr>
                <td>${t.date}</td>
                <td>${t.course_code}<br><small>${t.course_name}</small></td>
                <td>${t.course_type}</td>
                <td>${t.hours_actual}h</td>
                <td>${formatCurrency(t.taux_horaire)}/h</td>
                <td class="currency-cell amount-positive">${formatCurrency(t.montant)}</td>
                <td><span class="badge ${t.status === 'effectué' ? 'bg-success' : 'bg-danger'}">${t.status}</span></td>
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
    
    // Initialiser les graphiques de l'enseignant
    initTeacherCharts(data);
}

function initGlobalCharts(data) {
    // Graphique mensuel
    if (evolutionChart) evolutionChart.destroy();
    
    evolutionChart = new frappe.Chart("#monthly-chart", {
        data: {
            labels: data.monthly_evolution.map(m => m.month.substring(0, 3)),
            datasets: [
                {
                    name: "Montant (FCFA)",
                    values: data.monthly_evolution.map(m => m.amount),
                    chartType: 'bar'
                }
            ]
        },
        type: 'bar',
        height: 280,
        colors: ['#28a745']
    });
    
    // Graphique par grade
    new frappe.Chart("#grade-chart", {
        data: {
            labels: data.grade_summary.map(g => g.grade),
            datasets: [
                {
                    name: "Montant",
                    values: data.grade_summary.map(g => g.amount),
                    chartType: 'pie'
                }
            ]
        },
        type: 'pie',
        height: 280,
        colors: ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#dc3545']
    });
}

function initTeacherCharts(data) {
    // Graphique mensuel enseignant
    new frappe.Chart("#teacher-monthly-chart", {
        data: {
            labels: data.monthly_summary.map(m => m.month.substring(0, 3)),
            datasets: [
                {
                    name: "Heures",
                    values: data.monthly_summary.map(m => m.hours),
                    chartType: 'line'
                },
                {
                    name: "Montant",
                    values: data.monthly_summary.map(m => m.amount / 1000), // en milliers
                    chartType: 'line'
                }
            ]
        },
        type: 'line',
        height: 250,
        colors: ['#007bff', '#28a745']
    });
    
    // Graphique répartition par cours
    const courseData = data.course_summary.slice(0, 5);
    new frappe.Chart("#teacher-courses-chart", {
        data: {
            labels: courseData.map(c => c.code),
            datasets: [
                {
                    name: "Montant",
                    values: courseData.map(c => c.amount),
                    chartType: 'pie'
                }
            ]
        },
        type: 'pie',
        height: 250,
        colors: ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#dc3545']
    });
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

function navigateToTeacher(teacherId) {
    $('#teacher-filter').val(teacherId);
    onTeacherChange();
}

function viewCourseDetail(courseCode) {
    frappe.show_alert({
        message: `Détails du cours ${courseCode}`,
        indicator: 'blue'
    });
    // Dans une version réelle, ouvrir une modale ou naviguer
}

function exportData() {
    if (!currentData) return;
    
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `finance-${currentView.level}-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    frappe.show_alert({
        message: 'Export terminé',
        indicator: 'green'
    });
}

function refreshData() {
    frappe.show_alert({
        message: 'Rafraîchissement des données...',
        indicator: 'blue'
    });
    applyFilters();
}
