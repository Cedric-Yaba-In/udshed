window.Udshed = window.Udshed || {};
window.Udshed.Insight = window.Udshed.Insight || {};
window.Udshed.Insight.Academic = window.Udshed.Insight.Academic || {};
window.Udshed.Insight.Academic.Year = {
    showAcadmicYearInsights(page,filters,page_section) {
        Udshed.Insight.UI.render_kpis(page_section.kpiRow,[
            {label: __("Nombre de faculté"), value: "2"},
            {label: __("Nombre de filiére"), value: "12"},
             {label: __("Evolution globale des cours"), value: "12%"},           
        ]),

        Udshed.Insight.UI.render_chart("Progression global par semestre","bar",page_section.chartSection,{
            labels: ["Semestre 1","Semestre 2"],
            dataset_label: "Etudiant",
            values: [12,19]
        })
    }
};