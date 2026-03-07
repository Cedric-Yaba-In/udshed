window.Udshed = window.Udshed || {};
window.Udshed.TeachingGrid = window.Udshed.TeachingGrid || {};

window.Udshed.TeachingGrid.Dialog = {
    
    
// Ouvrir le dialogue d'assignation des enseignants
open_teacher_assignment_dialog(courseDocName, courseCode, rowIndex, colIndex) {
    
    // Créer un dialogue avec un grid lié au child table de votre doctype
    var dialog = new frappe.ui.Dialog({
        title: __('Gestion des enseignants - {0}', [courseCode]),
        size: 'large',
        fields: [
            {
                fieldtype: 'HTML',
                fieldname: 'info_html',
                options: `<div class="alert alert-info">
                    <i class="fa fa-info-circle"></i> 
                    Gérez les enseignants assignés à ce cours. Les modifications sont automatiquement sauvegardées.
                </div>`
            },
            {
                fieldtype: 'Section Break'
            },
            {
                fieldtype: 'Table',
                fieldname: 'teachers',
                label: __('Enseignants'),
                // Lien direct vers votre child table doctype
                options: 'Course Teacher Item', // Remplacez par le nom de votre child table
                description: 'Liste des enseignants pour ce cours',
                fields: [
                    {
                        fieldtype: 'Link',
                        fieldname: 'teacher',
                        label: 'Enseignant',
                        options: 'Teacher', // Votre doctype enseignant
                        in_list_view: 1,
                        reqd: 1,
                        columns: 4
                    },
                    {
                        fieldtype: 'Select',
                        fieldname: 'type_de_cours',
                        label: 'Type',
                        options: ['CM', 'TD', 'TP', 'TPE'],
                        default: 'CM',
                        in_list_view: 1,
                        columns: 3
                    }
                ],
                get_data: function() {
                    return new Promise(resolve => {
                        Udshed.TeachingGrid.load_doctype_list({
                                doctype: 'Teaching Unit', // Votre doctype principal
                                name: courseDocName
                            },
                            (data)=>{
                                resolve(data)
                            }
                        )
                    });
                }
            },
            {
                fieldtype: 'Section Break'
            },
            {
                fieldtype: 'HTML',
                fieldname: 'preview_html',
                options: '<div class="teacher-hours-preview">Prévisualisation de la répartition des heures</div>'
            }
        ],
        primary_action_label: __('Fermer'),
        primary_action: function() {
            dialog.hide();
        }
    });
    
    // Charger les données du cours pour la prévisualisation
    me.load_course_data_for_preview(courseDocName, dialog);
    
    // Mettre à jour la prévisualisation quand le grid change
    $(dialog.fields_dict.teachers.grid.wrapper).on('change', 'select, input', function() {
        me.update_teacher_preview_from_grid(courseDocName, dialog);
    });
    
    dialog.show();
},

// Mettre à jour la prévisualisation
update_teacher_preview(courseDoc, dialog) {
    var html = '<h5>Répartition des heures par enseignant</h5>';
    
    if (!courseDoc.teachers || courseDoc.teachers.length === 0) {
        html += '<p class="text-muted">Aucun enseignant assigné</p>';
        dialog.fields_dict.preview_html.$wrapper.html(html);
        return;
    }
    
    // Calculer la distribution des heures
    var distribution = {};
    var totalHours = (courseDoc.cm_hours || 0) + (courseDoc.td_hours || 0) + 
                     (courseDoc.tp_hours || 0) + (courseDoc.tpe_hours || 0);
    
    var hourTypes = {
        'CM': courseDoc.cm_hours || 0,
        'TD': courseDoc.td_hours || 0,
        'TP': courseDoc.tp_hours || 0,
        'TPE': courseDoc.tpe_hours || 0
    };
    
    // Pour chaque assignation, calculer les heures
    courseDoc.teachers.forEach(function(assignment) {
        if (!distribution[assignment.teacher]) {
            distribution[assignment.teacher] = {
                name: assignment.teacher,
                full_name: assignment.teacher, // À améliorer avec le vrai nom
                hours: 0,
                details: []
            };
        }
        
        if (assignment.assignment_type === 'Tous') {
            var allHours = totalHours;
            distribution[assignment.teacher].hours += allHours;
            distribution[assignment.teacher].details.push({
                type: 'Tous',
                hours: allHours
            });
        } else if (hourTypes[assignment.assignment_type]) {
            var typeHours = hourTypes[assignment.assignment_type];
            var assignedHours = typeHours * (assignment.hours_percentage / 100);
            distribution[assignment.teacher].hours += assignedHours;
            distribution[assignment.teacher].details.push({
                type: assignment.assignment_type,
                hours: assignedHours,
                percentage: assignment.hours_percentage
            });
        }
    });
    
    // Construire le tableau HTML
    html += '<table class="table table-bordered table-sm">';
    html += '<thead><tr><th>Enseignant</th><th>Type</th><th>Heures</th></tr></thead>';
    html += '<tbody>';
    
    for (var teacher in distribution) {
        var t = distribution[teacher];
        var rowspan = t.details.length;
        var first = true;
        
        t.details.forEach(function(detail) {
            html += '<tr>';
            if (first) {
                html += `<td rowspan="${rowspan}"><strong>${t.full_name}</strong></td>`;
                first = false;
            }
            html += `<td>${detail.type} ${detail.percentage ? '(' + detail.percentage + '%)' : ''}</td>`;
            html += `<td>${detail.hours.toFixed(1)}h</td>`;
            html += '</tr>';
        });
    }
    
    html += '</tbody>';
    html += `<tfoot><tr><th colspan="2">Total</th><th>${totalHours}h</th></tr></tfoot>`;
    html += '</table>';
    
    dialog.fields_dict.preview_html.$wrapper.html(html);
},

// Mettre à jour la prévisualisation à partir du grid
update_teacher_preview_from_grid(courseDocName, dialog) {
    var me = this;
    
    // Récupérer les données du grid
    var gridData = dialog.fields_dict.teachers.grid.get_data();
    
    // Créer un objet cours temporaire avec les données du grid
    Udshed.TeachingGrid.UtilsQueries.load_doctype_list(
        {
            doctype: 'Course',
            name: courseDocName
        },
        (data)=>{
            if(data){
                var tempDoc = r.message;
                tempDoc.teachers = gridData;
                me.update_teacher_preview(tempDoc, dialog);
            }
        }
    )
},
   	 
show_import_dialog(filters,onAfterImported= (data)=>{}) {
    
    var d = new frappe.ui.Dialog({
        title: __('Importer une grille'),
        freeze: true,
        freeze_message: __("Importation de la grille en cours..."),  
        size: 'medium',
        fields: [
            {
                fieldtype: 'HTML',
                fieldname: 'template_info',
                options: `
                    <div class="alert alert-primary" style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <i class="fa fa-download"></i> 
                            <strong>Téléchargez d'abord le template</strong> pour vous assurer que votre fichier est au bon format.
                        </div>
                        <button class="btn btn-sm btn-default download-template-btn">
                            <i class="fa fa-file-excel-o"></i> Télécharger le template
                        </button>
                    </div>
                `
            },
            {
                fieldtype: 'Section Break'
            },

            {
                fieldtype: 'Attach',
                fieldname: 'file',
                label: __('Fichier Excel'),
                reqd: 1,
                description: 'Format .xlsx ou .xls'
            },
            {
                fieldtype: 'HTML',
                fieldname: 'instructions',
                options: `
                    <div class="well" style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px;">
                        <h6><i class="fa fa-info-circle"></i> Instructions :</h6>
                        <ul class="small" style="margin-bottom: 0; padding-left: 20px;">
                            <li>Le fichier doit suivre exactement le format du template</li>
                            <li>Les lignes UE doivent avoir un code dans la première colonne</li>
                            <li>Les lignes cours doivent avoir un code dans la deuxième colonne</li>
                            <li>Les informations sur l'année académique, le niveau et le semestre ne doivent pas être renseignées</li>
                            <li>Ne modifiez pas la structure des colonnes</li>
                        </ul>
                    </div>
                `
            }
        ],
        primary_action_label: __('Importer'),
        primary_action(values) {
            
            // Afficher le chargement
            d.set_primary_action(__('Import en cours...'), null, 'btn-primary disabled');
            d.fields_dict.file.$wrapper.hide();

            d.hide();
            Udshed.TeachingGrid.UtilsQueries.import_grid({
                    file_url: values.file,
                    ...filters
                },
            (data)=>{
                if(!data) return;
                console.log("Data import",data)
                if(data.status)
                {
                    frappe.utils.play_sound("submit");

                    frappe.msgprint({
                        title: __('Import réussi'),
                        message: `
                            <p>UE créées: ${data.data.ues_created }</p>
                            <p>Cours créés: ${data.data.courses_created }</p>
                            <p>Cours mis à jour: ${data.data.courses_updated }</p>
                        `,
                        indicator: 'green'
                    });

                    onAfterImported(data);
                }
                else
                {
                    frappe.msgprint({
                        title: __('Echec d\'importation'),
                        message: data.message.replace("\n","<br\>"),
                        indicator: 'red'
                    });
                    frappe.utils.play_sound("error")
                }
                
            })
        }
    });
     d.$wrapper.find('.download-template-btn').on('click', ()=>{
        Udshed.TeachingGrid.UtilsQueries.download_template(
            //  ()=>d.hide()
            );
    });
    d.show();
},
    

}
