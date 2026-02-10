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
    normalizeUserContext(userContext)
    {
        console.log("Data ",)
        if(userContext instanceof Array)
        {
            normalized = {
				academic_year: [...new Set(userContext.map((data)=>data.academic_year_list).reduce((acc,curr)=>[...acc,...(curr.map((i)=>i.name))],[]))],
				faculty: [...new Set(userContext.map((data)=>data.faculty).reduce((acc,curr)=>[...acc,...(curr.map((i)=>i.name))],[]))],
				filiere: [...new Set(userContext.map((data)=>data.filiere).reduce((acc,curr)=>[...acc,...(curr.map((i)=>i.name))],[]))],
				niveau: [...new Set(userContext.map((data)=>data.niveau).reduce((acc,curr)=>[...acc,...(curr.map((i)=>i.name))],[]))],
				default_academic_year: userContext[0].default_academic_year,
				roles:userContext
			}
        }
        else normalized = {
            roles:userContext,
            academic_year: [],
            faculty:[],
            filiere:[],
            niveau:[],
            ...userContext
        }

        console.log("normalize", normalized)
        return normalized;
    }
}