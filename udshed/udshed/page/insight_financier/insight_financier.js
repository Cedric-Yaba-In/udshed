frappe.pages['insight-financier'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Insight Financier',
		single_column: true
	});

	 // Injecter CSS propre
    // inject_custom_css();

    // Container principal
    const container = $(`
        <div class="insight-wrapper">
            <div class="insight-header"></div>

            <div class="insight-kpi-row"></div>

            <div class="insight-chart-section card"></div>

            <div class="insight-table-section card"></div>
        </div>
    `).appendTo(page.body);

    const header = container.find(".insight-header");
    const kpiRow = container.find(".insight-kpi-row");
    const chartSection = container.find(".insight-chart-section");
    const tableSection = container.find(".insight-table-section");

    // Filtres
    const filters = {
        academic_year: page.add_field({
            label: "Année Académique",
            fieldtype: "Link",
            fieldname: "academic_year",
            options: "Academic Year",
            change: refresh_dashboard
        }),

        week_start: page.add_field({
            label: "Début Semaine",
            fieldtype: "Date",
            fieldname: "week_start",
            change: refresh_dashboard
        }),

        filiere: page.add_field({
            label: "Filière",
            fieldtype: "Link",
            fieldname: "filiere",
            options: "Field of study",
            change: refresh_dashboard
        })
    };

    page.set_primary_action("Actualiser", refresh_dashboard);
    page.set_secondary_action("Exporter Excel", () => {
    if (!datatable || !datatable.data) {
        frappe.msgprint("Aucune donnée à exporter !");
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws_data = [
        ["Nom", "Niveau", "Statut"], // entêtes
        ...datatable.data.map(row => row)
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Détails Cours");

    XLSX.writeFile(wb, "Dashboard_Insights.xlsx");
});

page.set_secondary_action("Exporter PDF", () => {

    // Contenu à exporter (KPI + Graph + Table)
    const content = $(".insight-wrapper")[0];

    html2pdf(content, {
        margin: 10,
        filename: "Dashboard_Insights.pdf",
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    });
});

    function refresh_dashboard() {
		// const values = {
        //     academic_year: filters.academic_year.get_value(),
        //     week_start: filters.week_start.get_value(),
        //     filiere: filters.filiere.get_value()
        // };
        // frappe.call({
        //     method: "udshed.api.test_api.get_dashboard_stats",
        //     args: values,
        //     callback(r) {
        //         if (!r.message) return;

        //         render_kpis(r.message.kpis);
        //         render_chart(r.message.chart_data);
        //         render_table(r.message.table_data);
        //     }
        // });
		 const data = generate_fake_data();

    render_kpis(data.kpis);
    render_chart(data.chart_data);
    render_table(data.table_data);
    }

	function generate_fake_data() {

    const total_students = randomInt(800, 2500);
    const teachers = randomInt(40, 120);
    const success_rate = randomInt(65, 95);
    const filieres = randomInt(5, 15);

    const levels = ["Licence 1", "Licence 2", "Licence 3", "Master 1", "Master 2"];
    const level_values = levels.map(() => randomInt(50, 400));

    const fake_students = [];

    const names = [
        "Ngono Eric",
        "Yankam Patrick",
        "Fonkou Marie",
        "Tchoumi Brice",
        "Ewane Sarah",
        "Ndam Alain",
        "Mbianda Ruth"
    ];

    for (let i = 0; i < 8; i++) {
        fake_students.push({
            name: names[randomInt(0, names.length - 1)],
            level: levels[randomInt(0, levels.length - 1)],
            status: Math.random() > 0.3 ? "Actif" : "Suspendu"
        });
    }

    return {
        kpis: [
            { label: "Total Étudiants", value: total_students },
            { label: "Taux de Réussite (%)", value: success_rate + "%" },
            { label: "Enseignants", value: teachers },
            { label: "Filières Actives", value: filieres }
        ],
        chart_data: {
            labels: levels,
            datasets: [
                {
                    name: "Étudiants par niveau",
                    values: level_values
                }
            ]
        },
        table_data: fake_students
    };
}

    function render_kpis(data) {
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
    }

	function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

    function render_chart(data) {
        chartSection.empty();

        chartSection.append(`<div class="section-title">Statistiques</div>`);

        const chartDiv = $(`<div class="chart-container"></div>`);
        chartSection.append(chartDiv);

        new frappe.Chart(chartDiv[0], {
            data: data,
            type: "bar",
            height: 300,
            colors: ["#4F46E5"]
        });
    }

    function render_table(data) {
        tableSection.empty();

        tableSection.append(`<div class="section-title">Détails</div>`);

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
};

