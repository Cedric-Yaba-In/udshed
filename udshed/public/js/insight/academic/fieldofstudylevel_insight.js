window.Udshed = window.Udshed || {};
window.Udshed.Insight = window.Udshed.Insight || {};
window.Udshed.Insight.Academic = window.Udshed.Insight.Academic || {};
window.Udshed.Insight.Academic.FieldOfStudyLevel = {
    showAcademicFieldOfStudyLevelInsights(page,filters,page_section,data) {
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
                            <div class="stat-icon me-3" style="background-color: #17a2b8">
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
                        <button class="btn btn-sm btn-outline-primary on-view-cours-details" data-view-cours-details="${c.code}" onclick="event.stopPropagation(); viewCourseDetail('${c.code}')">
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
        $(document).on("click", ".on-view-cours-details", function () {
            console.log("Vieuw for data")
            const progTo = $(this).data("view-cours-details");
            viewCourseDetail(prog);

        })
    }
};