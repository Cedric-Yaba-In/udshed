window.Udshed = window.Udshed || {};
window.Udshed.Utils = {
    refresh_filter(filters, field,page,levelMap)
    {
        if(field === "academic_year") {
            filters.faculty = null;
            filters.filiere = null;
            filters.niveau = null;

            page.fields_dict.faculty.set_value(null);
            page.fields_dict.filiere.set_value(null);
            page.fields_dict.niveau.set_value(null);
            if(page.fields_dict.semestre) {
                filters.semestre=null
                page.fields_dict.semestre.set_value(null)
            }
            levelMap = {};
            return;
        }

        if(field === "faculty") {
            filters.filiere = null;
            filters.niveau = null;

            page.fields_dict.filiere.set_value(null);
            page.fields_dict.niveau.set_value(null);

            if(page.fields_dict.semestre) {
                filters.semestre=null
                page.fields_dict.semestre.set_value(null)
            }
            levelMap = {};
            return;
        }

        if(field === "filiere") {
            filters.niveau = null;
            page.fields_dict.niveau.set_value(null);
            if(page.fields_dict.semestre) {
                filters.semestre=null
                page.fields_dict.semestre.set_value(null)
            }
            levelMap = {};
            return;
        }

        if(field === "niveau") {
             if(page.fields_dict.semestre) {
                filters.semestre=null
                page.fields_dict.semestre.set_value(null)
            }
            return;
        }

    },
    mergeDataByKey(arr1,arr2,key)
    {
        const map = new Map();
        [...arr1,...arr2].forEach((item)=>
        {
            map.set(item[key], {...map.get(item[key]),...item})
        })
    },
    isValidFecthDataFilter(filter)
    {
        return ((filter.academic_year && filter.teacher) || (filter.academic_year && filter.filiere && filter.niveau))
    },
    
    is_valide_filter(filter)
    {
        return filter.academic_year && filter.faculty && filter.filiere && filter.niveau;
    },

    initDataPeriodForUi(coursePeriod)
    {
        let grid = {};

        for(let day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
        {
            let mapDay = new Map()
            coursePeriod.forEach((period)=>{
                mapDay.set(period.name,null)
            })
            grid[day] = mapDay;
        }
        return grid;
    }
}