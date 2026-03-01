window.Udshed = window.Udshed || {};
window.Udshed.Insight = window.Udshed.Insight || {};
window.Udshed.Insight.Academic = window.Udshed.Insight.Academic || {};
window.Udshed.Insight.Academic.Faculty = {
    showAcadmicFacultyInsights(page,filters,page_section) {
        Udshed.Insight.UI.render_kpis(page_section.kpiRow,[
            {label: __("Nombre de Filiére"), value: "10"},
             {label: __("Evolution globale des cours"), value: "12%"},           
        ])
        if(filters.semestre)
        {
            Udshed.Insight.UI.render_chart(`Progression global par filiére au ${filters.semestre=="semestre1"?'Semestre 1':'Semestre 2'}`,"bar",page_section.chartSection,{
            labels: ["IRT","GC","TOPO","IMB"],
            dataset_label: "Etudiant",
            values: [78,19,57,85]
        })
        }
        else 
        {
            Udshed.Insight.UI.render_chart("Progression global par semestre","bar",page_section.chartSection,{
                labels: ["Semestre 1","Semestre 2"],
                dataset_label: "Etudiant",
                values: [12,19]
            })
        }
        
    }
};