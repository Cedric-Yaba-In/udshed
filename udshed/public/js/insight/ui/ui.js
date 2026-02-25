window.Udshed = window.Udshed || {};
window.Udshed.Insight = window.Udshed.Insight || {};
window.Udshed.Insight.UI = {
    render_kpis(kpiRow,data ) {

        data.forEach(item => {
            const card = $(`
                <div class="insight-kpi-card">
                    <div class="kpi-label">${item.label}</div>
                    <div class="kpi-value">${item.value}</div>
                </div>
            `);

            kpiRow.append(card);
        });
    },
    render_chart(label,typeChart, chartSection,data,color='#3498db') {
        chartSection.append(`<div class="section-title">${label}</div>`);


        const chartDiv = $(`<div class="chart-container"></div>`);
        chartSection.append(chartDiv);

        return new frappe.Chart(chartDiv[0], {
            type: typeChart,
            data: {
                labels: data.labels,
                datasets: [{
                    label: data.dataset_label,
                    values: data.values,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            },
            height: 300,
            colors: [color]

        });
    },

    render_table(data,tableSection, label) {
    
        tableSection.append(`<div class="section-title">${label}</div>`);
        const table = $(`<div class="table-container"></div>`)
        tableSection.append(table);

        let column = []
        let value = []
        data.columns.forEach((elt)=>{
            column.push({
                name:elt.label,
                id:elt.field,
                editable:elt.editable || false,
                focusable:elt.focusable || false,
                dropdown:elt.dropdown || false,
                width: elt.width || "auto",
                fieldname:elt.fieldname || "",
                fieldtype:elt.fieldtype || "Data",
                format: (value) => {
                    let v = value;
                    if(elt.toBold) v = value.bold();
                    return v
                }
            })            
        })
        value = data.values.map((v)=> Array.from(Object.values(v)))
        const datatable = new frappe.DataTable(table[0], {
                columns: [...column],
                data: [...value],
                layout:"fluid",
                noDataMessage: "Aucune données à afficher",
                inlineFilters :true
            }
        );
        
    }
}