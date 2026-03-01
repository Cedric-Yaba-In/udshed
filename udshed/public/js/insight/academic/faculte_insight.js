window.Udshed = window.Udshed || {};
window.Udshed.Insight = window.Udshed.Insight || {};
window.Udshed.Insight.Academic = window.Udshed.Insight.Academic || {};
window.Udshed.Insight.Academic.Faculty = {
    showAcademicFacultyInsights(page,filters,page_section,data) {
        const overview = data.overview;
        const container = page_section.container
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
        Udshed.Insight.UI.initLevelChart(data.by_level);
    }
};