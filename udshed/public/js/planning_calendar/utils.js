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
            levelMap = {};
            return;
        }

        if(field === "faculty") {
            filters.filiere = null;
            filters.niveau = null;

            page.fields_dict.filiere.set_value(null);
            page.fields_dict.niveau.set_value(null);
            levelMap = {};
            return;
        }

        if(field === "filiere") {
            filters.niveau = null;
            page.fields_dict.niveau.set_value(null);
            levelMap = {};
            return;
        }

        if(field === "niveau") {
            return;
        }

        filters.faculty = null;
        filters.filiere = null;
        filters.niveau = null;

        page.fields_dict.faculty.set_value(null);
        page.fields_dict.filiere.set_value(null);
        page.fields_dict.niveau.set_value(null);
        levelMap = {};
    },
    mergeDataByKey(arr1,arr2,key)
    {
        const map = new Map();
        [...arr1,...arr2].forEach((item)=>
        {
            map.set(item[key], {...map.get(item[key]),...item})
        })
    },
    
}