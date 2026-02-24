window.Udshed = window.Udshed || {};
window.Udshed.Insight = window.Udshed.Insight || {};
window.Udshed.Insight.UI = {
    render_kpis(kpiRow,data ) {
        kpiRow.empty();

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
        chartSection.empty();

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
        tableSection.empty();

        tableSection.append(`<div class="section-title">${label}</div>`);

        const table = $(`
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Niveau</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `);

        data.forEach(row => {
            table.find("tbody").append(`
                <tr>
                    <td>${row.name}</td>
                    <td>${row.level}</td>
                    <td>${row.status}</td>
                </tr>
            `);
        });

        tableSection.append(table);
    }
}