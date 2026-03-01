import frappe
from frappe import _

@frappe.whitelist()
def get_dashboard_stats(academic_year, week_start, filiere=None):

    # Exemple simplifié
    planning = frappe.get_all(
        "Planning Item",
        filters={
            "academic_year": academic_year
        },
        fields=["cours", "date", "salle"]
    )

    total_courses = len(planning)
    total_teachers = 0
    rooms_used = len(set(p["salle"] for p in planning if p["salle"]))
    total_hours = total_courses * 2  # exemple

    chart_data = {}
    for p in planning:
        day = str(p["date"])
        chart_data.setdefault(day, 0)
        chart_data[day] += 2

    return {
        "kpi": {
            "total_courses": total_courses,
            "total_hours": total_hours,
            "total_teachers": total_teachers,
            "rooms_used": rooms_used
        },
        "chart": {
            "labels": list(chart_data.keys()),
            "values": list(chart_data.values())
        },
        "table": planning
    }

import frappe
from frappe import _
import json
import random
from datetime import datetime, timedelta

@frappe.whitelist()
def get_teacher_data(filters=None):
    """
    Retourne des données d'essai pour le développement
    """
    if isinstance(filters, str):
        filters = json.loads(filters)
    
    # Générer des données d'essai
    return generate_mock_data(filters)

def generate_mock_data(filters=None):
    """Génère un jeu de données d'essai réaliste avec détails approfondis"""
    
    # Récupérer le niveau de détail demandé
    view_level = filters.get('view_level', 'global') if filters else 'global'
    selected_faculty = filters.get('faculty') if filters else None
    selected_program = filters.get('program') if filters else None
    selected_level = filters.get('level') if filters else None
    selected_course = filters.get('course') if filters else None
    
    # Enseignants fictifs
    teachers = [
        {"id": "T001", "name": "Dr. Martin Dupont", "dept": "Mathématiques", "avatar": "MD", "email": "m.dupont@univ.edu", "phone": "07-89-45-67-89"},
        {"id": "T002", "name": "Prof. Sophie Laurent", "dept": "Physique", "avatar": "SL", "email": "s.laurent@univ.edu", "phone": "05-67-89-12-34"},
        {"id": "T003", "name": "Dr. Jean Kouassi", "dept": "Informatique", "avatar": "JK", "email": "j.kouassi@univ.edu", "phone": "01-23-45-67-89"},
        {"id": "T004", "name": "Mme. Fatima Diallo", "dept": "Lettres", "avatar": "FD", "email": "f.diallo@univ.edu", "phone": "02-34-56-78-90"},
        {"id": "T005", "name": "Prof. Marc Zadi", "dept": "Chimie", "avatar": "MZ", "email": "m.zadi@univ.edu", "phone": "03-45-67-89-01"},
        {"id": "T006", "name": "Dr. Awa Touré", "dept": "Biologie", "avatar": "AT", "email": "a.toure@univ.edu", "phone": "04-56-78-90-12"},
        {"id": "T007", "name": "M. Paul Ekissi", "dept": "Histoire", "avatar": "PE", "email": "p.ekissi@univ.edu", "phone": "06-78-90-12-34"},
        {"id": "T008", "name": "Dr. Yves N'Guessan", "dept": "Philosophie", "avatar": "YN", "email": "y.nguessan@univ.edu", "phone": "08-90-12-34-56"}
    ]
    
    # Types de cours
    course_types = [
        {"code": "CM", "name": "Cours Magistral", "color": "badge-cm", "bg": "#e3f2fd", "text": "#1976d2"},
        {"code": "TD", "name": "Travaux Dirigés", "color": "badge-td", "bg": "#e8f5e8", "text": "#2e7d32"},
        {"code": "TP", "name": "Travaux Pratiques", "color": "badge-tp", "bg": "#fff3e0", "text": "#f57c00"}
    ]
    
    # Statuts de cours
    course_statuses = [
        {"code": "planned", "name": "Planifié", "color": "#ffc107"},
        {"code": "in_progress", "name": "En cours", "color": "#17a2b8"},
        {"code": "completed", "name": "Terminé", "color": "#28a745"},
        {"code": "cancelled", "name": "Annulé", "color": "#dc3545"},
        {"code": "rescheduled", "name": "Reporté", "color": "#fd7e14"}
    ]
    
    # Filières et niveaux (structure arborescente)
    faculties = [
        {
            "name": "Sciences",
            "programs": [
                {
                    "name": "Mathématiques",
                    "levels": ["L1", "L2", "L3", "M1", "M2"],
                    "courses": [
                        {"code": "MATH101", "name": "Algèbre 1", "hours": 45, "type": "CM", "teacher": "T001"},
                        {"code": "MATH102", "name": "Analyse 1", "hours": 45, "type": "CM", "teacher": "T001"},
                        {"code": "MATH103", "name": "Algèbre 2", "hours": 45, "type": "CM", "teacher": "T001"},
                        {"code": "MATH201", "name": "Analyse 2", "hours": 45, "type": "CM", "teacher": "T001"},
                        {"code": "MATH202", "name": "Géométrie", "hours": 30, "type": "CM", "teacher": "T001"},
                        {"code": "MATH301", "name": "Analyse numérique", "hours": 36, "type": "CM", "teacher": "T001"},
                        {"code": "TD-MATH101", "name": "TD Algèbre 1", "hours": 22, "type": "TD", "teacher": "T003"},
                        {"code": "TD-MATH102", "name": "TD Analyse 1", "hours": 22, "type": "TD", "teacher": "T003"},
                        {"code": "TP-MATH101", "name": "TP Calcul", "hours": 20, "type": "TP", "teacher": "T006"}
                    ]
                },
                {
                    "name": "Physique",
                    "levels": ["L1", "L2", "L3", "M1", "M2"],
                    "courses": [
                        {"code": "PHY101", "name": "Mécanique 1", "hours": 45, "type": "CM", "teacher": "T002"},
                        {"code": "PHY102", "name": "Électricité", "hours": 45, "type": "CM", "teacher": "T002"},
                        {"code": "PHY201", "name": "Thermodynamique", "hours": 45, "type": "CM", "teacher": "T002"},
                        {"code": "PHY202", "name": "Optique", "hours": 30, "type": "CM", "teacher": "T002"},
                        {"code": "TD-PHY101", "name": "TD Mécanique", "hours": 22, "type": "TD", "teacher": "T005"},
                        {"code": "TP-PHY101", "name": "TP Physique", "hours": 24, "type": "TP", "teacher": "T005"}
                    ]
                },
                {
                    "name": "Chimie",
                    "levels": ["L1", "L2", "L3", "M1", "M2"],
                    "courses": [
                        {"code": "CHM101", "name": "Chimie générale", "hours": 45, "type": "CM", "teacher": "T005"},
                        {"code": "CHM102", "name": "Chimie organique", "hours": 45, "type": "CM", "teacher": "T005"},
                        {"code": "CHM201", "name": "Chimie analytique", "hours": 45, "type": "CM", "teacher": "T005"},
                        {"code": "TP-CHM101", "name": "TP Chimie", "hours": 30, "type": "TP", "teacher": "T005"}
                    ]
                },
                {
                    "name": "Biologie",
                    "levels": ["L1", "L2", "L3", "M1", "M2"],
                    "courses": [
                        {"code": "BIO101", "name": "Biologie cellulaire", "hours": 45, "type": "CM", "teacher": "T006"},
                        {"code": "BIO102", "name": "Génétique", "hours": 45, "type": "CM", "teacher": "T006"},
                        {"code": "BIO201", "name": "Physiologie", "hours": 45, "type": "CM", "teacher": "T006"},
                        {"code": "TP-BIO101", "name": "TP Biologie", "hours": 36, "type": "TP", "teacher": "T006"}
                    ]
                },
                {
                    "name": "Informatique",
                    "levels": ["L1", "L2", "L3", "M1", "M2"],
                    "courses": [
                        {"code": "INF101", "name": "Algorithmique", "hours": 45, "type": "CM", "teacher": "T003"},
                        {"code": "INF102", "name": "Programmation C", "hours": 45, "type": "CM", "teacher": "T003"},
                        {"code": "INF201", "name": "Bases de données", "hours": 45, "type": "CM", "teacher": "T003"},
                        {"code": "INF202", "name": "Réseaux", "hours": 45, "type": "CM", "teacher": "T003"},
                        {"code": "TP-INF101", "name": "TP Programmation", "hours": 30, "type": "TP", "teacher": "T003"}
                    ]
                }
            ]
        },
        {
            "name": "Lettres",
            "programs": [
                {
                    "name": "Lettres Modernes",
                    "levels": ["L1", "L2", "L3", "M1", "M2"],
                    "courses": [
                        {"code": "LET101", "name": "Grammaire", "hours": 30, "type": "CM", "teacher": "T004"},
                        {"code": "LET102", "name": "Littérature française", "hours": 45, "type": "CM", "teacher": "T004"},
                        {"code": "LET201", "name": "Littérature comparée", "hours": 45, "type": "CM", "teacher": "T004"},
                        {"code": "TD-LET101", "name": "TD Expression", "hours": 22, "type": "TD", "teacher": "T004"}
                    ]
                },
                {
                    "name": "Histoire",
                    "levels": ["L1", "L2", "L3", "M1", "M2"],
                    "courses": [
                        {"code": "HIS101", "name": "Histoire ancienne", "hours": 30, "type": "CM", "teacher": "T007"},
                        {"code": "HIS102", "name": "Histoire médiévale", "hours": 30, "type": "CM", "teacher": "T007"},
                        {"code": "HIS201", "name": "Histoire moderne", "hours": 30, "type": "CM", "teacher": "T007"},
                        {"code": "HIS202", "name": "Histoire contemporaine", "hours": 30, "type": "CM", "teacher": "T007"}
                    ]
                },
                {
                    "name": "Philosophie",
                    "levels": ["L1", "L2", "L3", "M1", "M2"],
                    "courses": [
                        {"code": "PHI101", "name": "Philosophie antique", "hours": 30, "type": "CM", "teacher": "T008"},
                        {"code": "PHI102", "name": "Philosophie moderne", "hours": 30, "type": "CM", "teacher": "T008"},
                        {"code": "PHI201", "name": "Éthique", "hours": 30, "type": "CM", "teacher": "T008"},
                        {"code": "PHI202", "name": "Métaphysique", "hours": 30, "type": "CM", "teacher": "T008"}
                    ]
                }
            ]
        }
    ]
    
    # Période
    period = filters.get('period', 'mois') if filters else 'mois'
    days = get_days_for_period(period)
    
    # Générer les sessions de cours pour la période
    all_sessions = generate_course_sessions(faculties, days, teachers, course_statuses)
    
    # Filtrer selon la vue
    filtered_sessions = filter_sessions(all_sessions, filters)
    
    # Construire la réponse selon le niveau de vue
    if view_level == 'global':
        response = build_global_view(faculties, filtered_sessions, teachers, course_types, period)
    elif view_level == 'faculty' and selected_faculty:
        response = build_faculty_view(selected_faculty, faculties, filtered_sessions, teachers, course_types, period)
    elif view_level == 'program' and selected_program:
        response = build_program_view(selected_program, faculties, filtered_sessions, teachers, course_types, period)
    elif view_level == 'level' and selected_level:
        response = build_level_view(selected_level, selected_program, faculties, filtered_sessions, teachers, course_types, period)
    elif view_level == 'course' and selected_course:
        response = build_course_detail_view(selected_course, filtered_sessions, teachers, course_statuses)
    else:
        response = build_global_view(faculties, filtered_sessions, teachers, course_types, period)
    
    # Ajouter les métadonnées
    response['debug_info'] = {
        "period": period,
        "days": days,
        "view_level": view_level,
        "filters_applied": filters,
        "total_sessions": len(filtered_sessions)
    }
    
    return response

