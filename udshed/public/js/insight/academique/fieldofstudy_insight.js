window.Udshed = window.Udshed || {};
window.Udshed.Insight = window.Udshed.Insight || {};
window.Udshed.Insight.Academic = window.Udshed.Insight.Academic || {};
window.Udshed.Insight.Academic.FieldOfStudy = {
    showAcadmicFieldOfStudyInsights(page,filters,page_section) {
        Udshed.Insight.UI.render_kpis(page_section.kpiRow,[
            {label: __("Nombre de niveau"), value: "10"},
             {label: __("Evolution globale des cours"), value: "12%"},           
        ])
            Udshed.Insight.UI.render_table({
                columns:[{
                    label: "Niveau",
                    fieldname: "niveau",
                    fieldtype: "Data"
                 },
                 {
                    label: "Cours terminé",
                    fieldname: "en_cours",
                    fieldtype: "Data"
                 },
                 {
                    label: "CC fait",
                    fieldname: "cc_fait",
                    fieldtype: "Int"
                 },
                 {
                    label: "Examen fait",
                    fieldname: "examen_fait",
                    fieldtype: "Float"
                 },
                  {
                    label: "Semestre",
                    fieldname: "semestre",
                    fieldtype: "Float"
                 },
                 {
                    label: "Progression (%)",
                    fieldname: "progression",
                    fieldtype: "Float"
                 }
                ],
                values:[
                    { niveau: "L1", en_cours: "Programmation Orienté Objet", cc_fait: 2, examen_fait:0,semestre:"Semestre 1",progression:12.4},
                    { niveau: "L2", en_cours: "Uml", cc_fait: 1, examen_fait:2,semestre:"Semestre 2",progression:98},
                    { niveau: "L3", en_cours: "Gestion de Projet", cc_fait: 1, examen_fait:1,semestre:"Semestre 1",progression:100},
                ]
                },
                page_section.tableSection,
                "Rapport de progression de la filière"
            )

        if(filters.semestre)
        {
            Udshed.Insight.UI.render_chart(`Progression global par niveau au ${filters.semestre=="semestre1"?'Semestre 1':'Semestre 2'}`,"bar",page_section.chartSection,{
                labels: ["IRT  1","IRT 2","IRT 3",],
                dataset_label: "Etudiant",
                values: [78,19,57]
            })
            Udshed.Insight.UI.render_table({
                columns:[{
                    label: "Niveau",
                    fieldname: "niveau",
                    fieldtype: "Data"
                 },
                 {
                    label: "Cours terminé",
                    fieldname: "en_cours",
                    fieldtype: "Data"
                 },
                 {
                    label: "CC fait",
                    fieldname: "cc_fait",
                    fieldtype: "Int"
                 },
                 {
                    label: "Examen fait",
                    fieldname: "examen_fait",
                    fieldtype: "Float"
                 },
                 {
                    label: "Progression (%)",
                    fieldname: "progression",
                    fieldtype: "Float"
                 }
                ],
                values:[
                    { niveau: "L1", en_cours: "Programmation Orienté Objet", cc_fait: 2, examen_fait:0,progression:12.4},
                    { niveau: "L2", en_cours: "Uml", cc_fait: 1, examen_fait:2,progression:98},
                    { niveau: "L3", en_cours: "Gestion de Projet", cc_fait: 1, examen_fait:1,progression:100},
                ]
                },
                page_section.tableSection,
                "Rapport de progression de la filière"
            )
        }
        else 
        {
            Udshed.Insight.UI.render_chart(`Progression global par niveau ${filters.semestre=="semestre1"?'Semestre 1':'Semestre 2'}`,"bar",page_section.chartSection,{
                labels: ["Semestre 1","Semestre 2"],
                dataset_label: "Etudiant",
                values: [12,19]
            })
        }
        
    }
};