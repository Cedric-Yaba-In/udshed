window.Udshed = window.Udshed || {};

window.Udshed.UI = {
    get_grid_calendar_item(items,filter) {
        let grid = {
            "Monday": { "Morning": null, "Afternoon": null },
            "Tuesday": { "Morning": null, "Afternoon": null },
            "Wednesday": { "Morning": null, "Afternoon": null },
            "Thursday": { "Morning": null, "Afternoon": null },
            "Friday": { "Morning": null, "Afternoon": null },
            "Saturday": { "Morning": null, "Afternoon": null }
        };
        console.log("new items ", items);
        items.forEach(item => {

            let dayOfWeek = new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' }); // ex: "Monday"
            let halfDay = item.period === "Morning" ? "Morning" : "Afternoon"; // ou selon comment tu définis ça dans ton backend

            if (grid[dayOfWeek]) {
                if(grid[dayOfWeek][halfDay] == null) {
                    grid[dayOfWeek][halfDay] = {
                        subject: item.course, 
                        level:filter.niveau, 
                        item:item,
                        teachers: item.teachers 	
                    };			
                } else {
                    grid[dayOfWeek][halfDay].teachers.push(item.enseignant);
                }
                
            } else {
                console.warn(`Jour de la semaine non reconnu: ${dayOfWeek}`);
            }
        });

        console.log("Grid to show ", grid);

        return grid;
    },

    show_calendar_hearder() {
        return  `
            <div class="planning-calendar" id="planning_calendar">

                <div class="planning-nav">
                    <div class="planning-nav-left">
                        <button class="btn btn-default btn-sm" id="prev-week">
                        ◀
                        </button>

                        <button class="btn btn-default btn-sm" id="today-week">
                        Aujourd’hui
                        </button>

                        <button class="btn btn-default btn-sm" id="next-week">
                        ▶
                        </button>
                    </div>

                    <div class="planning-nav-center">
                        <span id="week-label"></span>
                    </div>

                    <div class="planning-nav-right">
                        <select id="month-picker" class="form-control input-sm"></select>
                        <select id="week-select" class="form-control input-sm"></select>
                    </div>
                </div>
                <div class="planning-grid">

                    //Place to be
                </div>
            </div>
        `

    },

    show_calendar(calendar_zone,grid_data={
        "Monday": { "Morning": null, "Afternoon": null },
        "Tuesday": { "Morning": null, "Afternoon": null },
        "Wednesday": { "Morning": null, "Afternoon": null },
        "Thursday": { "Morning": null, "Afternoon": null },
        "Friday": { "Morning": null, "Afternoon": null },
        "Saturday": { "Morning": null, "Afternoon": null }
    })
    {
        calendar_zone.empty();

        let morningPlan = [];
        let afternoonPlan = [];

        // Construire les lignes du matin et de l'après-midi
        for (let day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]) {
            let morningItem = grid_data[day]["Morning"];
            let afternoonItem = grid_data[day]["Afternoon"];


            let morning_cours_type_class = "cm";
            switch(morningItem?.item?.type) {
                case "Cours":
                    morning_cours_type_class = "cm";
                    break;
                case "Traveaux Pratiques (TP)":
                    morning_cours_type_class = "tp";
                    break;
                case "Controlle Continue (CC)":
                    morning_cours_type_class = "cc";
                    break;
                case "Examen de session normal":
                    morning_cours_type_class = "exam";
                    break;
                case "Examen de rattrapage":
                    morning_cours_type_class = "exam";
                    break;
            }

            let afternoon_cours_type_class = "cm";
            switch(afternoonItem?.item?.type) {
                case "Cours":
                    afternoon_cours_type_class = "cm";
                    break;
                case "Traveaux Pratiques (TP)":
                    afternoon_cours_type_class = "tp";
                    break;
                case "Controlle Continue (CC)":
                    afternoon_cours_type_class = "cc";
                    break;
                case "Examen de session normal":
                    afternoon_cours_type_class = "exam";
                    break;
                case "Examen de rattrapage":
                    afternoon_cours_type_class = "exam";
                    break;
            }

            morningPlan.push(morningItem ? `
                <div class="planning-cell" data-day="${day}" data-half="${morningItem.half_day}" data-course='${JSON.stringify(morningItem)}'>
                    <div class="planning-item ${morning_cours_type_class}">
                        <div class="planning-item-title"><span style="font-style:italic">${morningItem.subject}</span><br/>${morningItem.item.cours_label}</div>
                        <div class="planning-item-meta">${morningItem.item.type} <br/> - <br/> ${morningItem.room?morningItem.room:""}</div>
                        <div class="planning-item-meta">${morningItem.teachers.map(t => `<b>${t}</b>`).join('<br/> ')}</div>
                    </div>
                </div>` : `<div class="planning-cell empty" data-day="${day}" data-half="Morning">
                    <div class="no-course">Pas cours</div>
                </div>`);

            afternoonPlan.push(afternoonItem ? `
                <div class="planning-cell" data-day="${day}" data-half="${afternoonItem.half_day}" data-course='${JSON.stringify(afternoonItem)}'>
                    <div class="planning-item ${afternoon_cours_type_class}">
                        <div class="planning-item-title">
                            <span style="font-style:italic">${afternoonItem.subject}</span><br/>${afternoonItem.item.cours_label}
                        </div>
                        <div class="planning-item-meta">${afternoonItem.item.type} <br/> - <br/> ${afternoonItem.room?afternoonItem.room:""}</div>
                        <div class="planning-item-meta">${afternoonItem.teachers.map(t => `<b>${t}</b>`).join('<br/> ')}</div>
                    </div>
                </div>` : `<div class="planning-cell empty" data-day="${day}" data-half="Afternoon">
                <div class="no-course">Pas cours</div>
                </div>`);
        }

        let calendarHTML = `

            <div></div>
            <div class="planning-header">Lundi</div>
            <div class="planning-header">Mardi</div>
            <div class="planning-header">Mercredi</div>
            <div class="planning-header">Jeudi</div>
            <div class="planning-header">Vendredi</div>
            <div class="planning-header">Samedi</div>

            <div class="planning-time-label">
            <span>Matin</span>
            <div class="planning-time-range">08:00 - 12:00</div>
            </div>
            
            ${morningPlan.join('')}

            <div class="planning-time-label">
                <span>Après-midi</span>
                <div class="planning-time-range">13:00 - 17:00</div>
            </div>				
            ${afternoonPlan.join('')}
        `;
        calendar_zone.html(calendarHTML);
        
    } 
};