def generate_course_sessions(faculties, days, teachers, course_statuses):
    """Génère des sessions de cours pour la période"""
    sessions = []
    current_date = datetime.now()
    
    for faculty in faculties:
        for program in faculty['programs']:
            for level in program['levels']:
                for course in program['courses']:
                    # Nombre de sessions pour ce cours (1-3 par semaine)
                    num_sessions = random.randint(days // 7, days // 7 * 3)
                    
                    for i in range(num_sessions):
                        session_date = current_date - timedelta(days=random.randint(0, days-1))
                        
                        # Statut (plus de complétés vers le passé)
                        days_ago = (current_date - session_date).days
                        if days_ago > 7:
                            status = random.choices(
                                ['completed', 'cancelled', 'rescheduled'],
                                weights=[0.85, 0.10, 0.05]
                            )[0]
                        elif days_ago > 2:
                            status = random.choices(
                                ['completed', 'in_progress', 'cancelled'],
                                weights=[0.60, 0.30, 0.10]
                            )[0]
                        else:
                            status = random.choices(
                                ['planned', 'in_progress'],
                                weights=[0.70, 0.30]
                            )[0]
                        
                        # Présence
                        if status == 'completed':
                            students_present = random.randint(20, 45)
                            total_students = random.randint(35, 50)
                            attendance_rate = round(students_present * 100 / total_students, 1)
                        else:
                            students_present = 0
                            total_students = random.randint(35, 50)
                            attendance_rate = 0
                        
                        # Retard
                        delay = random.randint(0, 20) if status == 'completed' and random.random() > 0.7 else 0
                        
                        # Évaluation
                        has_evaluation = random.random() > 0.85
                        
                        session = {
                            "id": f"SESS{len(sessions)+1:04d}",
                            "date": session_date.strftime("%Y-%m-%d"),
                            "faculty": faculty['name'],
                            "program": program['name'],
                            "level": level,
                            "course_code": course['code'],
                            "course_name": course['name'],
                            "course_type": course['type'],
                            "teacher_id": course['teacher'],
                            "teacher_name": next((t['name'] for t in teachers if t['id'] == course['teacher']), "Inconnu"),
                            "planned_hours": random.choice([1, 1.5, 2, 2.5, 3]),
                            "actual_hours": 0,
                            "status": status,
                            "students_present": students_present,
                            "total_students": total_students,
                            "attendance_rate": attendance_rate,
                            "delay_minutes": delay,
                            "has_evaluation": has_evaluation,
                            "evaluation_type": random.choice(['DS', 'Examen', 'TP noté']) if has_evaluation else None,
                            "room": f"Salle {random.choice(['A', 'B', 'C'])}{random.randint(101, 404)}",
                            "start_time": f"{random.randint(8, 16):02d}:00",
                            "end_time": f"{random.randint(9, 18):02d}:00"
                        }
                        
                        # Heures effectives selon statut
                        if status == 'completed':
                            session['actual_hours'] = session['planned_hours']
                        elif status == 'in_progress':
                            session['actual_hours'] = round(session['planned_hours'] * random.uniform(0.3, 0.9), 1)
                        elif status == 'cancelled':
                            session['actual_hours'] = 0
                        else:  # planned, rescheduled
                            session['actual_hours'] = 0
                        
                        sessions.append(session)
    
    return sessions

def filter_sessions(sessions, filters):
    """Filtre les sessions selon les critères"""
    if not filters:
        return sessions
    
    filtered = sessions.copy()
    
    if filters.get('faculty'):
        filtered = [s for s in filtered if s['faculty'] == filters['faculty']]
    
    if filters.get('program'):
        filtered = [s for s in filtered if s['program'] == filters['program']]
    
    if filters.get('level'):
        filtered = [s for s in filtered if s['level'] == filters['level']]
    
    if filters.get('course'):
        filtered = [s for s in filtered if s['course_code'] == filters['course']]
    
    if filters.get('teacher'):
        filtered = [s for s in filtered if s['teacher_id'] == filters['teacher']]
    
    return filtered

def build_global_view(faculties, sessions, teachers, course_types, period):
    """Vue globale avec résumé par faculté"""
    
    # Statistiques globales
    total_sessions = len(sessions)
    total_hours_planned = sum(s['planned_hours'] for s in sessions)
    total_hours_done = sum(s['actual_hours'] for s in sessions)
    completion_rate = round(total_hours_done * 100 / total_hours_planned, 1) if total_hours_planned > 0 else 0
    
    sessions_completed = len([s for s in sessions if s['status'] == 'completed'])
    sessions_cancelled = len([s for s in sessions if s['status'] == 'cancelled'])
    sessions_rescheduled = len([s for s in sessions if s['status'] == 'rescheduled'])
    sessions_with_eval = len([s for s in sessions if s.get('has_evaluation')])
    
    # Évolution quotidienne
    evolution = {}
    for s in sessions:
        if s['date'] not in evolution:
            evolution[s['date']] = {
                'date': s['date'],
                'planned': 0,
                'completed': 0,
                'hours': 0,
                'attendance': []
            }
        evolution[s['date']]['planned'] += 1
        if s['status'] == 'completed':
            evolution[s['date']]['completed'] += 1
            evolution[s['date']]['hours'] += s['actual_hours']
        if s['attendance_rate'] > 0:
            evolution[s['date']]['attendance'].append(s['attendance_rate'])
    
    evolution_data = [
        {
            'date': k,
            'planned': v['planned'],
            'completed': v['completed'],
            'hours': round(v['hours'], 1),
            'attendance': round(sum(v['attendance']) / len(v['attendance']), 1) if v['attendance'] else 0
        }
        for k, v in sorted(evolution.items())
    ]
    
    # Résumé par faculté
    faculty_summary = []
    for faculty in faculties:
        faculty_sessions = [s for s in sessions if s['faculty'] == faculty['name']]
        if faculty_sessions:
            faculty_hours_planned = sum(s['planned_hours'] for s in faculty_sessions)
            faculty_hours_done = sum(s['actual_hours'] for s in faculty_sessions)
            faculty_completion = round(faculty_hours_done * 100 / faculty_hours_planned, 1) if faculty_hours_planned > 0 else 0
            
            faculty_summary.append({
                'name': faculty['name'],
                'sessions': len(faculty_sessions),
                'programs': len(faculty['programs']),
                'hours_planned': round(faculty_hours_planned, 1),
                'hours_done': round(faculty_hours_done, 1),
                'completion_rate': faculty_completion,
                'completion_color': get_completion_color(faculty_completion)
            })
    
    return {
        'view_level': 'global',
        'title': 'Tableau de bord global',
        'period': period,
        'overview': {
            'total_sessions': total_sessions,
            'total_hours_planned': round(total_hours_planned, 1),
            'total_hours_done': round(total_hours_done, 1),
            'completion_rate': completion_rate,
            'sessions_completed': sessions_completed,
            'sessions_cancelled': sessions_cancelled,
            'sessions_rescheduled': sessions_rescheduled,
            'sessions_with_eval': sessions_with_eval,
            'avg_attendance': round(sum(s['attendance_rate'] for s in sessions if s['attendance_rate'] > 0) / len([s for s in sessions if s['attendance_rate'] > 0]), 1) if sessions else 0,
            'avg_delay': round(sum(s['delay_minutes'] for s in sessions) / len([s for s in sessions if s['delay_minutes'] > 0]), 1) if sessions else 0
        },
        'faculty_summary': faculty_summary,
        'evolution': evolution_data,
        'recent_sessions': sorted(sessions, key=lambda x: x['date'], reverse=True)[:20],
        'by_type': [
            {'type': 'CM', 'count': len([s for s in sessions if s['course_type'] == 'CM'])},
            {'type': 'TD', 'count': len([s for s in sessions if s['course_type'] == 'TD'])},
            {'type': 'TP', 'count': len([s for s in sessions if s['course_type'] == 'TP'])}
        ],
        'by_status': [
            {'status': 'Planifié', 'count': len([s for s in sessions if s['status'] == 'planned'])},
            {'status': 'En cours', 'count': len([s for s in sessions if s['status'] == 'in_progress'])},
            {'status': 'Terminé', 'count': len([s for s in sessions if s['status'] == 'completed'])},
            {'status': 'Annulé', 'count': len([s for s in sessions if s['status'] == 'cancelled'])},
            {'status': 'Reporté', 'count': len([s for s in sessions if s['status'] == 'rescheduled'])}
        ]
    }

def build_faculty_view(faculty_name, faculties, sessions, teachers, course_types, period):
    """Vue détaillée d'une faculté"""
    
    faculty = next((f for f in faculties if f['name'] == faculty_name), None)
    if not faculty:
        return {'error': 'Faculté non trouvée'}
    
    faculty_sessions = [s for s in sessions if s['faculty'] == faculty_name]
    
    # Statistiques de la faculté
    total_sessions = len(faculty_sessions)
    total_hours_planned = sum(s['planned_hours'] for s in faculty_sessions)
    total_hours_done = sum(s['actual_hours'] for s in faculty_sessions)
    completion_rate = round(total_hours_done * 100 / total_hours_planned, 1) if total_hours_planned > 0 else 0
    
    # Résumé par programme
    program_summary = []
    for program in faculty['programs']:
        program_sessions = [s for s in faculty_sessions if s['program'] == program['name']]
        if program_sessions:
            prog_hours_planned = sum(s['planned_hours'] for s in program_sessions)
            prog_hours_done = sum(s['actual_hours'] for s in program_sessions)
            prog_completion = round(prog_hours_done * 100 / prog_hours_planned, 1) if prog_hours_planned > 0 else 0
            
            program_summary.append({
                'name': program['name'],
                'levels': program['levels'],
                'sessions': len(program_sessions),
                'hours_planned': round(prog_hours_planned, 1),
                'hours_done': round(prog_hours_done, 1),
                'completion_rate': prog_completion,
                'completion_color': get_completion_color(prog_completion),
                'teachers': len(set(s['teacher_id'] for s in program_sessions))
            })
    
    # Top enseignants de la faculté
    teacher_stats = {}
    for s in faculty_sessions:
        if s['teacher_id'] not in teacher_stats:
            teacher_stats[s['teacher_id']] = {
                'id': s['teacher_id'],
                'name': s['teacher_name'],
                'sessions': 0,
                'hours': 0
            }
        teacher_stats[s['teacher_id']]['sessions'] += 1
        teacher_stats[s['teacher_id']]['hours'] += s['actual_hours']
    
    top_teachers = sorted(teacher_stats.values(), key=lambda x: x['sessions'], reverse=True)[:5]
    
    return {
        'view_level': 'faculty',
        'title': f'Faculté {faculty_name}',
        'faculty': faculty_name,
        'period': period,
        'overview': {
            'total_sessions': total_sessions,
            'total_hours_planned': round(total_hours_planned, 1),
            'total_hours_done': round(total_hours_done, 1),
            'completion_rate': completion_rate,
            'programs_count': len(faculty['programs']),
            'teachers_count': len(set(s['teacher_id'] for s in faculty_sessions)),
            'sessions_completed': len([s for s in faculty_sessions if s['status'] == 'completed']),
            'sessions_cancelled': len([s for s in faculty_sessions if s['status'] == 'cancelled']),
            'avg_attendance': round(sum(s['attendance_rate'] for s in faculty_sessions if s['attendance_rate'] > 0) / len([s for s in faculty_sessions if s['attendance_rate'] > 0]), 1) if faculty_sessions else 0
        },
        'program_summary': program_summary,
        'top_teachers': top_teachers,
        'recent_sessions': sorted(faculty_sessions, key=lambda x: x['date'], reverse=True)[:15],
        'by_level': [
            {'level': level, 'count': len([s for s in faculty_sessions if s['level'] == level])}
            for level in ['L1', 'L2', 'L3', 'M1', 'M2']
            if len([s for s in faculty_sessions if s['level'] == level]) > 0
        ]
    }

def build_program_view(program_name, faculties, sessions, teachers, course_types, period):
    """Vue détaillée d'une filière"""
    
    # Trouver le programme
    program = None
    faculty_name = None
    for faculty in faculties:
        for p in faculty['programs']:
            if p['name'] == program_name:
                program = p
                faculty_name = faculty['name']
                break
        if program:
            break
    
    if not program:
        return {'error': 'Programme non trouvé'}
    
    program_sessions = [s for s in sessions if s['program'] == program_name]
    
    # Statistiques du programme
    total_sessions = len(program_sessions)
    total_hours_planned = sum(s['planned_hours'] for s in program_sessions)
    total_hours_done = sum(s['actual_hours'] for s in program_sessions)
    completion_rate = round(total_hours_done * 100 / total_hours_planned, 1) if total_hours_planned > 0 else 0
    
    # Résumé par niveau
    level_summary = []
    for level in program['levels']:
        level_sessions = [s for s in program_sessions if s['level'] == level]
        if level_sessions:
            level_hours_planned = sum(s['planned_hours'] for s in level_sessions)
            level_hours_done = sum(s['actual_hours'] for s in level_sessions)
            level_completion = round(level_hours_done * 100 / level_hours_planned, 1) if level_hours_planned > 0 else 0
            
            level_summary.append({
                'name': level,
                'sessions': len(level_sessions),
                'hours_planned': round(level_hours_planned, 1),
                'hours_done': round(level_hours_done, 1),
                'completion_rate': level_completion,
                'completion_color': get_completion_color(level_completion),
                'students': random.randint(80, 200),
                'courses': len(set(s['course_code'] for s in level_sessions))
            })
    
    # Résumé par cours
    course_summary = []
    for course in program['courses']:
        course_sessions = [s for s in program_sessions if s['course_code'] == course['code']]
        if course_sessions:
            course_hours_planned = sum(s['planned_hours'] for s in course_sessions)
            course_hours_done = sum(s['actual_hours'] for s in course_sessions)
            course_completion = round(course_hours_done * 100 / course_hours_planned, 1) if course_hours_planned > 0 else 0
            
            course_summary.append({
                'code': course['code'],
                'name': course['name'],
                'type': course['type'],
                'teacher': next((t['name'] for t in teachers if t['id'] == course['teacher']), 'Inconnu'),
                'sessions': len(course_sessions),
                'hours_planned': round(course_hours_planned, 1),
                'hours_done': round(course_hours_done, 1),
                'completion_rate': course_completion,
                'completion_color': get_completion_color(course_completion),
                'avg_attendance': round(sum(s['attendance_rate'] for s in course_sessions if s['attendance_rate'] > 0) / len([s for s in course_sessions if s['attendance_rate'] > 0]), 1) if course_sessions else 0
            })
    
    return {
        'view_level': 'program',
        'title': f'Filière {program_name}',
        'faculty': faculty_name,
        'program': program_name,
        'period': period,
        'overview': {
            'total_sessions': total_sessions,
            'total_hours_planned': round(total_hours_planned, 1),
            'total_hours_done': round(total_hours_done, 1),
            'completion_rate': completion_rate,
            'levels_count': len(program['levels']),
            'courses_count': len(program['courses']),
            'teachers_count': len(set(s['teacher_id'] for s in program_sessions)),
            'sessions_completed': len([s for s in program_sessions if s['status'] == 'completed']),
            'sessions_with_eval': len([s for s in program_sessions if s.get('has_evaluation')]),
            'avg_attendance': round(sum(s['attendance_rate'] for s in program_sessions if s['attendance_rate'] > 0) / len([s for s in program_sessions if s['attendance_rate'] > 0]), 1) if program_sessions else 0
        },
        'level_summary': level_summary,
        'course_summary': course_summary,
        'recent_sessions': sorted(program_sessions, key=lambda x: x['date'], reverse=True)[:15]
    }

def build_level_view(level_name, program_name, faculties, sessions, teachers, course_types, period):
    """Vue détaillée d'un niveau"""
    
    level_sessions = [s for s in sessions if s['program'] == program_name and s['level'] == level_name]
    
    # Statistiques du niveau
    total_sessions = len(level_sessions)
    total_hours_planned = sum(s['planned_hours'] for s in level_sessions)
    total_hours_done = sum(s['actual_hours'] for s in level_sessions)
    completion_rate = round(total_hours_done * 100 / total_hours_planned, 1) if total_hours_planned > 0 else 0
    
    # Résumé par cours
    course_summary = []
    for course_code in set(s['course_code'] for s in level_sessions):
        course_sessions = [s for s in level_sessions if s['course_code'] == course_code]
        course = course_sessions[0]
        
        course_hours_planned = sum(s['planned_hours'] for s in course_sessions)
        course_hours_done = sum(s['actual_hours'] for s in course_sessions)
        course_completion = round(course_hours_done * 100 / course_hours_planned, 1) if course_hours_planned > 0 else 0
        
        course_summary.append({
            'code': course_code,
            'name': course['course_name'],
            'type': course['course_type'],
            'teacher': course['teacher_name'],
            'sessions': len(course_sessions),
            'sessions_completed': len([s for s in course_sessions if s['status'] == 'completed']),
            'sessions_cancelled': len([s for s in course_sessions if s['status'] == 'cancelled']),
            'hours_planned': round(course_hours_planned, 1),
            'hours_done': round(course_hours_done, 1),
            'completion_rate': course_completion,
            'completion_color': get_completion_color(course_completion),
            'avg_attendance': round(sum(s['attendance_rate'] for s in course_sessions if s['attendance_rate'] > 0) / len([s for s in course_sessions if s['attendance_rate'] > 0]), 1) if course_sessions else 0,
            'evaluations': len([s for s in course_sessions if s.get('has_evaluation')])
        })
    
    # Calendrier des sessions
    calendar = {}
    for s in level_sessions:
        if s['date'] not in calendar:
            calendar[s['date']] = []
        calendar[s['date']].append({
            'time': f"{s['start_time']}-{s['end_time']}",
            'course': s['course_name'],
            'type': s['course_type'],
            'teacher': s['teacher_name'],
            'status': s['status'],
            'room': s['room']
        })
    
    return {
        'view_level': 'level',
        'title': f'Niveau {level_name} - {program_name}',
        'faculty': level_sessions[0]['faculty'] if level_sessions else '',
        'program': program_name,
        'level': level_name,
        'period': period,
        'overview': {
            'total_sessions': total_sessions,
            'total_hours_planned': round(total_hours_planned, 1),
            'total_hours_done': round(total_hours_done, 1),
            'completion_rate': completion_rate,
            'courses_count': len(set(s['course_code'] for s in level_sessions)),
            'teachers_count': len(set(s['teacher_id'] for s in level_sessions)),
            'sessions_completed': len([s for s in level_sessions if s['status'] == 'completed']),
            'sessions_cancelled': len([s for s in level_sessions if s['status'] == 'cancelled']),
            'sessions_with_eval': len([s for s in level_sessions if s.get('has_evaluation')]),
            'avg_attendance': round(sum(s['attendance_rate'] for s in level_sessions if s['attendance_rate'] > 0) / len([s for s in level_sessions if s['attendance_rate'] > 0]), 1) if level_sessions else 0,
            'avg_delay': round(sum(s['delay_minutes'] for s in level_sessions) / len([s for s in level_sessions if s['delay_minutes'] > 0]), 1) if level_sessions else 0
        },
        'course_summary': course_summary,
        'calendar': calendar,
        'recent_sessions': sorted(level_sessions, key=lambda x: x['date'], reverse=True)[:20]
    }

def build_course_detail_view(course_code, sessions, teachers, course_statuses):
    """Vue détaillée d'un cours spécifique"""
    
    course_sessions = [s for s in sessions if s['course_code'] == course_code]
    
    if not course_sessions:
        return {'error': 'Cours non trouvé'}
    
    course_info = course_sessions[0]
    
    # Statistiques du cours
    total_sessions = len(course_sessions)
    total_hours_planned = sum(s['planned_hours'] for s in course_sessions)
    total_hours_done = sum(s['actual_hours'] for s in course_sessions)
    completion_rate = round(total_hours_done * 100 / total_hours_planned, 1) if total_hours_planned > 0 else 0
    
    # Sessions par statut
    sessions_completed = [s for s in course_sessions if s['status'] == 'completed']
    sessions_cancelled = [s for s in course_sessions if s['status'] == 'cancelled']
    sessions_rescheduled = [s for s in course_sessions if s['status'] == 'rescheduled']
    sessions_planned = [s for s in course_sessions if s['status'] == 'planned']
    
    # Évolution de l'assiduité
    attendance_evolution = [
        {
            'date': s['date'],
            'rate': s['attendance_rate'],
            'students': s['students_present'],
            'total': s['total_students']
        }
        for s in sorted(course_sessions, key=lambda x: x['date'])
        if s['attendance_rate'] > 0
    ]
    
    # Liste des évaluations
    evaluations = [
        {
            'date': s['date'],
            'type': s['evaluation_type'],
            'attendance': s['attendance_rate']
        }
        for s in course_sessions
        if s.get('has_evaluation')
    ]
    
    return {
        'view_level': 'course',
        'title': f'{course_info["course_code"]} - {course_info["course_name"]}',
        'course': {
            'code': course_info['course_code'],
            'name': course_info['course_name'],
            'type': course_info['course_type'],
            'faculty': course_info['faculty'],
            'program': course_info['program'],
            'level': course_info['level'],
            'teacher': course_info['teacher_name'],
            'teacher_id': course_info['teacher_id']
        },
        'period': 'période sélectionnée',
        'overview': {
            'total_sessions': total_sessions,
            'total_hours_planned': round(total_hours_planned, 1),
            'total_hours_done': round(total_hours_done, 1),
            'completion_rate': completion_rate,
            'sessions_completed': len(sessions_completed),
            'sessions_cancelled': len(sessions_cancelled),
            'sessions_rescheduled': len(sessions_rescheduled),
            'sessions_planned': len(sessions_planned),
            'evaluations_count': len(evaluations),
            'avg_attendance': round(sum(s['attendance_rate'] for s in course_sessions if s['attendance_rate'] > 0) / len([s for s in course_sessions if s['attendance_rate'] > 0]), 1) if course_sessions else 0,
            'avg_delay': round(sum(s['delay_minutes'] for s in course_sessions) / len([s for s in course_sessions if s['delay_minutes'] > 0]), 1) if course_sessions else 0
        },
        'sessions': sorted(course_sessions, key=lambda x: x['date'], reverse=True),
        'attendance_evolution': attendance_evolution,
        'evaluations': evaluations,
        'by_status': [
            {'status': 'Terminé', 'count': len(sessions_completed), 'color': '#28a745'},
            {'status': 'Planifié', 'count': len(sessions_planned), 'color': '#ffc107'},
            {'status': 'Annulé', 'count': len(sessions_cancelled), 'color': '#dc3545'},
            {'status': 'Reporté', 'count': len(sessions_rescheduled), 'color': '#fd7e14'}
        ]
    }

def get_completion_color(rate):
    """Détermine la couleur selon le taux de complétion"""
    if rate >= 90:
        return 'success'
    elif rate >= 75:
        return 'info'
    elif rate >= 50:
        return 'warning'
    else:
        return 'danger'

def get_days_for_period(period):
    """Retourne le nombre de jours pour une période donnée"""
    periods = {
        "semaine": 7,
        "mois": 30,
        "trimestre": 90,
        "annee": 365
    }
    return periods.get(period, 30)

@frappe.whitelist()
def get_filter_options():
    """Options pour les filtres (données d'essai)"""
    
    return {
        "faculties": ["Sciences", "Lettres", "Droit", "Médecine", "Économie"],
        "programs": [
            "Mathématiques", "Physique", "Chimie", "Informatique", "Biologie",
            "Lettres Modernes", "Histoire", "Philosophie", "Anglais",
            "Droit Public", "Droit Privé", "Sciences Économiques"
        ],
        "levels": ["L1", "L2", "L3", "M1", "M2", "Doctorat"],
        "teachers": [
            {"name": "T001", "teacher_name": "Dr. Martin Dupont"},
            {"name": "T002", "teacher_name": "Prof. Sophie Laurent"},
            {"name": "T003", "teacher_name": "Dr. Jean Kouassi"},
            {"name": "T004", "teacher_name": "Mme. Fatima Diallo"},
            {"name": "T005", "teacher_name": "Prof. Marc Zadi"},
            {"name": "T006", "teacher_name": "Dr. Awa Touré"},
            {"name": "T007", "teacher_name": "M. Paul Ekissi"},
            {"name": "T008", "teacher_name": "Dr. Yves N'Guessan"},
            {"name": "T009", "teacher_name": "Prof. Claire Bernard"},
            {"name": "T010", "teacher_name": "Dr. Amadou Koné"}
        ],
        "courses": [
            {"code": "MATH101", "name": "Algèbre 1"},
            {"code": "MATH102", "name": "Analyse 1"},
            {"code": "PHY101", "name": "Mécanique 1"},
            {"code": "INF101", "name": "Algorithmique"},
            {"code": "LET101", "name": "Grammaire"}
        ],
        "periods": [
            {"value": "semaine", "label": "Cette semaine"},
            {"value": "mois", "label": "Ce mois"},
            {"value": "trimestre", "label": "Ce trimestre"},
            {"value": "annee", "label": "Cette année"},
            {"value": "personnalise", "label": "Personnalisé"}
        ]
    }

@frappe.whitelist()
def get_teacher_details(teacher_id):
    """Détails d'un enseignant spécifique (données d'essai)"""
    
    teachers_details = {
        "T001": {
            "name": "Dr. Martin Dupont",
            "department": "Mathématiques",
            "email": "martin.dupont@universite.edu",
            "phone": "+225 07 89 45 67 89",
            "specialty": "Analyse numérique, Équations différentielles",
            "courses": [
                {"code": "MATH201", "name": "Analyse 3", "level": "L2", "hours": 24},
                {"code": "MATH301", "name": "Analyse numérique", "level": "L3", "hours": 30},
                {"code": "MATH401", "name": "Équations aux dérivées partielles", "level": "M1", "hours": 36}
            ],
            "stats": {
                "total_courses": 42,
                "total_hours": 98.5,
                "avg_attendance": 87.5,
                "punctuality": 92
            }
        },
        "T002": {
            "name": "Prof. Sophie Laurent",
            "department": "Physique",
            "email": "sophie.laurent@universite.edu",
            "phone": "+225 05 67 89 12 34",
            "specialty": "Physique quantique, Mécanique statistique",
            "courses": [
                {"code": "PHY202", "name": "Mécanique quantique 1", "level": "L2", "hours": 30},
                {"code": "PHY302", "name": "Physique statistique", "level": "L3", "hours": 30},
                {"code": "PHY403", "name": "Théorie des champs", "level": "M2", "hours": 40}
            ],
            "stats": {
                "total_courses": 38,
                "total_hours": 102.5,
                "avg_attendance": 91.2,
                "punctuality": 95
            }
        }
    }
    
    return teachers_details.get(teacher_id, {
        "name": "Enseignant non trouvé",
        "department": "-",
        "email": "-",
        "phone": "-",
        "specialty": "-",
        "courses": [],
        "stats": {
            "total_courses": 0,
            "total_hours": 0,
            "avg_attendance": 0,
            "punctuality": 0
        }
    })


import frappe
from frappe import _
import json
import random
from datetime import datetime, timedelta
from collections import defaultdict

@frappe.whitelist()
def get_finance_data(filters=None):
    """
    Retourne les données financières pour le dashboard
    """
    if isinstance(filters, str):
        filters = json.loads(filters)
    
    return generate_mock_finance_data(filters)

def generate_mock_finance_data(filters=None):
    """Génère des données financières mock détaillées"""
    
    # Grille des taux horaires par grade (FCFA)
    grade_rates = {
        'Doctorant': {'min': 5000, 'max': 7000, 'base': 6000},
        'Assistant': {'min': 7000, 'max': 9000, 'base': 8000},
        'Maître-Assistant': {'min': 9000, 'max': 11000, 'base': 10000},
        'Maître de Conférences': {'min': 11000, 'max': 13000, 'base': 12000},
        'Professeur': {'min': 13000, 'max': 15000, 'base': 14000}
    }
    
    # Enseignants avec leurs grades
    teachers = [
        {"id": "T001", "name": "Dr. Martin Dupont", "grade": "Maître de Conférences", "taux_horaire": 12000, "iban": "FR76 1234 5678 9012 3456 7890 123", "status": "Actif"},
        {"id": "T002", "name": "Prof. Sophie Laurent", "grade": "Professeur", "taux_horaire": 14500, "iban": "FR76 2345 6789 0123 4567 8901 234", "status": "Actif"},
        {"id": "T003", "name": "Dr. Jean Kouassi", "grade": "Maître-Assistant", "taux_horaire": 10500, "iban": "FR76 3456 7890 1234 5678 9012 345", "status": "Actif"},
        {"id": "T004", "name": "Mme. Fatima Diallo", "grade": "Assistant", "taux_horaire": 8500, "iban": "FR76 4567 8901 2345 6789 0123 456", "status": "Actif"},
        {"id": "T005", "name": "Prof. Marc Zadi", "grade": "Professeur", "taux_horaire": 15000, "iban": "FR76 5678 9012 3456 7890 1234 567", "status": "Actif"},
        {"id": "T006", "name": "Dr. Awa Touré", "grade": "Maître-Assistant", "taux_horaire": 9800, "iban": "FR76 6789 0123 4567 8901 2345 678", "status": "Actif"},
        {"id": "T007", "name": "M. Paul Ekissi", "grade": "Doctorant", "taux_horaire": 6500, "iban": "FR76 7890 1234 5678 9012 3456 789", "status": "Actif"},
        {"id": "T008", "name": "Dr. Yves N'Guessan", "grade": "Maître de Conférences", "taux_horaire": 12500, "iban": "FR76 8901 2345 6789 0123 4567 890", "status": "Inactif"},
        {"id": "T009", "name": "Prof. Claire Bernard", "grade": "Professeur", "taux_horaire": 14000, "iban": "FR76 9012 3456 7890 1234 5678 901", "status": "Actif"},
        {"id": "T010", "name": "Dr. Amadou Koné", "grade": "Maître-Assistant", "taux_horaire": 10200, "iban": "FR76 0123 4567 8901 2345 6789 012", "status": "Actif"}
    ]
    
    # Facultés, filières et niveaux
    faculties = [
        {
            "name": "Sciences",
            "programs": [
                {
                    "name": "Mathématiques",
                    "levels": ["L1", "L2", "L3", "M1", "M2"],
                    "courses": [
                        {"code": "MATH101", "name": "Algèbre 1", "hours": 45, "type": "CM", "semestre": "S1"},
                        {"code": "MATH102", "name": "Analyse 1", "hours": 45, "type": "CM", "semestre": "S1"},
                        {"code": "MATH103", "name": "Algèbre 2", "hours": 45, "type": "CM", "semestre": "S2"},
                        {"code": "MATH201", "name": "Analyse 2", "hours": 45, "type": "CM", "semestre": "S1"},
                        {"code": "MATH202", "name": "Géométrie", "hours": 30, "type": "CM", "semestre": "S2"},
                        {"code": "TD-MATH101", "name": "TD Algèbre 1", "hours": 22, "type": "TD", "semestre": "S1"},
                        {"code": "TD-MATH102", "name": "TD Analyse 1", "hours": 22, "type": "TD", "semestre": "S1"}
                    ]
                },
                {
                    "name": "Physique",
                    "levels": ["L1", "L2", "L3", "M1", "M2"],
                    "courses": [
                        {"code": "PHY101", "name": "Mécanique 1", "hours": 45, "type": "CM", "semestre": "S1"},
                        {"code": "PHY102", "name": "Électricité", "hours": 45, "type": "CM", "semestre": "S1"},
                        {"code": "PHY201", "name": "Thermodynamique", "hours": 45, "type": "CM", "semestre": "S2"},
                        {"code": "TD-PHY101", "name": "TD Mécanique", "hours": 22, "type": "TD", "semestre": "S1"},
                        {"code": "TP-PHY101", "name": "TP Physique", "hours": 24, "type": "TP", "semestre": "S2"}
                    ]
                },
                {
                    "name": "Informatique",
                    "levels": ["L1", "L2", "L3", "M1", "M2"],
                    "courses": [
                        {"code": "INF101", "name": "Algorithmique", "hours": 45, "type": "CM", "semestre": "S1"},
                        {"code": "INF102", "name": "Programmation C", "hours": 45, "type": "CM", "semestre": "S1"},
                        {"code": "INF201", "name": "Bases de données", "hours": 45, "type": "CM", "semestre": "S2"},
                        {"code": "TP-INF101", "name": "TP Programmation", "hours": 30, "type": "TP", "semestre": "S2"}
                    ]
                }
            ]
        },
        {
            "name": "Lettres",
            "programs": [
                {
                    "name": "Lettres Modernes",
                    "levels": ["L1", "L2", "L3", "M1", "M2"],
                    "courses": [
                        {"code": "LET101", "name": "Grammaire", "hours": 30, "type": "CM", "semestre": "S1"},
                        {"code": "LET102", "name": "Littérature française", "hours": 45, "type": "CM", "semestre": "S1"},
                        {"code": "LET201", "name": "Littérature comparée", "hours": 45, "type": "CM", "semestre": "S2"},
                        {"code": "TD-LET101", "name": "TD Expression", "hours": 22, "type": "TD", "semestre": "S2"}
                    ]
                },
                {
                    "name": "Histoire",
                    "levels": ["L1", "L2", "L3", "M1", "M2"],
                    "courses": [
                        {"code": "HIS101", "name": "Histoire ancienne", "hours": 30, "type": "CM", "semestre": "S1"},
                        {"code": "HIS102", "name": "Histoire médiévale", "hours": 30, "type": "CM", "semestre": "S1"},
                        {"code": "HIS201", "name": "Histoire moderne", "hours": 30, "type": "CM", "semestre": "S2"}
                    ]
                }
            ]
        }
    ]
    
    # Mois de l'année académique
    months = [
        {"name": "Septembre", "year": 2025, "days": 30},
        {"name": "Octobre", "year": 2025, "days": 31},
        {"name": "Novembre", "year": 2025, "days": 30},
        {"name": "Décembre", "year": 2025, "days": 31},
        {"name": "Janvier", "year": 2026, "days": 31},
        {"name": "Février", "year": 2026, "days": 28},
        {"name": "Mars", "year": 2026, "days": 31},
        {"name": "Avril", "year": 2026, "days": 30},
        {"name": "Mai", "year": 2026, "days": 31},
        {"name": "Juin", "year": 2026, "days": 30}
    ]
    
    # Générer les sessions de cours et les paiements
    all_sessions = []
    teacher_monthly_hours = defaultdict(lambda: defaultdict(float))
    teacher_monthly_payments = defaultdict(lambda: defaultdict(float))
    
    # Période de filtrage
    period = filters.get('period', 'mois') if filters else 'mois'
    
    for faculty in faculties:
        for program in faculty["programs"]:
            for level in program["levels"]:
                for course in program["courses"]:
                    # Assigner un enseignant aléatoire au cours
                    teacher = random.choice([t for t in teachers if t['status'] == 'Actif'])
                    
                    # Déterminer le semestre
                    semestre = course.get("semestre", random.choice(["S1", "S2"]))
                    
                    # Mois concernés par le semestre
                    if semestre == "S1":
                        concerned_months = months[:5]  # Sept à Jan
                    else:
                        concerned_months = months[5:]   # Fév à Juin
                    
                    # Générer des sessions pour chaque mois
                    for month_idx, month in enumerate(concerned_months):
                        # Nombre de sessions dans le mois (1-4 selon le type)
                        if course["type"] == "CM":
                            num_sessions = random.randint(2, 4)
                        elif course["type"] == "TD":
                            num_sessions = random.randint(3, 5)
                        else:  # TP
                            num_sessions = random.randint(2, 3)
                        
                        for session_num in range(num_sessions):
                            # Date de la session (dans le mois)
                            day = random.randint(1, month["days"])
                            date = datetime(month["year"], months.index(month)+9 if month["year"] == 2025 else months.index(month)-3, day)
                            
                            # Heures de la session
                            if course["type"] == "CM":
                                hours = 2.0
                            elif course["type"] == "TD":
                                hours = 1.5
                            else:
                                hours = 2.5
                            
                            # Statut de la session (affecte le paiement)
                            status_weights = [0.85, 0.10, 0.05]  # effectué, annulé, reporté
                            status = random.choices(["effectué", "annulé", "reporté"], weights=status_weights)[0]
                            
                            # Calcul du montant (seulement si effectué)
                            montant = 0
                            if status == "effectué":
                                montant = hours * teacher["taux_horaire"]
                                teacher_monthly_hours[teacher["id"]][month["name"]] += hours
                                teacher_monthly_payments[teacher["id"]][month["name"]] += montant
                            
                            session = {
                                "id": f"SESS{len(all_sessions)+1:04d}",
                                "date": date.strftime("%Y-%m-%d"),
                                "faculty": faculty["name"],
                                "program": program["name"],
                                "level": level,
                                "course_code": course["code"],
                                "course_name": course["name"],
                                "course_type": course["type"],
                                "semestre": semestre,
                                "teacher_id": teacher["id"],
                                "teacher_name": teacher["name"],
                                "teacher_grade": teacher["grade"],
                                "taux_horaire": teacher["taux_horaire"],
                                "hours_planned": hours,
                                "hours_actual": hours if status == "effectué" else 0,
                                "status": status,
                                "montant": montant,
                                "month": month["name"],
                                "year": month["year"]
                            }
                            all_sessions.append(session)
    
    # Filtrer selon les critères
    filtered_sessions = filter_sessions(all_sessions, filters)
    
    # Construire la réponse selon le niveau de vue
    view_level = filters.get('view_level', 'global') if filters else 'global'
    
    if view_level == 'global':
        response = build_global_finance_view(filtered_sessions, teachers, months)
    elif view_level == 'faculty' and filters.get('faculty'):
        response = build_faculty_finance_view(filters['faculty'], filtered_sessions, teachers, months)
    elif view_level == 'program' and filters.get('program'):
        response = build_program_finance_view(filters['program'], filtered_sessions, teachers, months)
    elif view_level == 'level' and filters.get('level'):
        response = build_level_finance_view(filters['level'], filtered_sessions, teachers, months)
    elif view_level == 'teacher' and filters.get('teacher'):
        response = build_teacher_finance_view(filters['teacher'], filtered_sessions, teachers)
    else:
        response = build_global_finance_view(filtered_sessions, teachers, months)
    
    # Ajouter les métadonnées
    response['debug_info'] = {
        "total_sessions": len(filtered_sessions),
        "period": filters.get('period', 'mois'),
        "view_level": view_level
    }
    
    return response

def filter_sessions(sessions, filters):
    """Filtre les sessions selon les critères"""
    if not filters:
        return sessions
    
    filtered = sessions.copy()
    
    if filters.get('faculty'):
        filtered = [s for s in filtered if s['faculty'] == filters['faculty']]
    
    if filters.get('program'):
        filtered = [s for s in filtered if s['program'] == filters['program']]
    
    if filters.get('level'):
        filtered = [s for s in filtered if s['level'] == filters['level']]
    
    if filters.get('teacher'):
        filtered = [s for s in filtered if s['teacher_id'] == filters['teacher']]
    
    if filters.get('month'):
        filtered = [s for s in filtered if s['month'] == filters['month']]
    
    if filters.get('semestre'):
        filtered = [s for s in filtered if s['semestre'] == filters['semestre']]
    
    return filtered

def build_global_finance_view(sessions, teachers, months):
    """Vue financière globale"""
    
    # Calculs globaux
    total_hours = sum(s['hours_actual'] for s in sessions)
    total_paid = sum(s['montant'] for s in sessions)
    total_sessions = len(sessions)
    sessions_effectuees = len([s for s in sessions if s['status'] == 'effectué'])
    sessions_annulees = len([s for s in sessions if s['status'] == 'annulé'])
    
    # Par faculté
    faculty_summary = {}
    for s in sessions:
        if s['faculty'] not in faculty_summary:
            faculty_summary[s['faculty']] = {
                'name': s['faculty'],
                'hours': 0,
                'amount': 0,
                'teachers': set(),
                'programs': set(),
                'sessions': 0
            }
        faculty_summary[s['faculty']]['hours'] += s['hours_actual']
        faculty_summary[s['faculty']]['amount'] += s['montant']
        faculty_summary[s['faculty']]['teachers'].add(s['teacher_id'])
        faculty_summary[s['faculty']]['programs'].add(s['program'])
        faculty_summary[s['faculty']]['sessions'] += 1
    
    # Par grade
    grade_summary = {}
    for s in sessions:
        grade = s['teacher_grade']
        if grade not in grade_summary:
            grade_summary[grade] = {
                'grade': grade,
                'hours': 0,
                'amount': 0,
                'teachers': set(),
                'sessions': 0
            }
        grade_summary[grade]['hours'] += s['hours_actual']
        grade_summary[grade]['amount'] += s['montant']
        grade_summary[grade]['teachers'].add(s['teacher_id'])
        grade_summary[grade]['sessions'] += 1
    
    # Évolution mensuelle
    monthly_evolution = []
    for month in months:
        month_sessions = [s for s in sessions if s['month'] == month['name']]
        month_hours = sum(s['hours_actual'] for s in month_sessions)
        month_amount = sum(s['montant'] for s in month_sessions)
        
        monthly_evolution.append({
            'month': month['name'],
            'year': month['year'],
            'hours': round(month_hours, 1),
            'amount': round(month_amount),
            'sessions': len(month_sessions)
        })
    
    # Top enseignants
    teacher_totals = defaultdict(lambda: {'hours': 0, 'amount': 0, 'sessions': 0})
    for s in sessions:
        teacher_totals[s['teacher_id']]['hours'] += s['hours_actual']
        teacher_totals[s['teacher_id']]['amount'] += s['montant']
        teacher_totals[s['teacher_id']]['sessions'] += 1
    
    top_teachers = []
    for teacher_id, stats in teacher_totals.items():
        teacher = next((t for t in teachers if t['id'] == teacher_id), None)
        if teacher:
            top_teachers.append({
                'id': teacher_id,
                'name': teacher['name'],
                'grade': teacher['grade'],
                'hours': round(stats['hours'], 1),
                'amount': round(stats['amount']),
                'sessions': stats['sessions']
            })
    
    top_teachers = sorted(top_teachers, key=lambda x: x['amount'], reverse=True)[:5]
    
    return {
        'view_level': 'global',
        'title': 'Tableau de bord financier global',
        'period': 'mois', #filters.get('period', 'mois') if filters else 'mois',
        'overview': {
            'total_hours': round(total_hours, 1),
            'total_paid': round(total_paid),
            'total_sessions': total_sessions,
            'sessions_effectuees': sessions_effectuees,
            'sessions_annulees': sessions_annulees,
            'avg_hourly_rate': round(total_paid / total_hours) if total_hours > 0 else 0,
            'active_teachers': len(set(s['teacher_id'] for s in sessions)),
            'completion_rate': round(sessions_effectuees * 100 / total_sessions) if total_sessions > 0 else 0
        },
        'faculty_summary': list(faculty_summary.values()),
        'grade_summary': list(grade_summary.values()),
        'monthly_evolution': monthly_evolution,
        'top_teachers': top_teachers,
        'recent_transactions': sorted(
            [s for s in sessions if s['montant'] > 0],
            key=lambda x: x['date'],
            reverse=True
        )[:20]
    }

def build_faculty_finance_view(faculty_name, sessions, teachers, months):
    """Vue financière par faculté"""
    
    faculty_sessions = [s for s in sessions if s['faculty'] == faculty_name]
    
    # Calculs pour la faculté
    total_hours = sum(s['hours_actual'] for s in faculty_sessions)
    total_paid = sum(s['montant'] for s in faculty_sessions)
    total_sessions = len(faculty_sessions)
    
    # Par programme
    program_summary = {}
    for s in faculty_sessions:
        if s['program'] not in program_summary:
            program_summary[s['program']] = {
                'name': s['program'],
                'hours': 0,
                'amount': 0,
                'teachers': set(),
                'levels': set(),
                'sessions': 0
            }
        program_summary[s['program']]['hours'] += s['hours_actual']
        program_summary[s['program']]['amount'] += s['montant']
        program_summary[s['program']]['teachers'].add(s['teacher_id'])
        program_summary[s['program']]['levels'].add(s['level'])
        program_summary[s['program']]['sessions'] += 1
    
    # Par niveau
    level_summary = {}
    for s in faculty_sessions:
        if s['level'] not in level_summary:
            level_summary[s['level']] = {
                'level': s['level'],
                'hours': 0,
                'amount': 0,
                'teachers': set(),
                'programs': set(),
                'sessions': 0
            }
        level_summary[s['level']]['hours'] += s['hours_actual']
        level_summary[s['level']]['amount'] += s['montant']
        level_summary[s['level']]['teachers'].add(s['teacher_id'])
        level_summary[s['level']]['programs'].add(s['program'])
        level_summary[s['level']]['sessions'] += 1
    
    # Par type de cours
    type_summary = {}
    for s in faculty_sessions:
        if s['course_type'] not in type_summary:
            type_summary[s['course_type']] = {
                'type': s['course_type'],
                'hours': 0,
                'amount': 0,
                'sessions': 0
            }
        type_summary[s['course_type']]['hours'] += s['hours_actual']
        type_summary[s['course_type']]['amount'] += s['montant']
        type_summary[s['course_type']]['sessions'] += 1
    
    return {
        'view_level': 'faculty',
        'title': f'Faculté {faculty_name}',
        'faculty': faculty_name,
        'overview': {
            'total_hours': round(total_hours, 1),
            'total_paid': round(total_paid),
            'total_sessions': total_sessions,
            'programs_count': len(program_summary),
            'teachers_count': len(set(s['teacher_id'] for s in faculty_sessions)),
            'avg_hourly_rate': round(total_paid / total_hours) if total_hours > 0 else 0
        },
        'program_summary': list(program_summary.values()),
        'level_summary': list(level_summary.values()),
        'type_summary': list(type_summary.values()),
        'recent_transactions': sorted(
            [s for s in faculty_sessions if s['montant'] > 0],
            key=lambda x: x['date'],
            reverse=True
        )[:15]
    }

def build_program_finance_view(program_name, sessions, teachers, months):
    """Vue financière par programme"""
    
    program_sessions = [s for s in sessions if s['program'] == program_name]
    
    total_hours = sum(s['hours_actual'] for s in program_sessions)
    total_paid = sum(s['montant'] for s in program_sessions)
    
    # Par niveau
    level_summary = {}
    for s in program_sessions:
        if s['level'] not in level_summary:
            level_summary[s['level']] = {
                'level': s['level'],
                'hours': 0,
                'amount': 0,
                'teachers': set(),
                'courses': set(),
                'sessions': 0
            }
        level_summary[s['level']]['hours'] += s['hours_actual']
        level_summary[s['level']]['amount'] += s['montant']
        level_summary[s['level']]['teachers'].add(s['teacher_id'])
        level_summary[s['level']]['courses'].add(s['course_code'])
        level_summary[s['level']]['sessions'] += 1
    
    # Par cours
    course_summary = {}
    for s in program_sessions:
        if s['course_code'] not in course_summary:
            course_summary[s['course_code']] = {
                'code': s['course_code'],
                'name': s['course_name'],
                'type': s['course_type'],
                'hours': 0,
                'amount': 0,
                'teacher': s['teacher_name'],
                'teacher_grade': s['teacher_grade'],
                'taux_horaire': s['taux_horaire'],
                'sessions': 0
            }
        course_summary[s['course_code']]['hours'] += s['hours_actual']
        course_summary[s['course_code']]['amount'] += s['montant']
        course_summary[s['course_code']]['sessions'] += 1
    
    # Par enseignant
    teacher_summary = {}
    for s in program_sessions:
        if s['teacher_id'] not in teacher_summary:
            teacher_summary[s['teacher_id']] = {
                'id': s['teacher_id'],
                'name': s['teacher_name'],
                'grade': s['teacher_grade'],
                'taux_horaire': s['taux_horaire'],
                'hours': 0,
                'amount': 0,
                'sessions': 0
            }
        teacher_summary[s['teacher_id']]['hours'] += s['hours_actual']
        teacher_summary[s['teacher_id']]['amount'] += s['montant']
        teacher_summary[s['teacher_id']]['sessions'] += 1
    
    return {
        'view_level': 'program',
        'title': f'Programme {program_name}',
        'faculty': program_sessions[0]['faculty'] if program_sessions else '',
        'program': program_name,
        'overview': {
            'total_hours': round(total_hours, 1),
            'total_paid': round(total_paid),
            'total_sessions': len(program_sessions),
            'levels_count': len(level_summary),
            'courses_count': len(course_summary),
            'teachers_count': len(teacher_summary),
            'avg_hourly_rate': round(total_paid / total_hours) if total_hours > 0 else 0
        },
        'level_summary': list(level_summary.values()),
        'course_summary': list(course_summary.values()),
        'teacher_summary': list(teacher_summary.values()),
        'recent_transactions': sorted(
            [s for s in program_sessions if s['montant'] > 0],
            key=lambda x: x['date'],
            reverse=True
        )[:15]
    }

def build_level_finance_view(level_name, sessions, teachers, months):
    """Vue financière par niveau"""
    
    level_sessions = [s for s in sessions if s['level'] == level_name]
    
    total_hours = sum(s['hours_actual'] for s in level_sessions)
    total_paid = sum(s['montant'] for s in level_sessions)
    
    # Par cours
    course_summary = {}
    for s in level_sessions:
        if s['course_code'] not in course_summary:
            course_summary[s['course_code']] = {
                'code': s['course_code'],
                'name': s['course_name'],
                'type': s['course_type'],
                'hours': 0,
                'amount': 0,
                'teacher': s['teacher_name'],
                'sessions': 0
            }
        course_summary[s['course_code']]['hours'] += s['hours_actual']
        course_summary[s['course_code']]['amount'] += s['montant']
        course_summary[s['course_code']]['sessions'] += 1
    
    return {
        'view_level': 'level',
        'title': f'Niveau {level_name}',
        'faculty': level_sessions[0]['faculty'] if level_sessions else '',
        'program': level_sessions[0]['program'] if level_sessions else '',
        'level': level_name,
        'overview': {
            'total_hours': round(total_hours, 1),
            'total_paid': round(total_paid),
            'total_sessions': len(level_sessions),
            'courses_count': len(course_summary),
            'teachers_count': len(set(s['teacher_id'] for s in level_sessions)),
            'avg_hourly_rate': round(total_paid / total_hours) if total_hours > 0 else 0
        },
        'course_summary': list(course_summary.values()),
        'recent_transactions': sorted(
            [s for s in level_sessions if s['montant'] > 0],
            key=lambda x: x['date'],
            reverse=True
        )[:15]
    }

def build_teacher_finance_view(teacher_id, sessions, teachers):
    """Vue financière détaillée d'un enseignant"""
    
    teacher_sessions = [s for s in sessions if s['teacher_id'] == teacher_id]
    teacher = next((t for t in teachers if t['id'] == teacher_id), None)
    
    if not teacher or not teacher_sessions:
        return {'error': 'Enseignant non trouvé'}
    
    # Calculs par mois
    monthly_summary = {}
    for s in teacher_sessions:
        key = f"{s['month']} {s['year']}"
        if key not in monthly_summary:
            monthly_summary[key] = {
                'month': s['month'],
                'year': s['year'],
                'hours': 0,
                'amount': 0,
                'sessions': 0
            }
        monthly_summary[key]['hours'] += s['hours_actual']
        monthly_summary[key]['amount'] += s['montant']
        monthly_summary[key]['sessions'] += 1
    
    # Par cours
    course_summary = {}
    for s in teacher_sessions:
        if s['course_code'] not in course_summary:
            course_summary[s['course_code']] = {
                'code': s['course_code'],
                'name': s['course_name'],
                'type': s['course_type'],
                'faculty': s['faculty'],
                'program': s['program'],
                'level': s['level'],
                'hours': 0,
                'amount': 0,
                'sessions': 0
            }
        course_summary[s['course_code']]['hours'] += s['hours_actual']
        course_summary[s['course_code']]['amount'] += s['montant']
        course_summary[s['course_code']]['sessions'] += 1
    
    total_hours = sum(s['hours_actual'] for s in teacher_sessions)
    total_paid = sum(s['montant'] for s in teacher_sessions)
    
    return {
        'view_level': 'teacher',
        'title': f'Enseignant {teacher["name"]}',
        'teacher': {
            'id': teacher['id'],
            'name': teacher['name'],
            'grade': teacher['grade'],
            'taux_horaire': teacher['taux_horaire'],
            'iban': teacher['iban'],
            'status': teacher['status']
        },
        'overview': {
            'total_hours': round(total_hours, 1),
            'total_paid': round(total_paid),
            'total_sessions': len(teacher_sessions),
            'sessions_effectuees': len([s for s in teacher_sessions if s['status'] == 'effectué']),
            'sessions_annulees': len([s for s in teacher_sessions if s['status'] == 'annulé']),
            'avg_monthly': round(total_paid / len(monthly_summary)) if monthly_summary else 0,
            'avg_hourly': round(total_paid / total_hours) if total_hours > 0 else teacher['taux_horaire']
        },
        'monthly_summary': list(monthly_summary.values()),
        'course_summary': list(course_summary.values()),
        'recent_transactions': sorted(
            [s for s in teacher_sessions if s['montant'] > 0],
            key=lambda x: x['date'],
            reverse=True
        )[:20]
    }

@frappe.whitelist()
def get_filter_options():
    """Options pour les filtres"""
    
    return {
        "faculties": ["Sciences", "Lettres", "Droit", "Médecine", "Économie"],
        "programs": [
            "Mathématiques", "Physique", "Informatique", "Chimie", "Biologie",
            "Lettres Modernes", "Histoire", "Philosophie", "Anglais",
            "Droit Public", "Droit Privé", "Sciences Économiques"
        ],
        "levels": ["L1", "L2", "L3", "M1", "M2"],
        "semestres": ["S1", "S2"],
        "months": [
            "Septembre", "Octobre", "Novembre", "Décembre",
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin"
        ],
        "grades": [
            "Doctorant", "Assistant", "Maître-Assistant",
            "Maître de Conférences", "Professeur"
        ],
        "teachers": [
            {"id": "T001", "name": "Dr. Martin Dupont", "grade": "Maître de Conférences"},
            {"id": "T002", "name": "Prof. Sophie Laurent", "grade": "Professeur"},
            {"id": "T003", "name": "Dr. Jean Kouassi", "grade": "Maître-Assistant"},
            {"id": "T004", "name": "Mme. Fatima Diallo", "grade": "Assistant"},
            {"id": "T005", "name": "Prof. Marc Zadi", "grade": "Professeur"},
            {"id": "T006", "name": "Dr. Awa Touré", "grade": "Maître-Assistant"},
            {"id": "T007", "name": "M. Paul Ekissi", "grade": "Doctorant"},
            {"id": "T008", "name": "Dr. Yves N'Guessan", "grade": "Maître de Conférences"},
            {"id": "T009", "name": "Prof. Claire Bernard", "grade": "Professeur"},
            {"id": "T010", "name": "Dr. Amadou Koné", "grade": "Maître-Assistant"}
        ],
        "periods": [
            {"value": "mois", "label": "Ce mois"},
            {"value": "trimestre", "label": "Ce trimestre"},
            {"value": "semestre", "label": "Ce semestre"},
            {"value": "annee", "label": "Cette année"},
            {"value": "personnalise", "label": "Personnalisé"}
        ]
    }