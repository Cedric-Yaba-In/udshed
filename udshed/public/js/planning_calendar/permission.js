window.Udshed = window.Udshed || {};

const ROLE_LIST= {
    ADMINISTRATOR:"Administrator",
    PLANNING_ADMIN:"Planning Admin",
    TEACHER:"Teacher",
    STUDENT:"Student",
    COORDINATOR:"Coordinator",
    SYSTEME_MANAGER:"System Manager"
}


window.Udshed.Perms = {
    user_can_edit_planning_cell(cellFilter,userContext) {
        if(this.is_admin(userContext)) return true;

        let permsContext = userContext.perms.filter((p)=>p.academic_year == cellFilter.academic_year && p.filiere == cellFilter.filiere && p.niveau == cellFilter.niveau)
        if(permsContext.length==0) return false;
        let permContextItem = permsContext[0]
        return permContextItem.role==ROLE_LIST.COORDINATOR;
    },


    is_admin(userContext) {
        return userContext.roles.includes(ROLE_LIST.ADMINISTRATOR) || userContext.roles.includes(ROLE_LIST.SYSTEME_MANAGER);
    },
    should_apply_filter(userContext) {
        return !this.is_admin(userContext)
    },
    normalizeUserContext(userContext)
    {
       
        let normalized = {
            academic_year: [...new Set(userContext.map((data)=>data.academic_year_list).reduce((acc,curr)=>[...acc,...(curr.map((i)=>i.name))],[]))],
            default_academic_year: userContext[0].default_academic_year,
            roles: [...new Set(userContext.map((data)=>data.role))],
            faculty:[...new Set(userContext.filter((data)=>data.hasOwnProperty("faculty")).map((data)=>data.faculty).reduce((acc,curr)=>[...acc,...(curr.map((i)=>i.name))],[]))],
            filiere:[...new Set(userContext.filter((data)=>data.hasOwnProperty("filiere")).map((data)=>data.filiere).reduce((acc,curr)=>[...acc,...(curr.map((i)=>i.name))],[]))],
            niveau:[...new Set(userContext.filter((data)=>data.hasOwnProperty("niveau")).map((data)=>data.niveau).reduce((acc,curr)=>[...acc,...(curr.map((i)=>i.name))],[]))],
            perms:userContext
        }
         
        return normalized;
    }
}