window.Udshed = window.Udshed || {};
window.Udshed.Insight = window.Udshed.Insight || {};
window.Udshed.Insight.Academic = window.Udshed.Insight.Academic || {};
window.Udshed.Insight.Academic.FieldOfStudy = {
    showAcademicFieldOfStudyInsights(page,filters,page_section,data) {
       const overview = data.overview;
       const container = page_section.container;
    
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
};