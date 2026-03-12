window.Udshed = window.Udshed || {};

window.Udshed.DateUtils = {
    /**Grid days */
    createLocalDate(year, month, day) {
        return new Date(year, month, day, 12, 0, 0);
    },
    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    //   return new Date(d.setDate(diff));
        return Udshed.DateUtils.createLocalDate(d.getFullYear(), d.getMonth(), diff);
    },

    updateWeekLabel(currentWeekStart) {
        const start = new Date(currentWeekStart);
        const end = new Date(start);
        end.setDate(start.getDate() + 5);

        const options = { day: '2-digit', month: 'long', year: 'numeric' };

        document.getElementById("week-label").innerText =
            `Semaine du ${start.toLocaleDateString('fr-FR', options)} au ${end.toLocaleDateString('fr-FR', options)}`;
    },

    initMonthPicker(monthPicker) {
        const now = new Date();
        const year = now.getFullYear();

        for (let m = 0; m < 12; m++) {
            const date = new Date(year, m, 1);
            const option = document.createElement("option");

            option.value = `${year}-${m}`;
            option.text = date.toLocaleDateString('fr-FR', {
                month: 'long',
                year: 'numeric'
            });

            if (m === now.getMonth()) option.selected = true;
            monthPicker.appendChild(option);
        }
    },

    getWeeksOfMonth(year, month) {
        const weeks = [];
        const firstDay = Udshed.DateUtils.createLocalDate(year, month, 1);
        const lastDay = Udshed.DateUtils.createLocalDate(year, month + 1, 0);

        let current = Udshed.DateUtils.getMonday(firstDay);

        while (current <= lastDay) {
            weeks.push(new Date(current));
            current.setDate(current.getDate() + 7);
        }

        return weeks;
    },

    updateWeekSelect(year, month,weekSelect) {
        weekSelect.innerHTML = "";

        const weeks = Udshed.DateUtils.getWeeksOfMonth(year, month);

        weeks.forEach((weekStart, index) => {
            const end = new Date(weekStart);
            end.setDate(weekStart.getDate() + 5);

            const option = document.createElement("option");
            option.value = weekStart.getTime();

            option.text = `Semaine ${index + 1} : 
                ${ weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} - 
                ${ end.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) }`;

            weekSelect.appendChild(option);
        });
    },

    getFirstWeekInsideMonth(weeks, year, month) {
        return weeks.find(weekStart => {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            return (
            weekStart.getMonth() === month ||
            weekEnd.getMonth() === month
            );
        });
    },

    syncSelectors(weekSelect,monthPicker,currentWeekStart) {

        const year = currentWeekStart.getFullYear();
        const month = monthPicker.value.split("-")[1];

        Udshed.DateUtils.updateWeekSelect(year, Number(month),weekSelect);
        weekSelect.value = currentWeekStart.getTime();
    }
};