window.Udshed = window.Udshed || {};

window.Udshed.UI = {
    
    get_grid_calendar_item(items,filter,coursePeriod) {
        
        let grid = Udshed.Utils.initDataPeriodForUi(coursePeriod)
        
        console.log("item grid",items,grid)
        
        items.forEach(item => {

            let dayOfWeek = new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' }); // ex: "Monday"
            // let halfDay = item.period === "Morning" ? "Morning" : "Afternoon"; // ou selon comment tu définis ça dans ton backend

            if (grid[dayOfWeek]) {
                let periodDay = grid[dayOfWeek].get(item.period)

                if(grid[dayOfWeek].get(item.period)== null) {
                    grid[dayOfWeek].set(item.period, {
                        subject: item.course, 
                        level:filter.niveau, 
                        item:item,
                        teachers: item.teachers 	
                    });			
                } else {
                    grid[dayOfWeek].get(item.period).teachers.push(item.enseignant);
                }
                
            } else {
                console.warn(`Jour de la semaine non reconnu: ${dayOfWeek}`);
            }
        });
        console.log("item grid",items,grid)



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

    show_calendar(calendar_zone,grid_data,coursePeriod)
    {
        console.log("here coaldanaera",grid_data,coursePeriod)
        calendar_zone.empty();

        let plan = new Map();
        coursePeriod.forEach((period)=>{
            plan.set(period.name,{libelle:period.libelle,items:[]})
        })

        // Construire les lignes du matin et de l'après-midi
        for (let day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]) {
            for(let period of coursePeriod)
            {
                periodItem = grid_data[day].get(period.name)

                let period_cours_type_class = "cm";
                switch(periodItem?.item?.type) {
                    case "Cours":
                        period_cours_type_class = "cm";
                        break;
                    case "Traveaux Pratiques (TP)":
                        period_cours_type_class = "tp";
                        break;
                    case "Controlle Continue (CC)":
                        period_cours_type_class = "cc";
                        break;
                    case "Examen de session normal":
                        period_cours_type_class = "exam";
                        break;
                    case "Examen de rattrapage":
                        period_cours_type_class = "exam";
                        break;
                }

                plan.get(period.name).items.push(periodItem ? `
                <div class="planning-cell" data-day="${day}" data-half="${periodItem.half_day}" data-course='${JSON.stringify(periodItem)}'>
                    <div class="planning-item ${period_cours_type_class}">
                        <div class="planning-item-title">
                            <span style="font-style:italic">${periodItem.subject}</span><br/>${periodItem.item.cours_label}
                        </div>
                        <div class="planning-item-meta">
                            ${periodItem.item.type} <br/> - <br/> ${periodItem.room?periodItem.room:""}
                        </div>
                        <div class="planning-item-meta">
                            Batiment: ${periodItem.item.batiment?periodItem.item.batiment:""}  <br/> Salle: ${periodItem.item.salle?periodItem.item.salle:""}<br/> - <br/>
                        </div>
                        <div class="planning-item-meta">
                            ${periodItem.teachers.map(t => `<b>${t}</b>`).join('<br/> ')}
                        </div>
                    </div>
                </div>` : 
                `<div class="planning-cell empty" data-day="${day}" data-half="${period.name}">
                    <div class="no-course">Pas cours</div>
                </div>`);
            }

        }
                console.log("Period, ",plan)

        let calendarHTML = `
            <div></div>
            <div class="planning-header">Lundi</div>
            <div class="planning-header">Mardi</div>
            <div class="planning-header">Mercredi</div>
            <div class="planning-header">Jeudi</div>
            <div class="planning-header">Vendredi</div>
            <div class="planning-header">Samedi</div>`

        for(let period of plan.keys())
        {
            periodItem = period.split("-")
            calendarHTML += `
                <div class="planning-time-label">
                    <span>${plan.get(period).libelle}</span>
                    <div class="planning-time-range">${periodItem[0]} - ${periodItem[1]}</div>
                </div>
                ${plan.get(period).items.join('')}
            `
        }
        calendar_zone.html(calendarHTML);
        
    } 
};