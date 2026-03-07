frappe.pages['grille-denseignement'].on_page_load = function(wrapper) {
	frappe.require([
		'/assets/udshed/js/utils/utils.js', 
		'/assets/udshed/js/utils/utils_queries.js', 
		'/assets/udshed/js/teaching_grid/teaching_grid_utilui.js', 
		'/assets/udshed/js/teaching_grid/teaching_grid_query.js', 
		'/assets/udshed/js/teaching_grid/teaching_grid_dialog.js', 
		'/assets/udshed/js/teaching_grid/teaching_grid.js', 
	]).then(async () => {
        var page = frappe.ui.make_app_page({
            parent: wrapper,
            title: 'Grilles d\'enseignements',
            single_column: true
        });

         let filters = {
            academic_year: null,
            faculty: null,
            filiere: null,
            niveau: null,
            semestre:null,
        };
        let levelMap = {}; // label => name

        let teaching_grid = new Udshed.TeachingGrid.DataGrid(wrapper);

        const btnImporter = page.set_primary_action(__('Importer'), function() {
            Udshed.TeachingGrid.Dialog.show_import_dialog(filters,()=>teaching_grid.refresh());
        }, 'upload');
        
        const btnExporter = page.set_secondary_action(__('Exporter'), function() {
            Udshed.TeachingGrid.UtilsQueries.export_grid(filters,()=>teaching_grid.refresh());
        }, 'download');
        Udshed.TeachingGrid.UtilsUi.update_page_actions(filters, btnExporter,btnImporter)

        
        // page.add_menu_item(__('Rafraîchir'), function() {
        //     teaching_grid.refresh();
        // }, 'refresh');

       

        page.add_field({
            fieldtype: 'Link',
            label: 'Année académique',
            fieldname: 'academic_year',
            options: 'Academic Year',
            change(e) {
                filters.academic_year = this.get_value();
                Udshed.Utils.refresh_filter(filters,"academic_year",page,levelMap);
                
                teaching_grid.initData()
                teaching_grid.render_datatable()
                

            }
        });

        const faculty_field = page.add_field({
            fieldtype: 'Link',
            label: 'Faculté',
            fieldname: 'faculty',
            options: 'Faculty',
            change(e) {
                filters.faculty = this.get_value();
                Udshed.Utils.refresh_filter(filters,"faculty",page,levelMap);
                
                teaching_grid.initData()
                teaching_grid.render_datatable()
            }
        });

        const filiere_field = page.add_field({
            fieldtype: 'Link',
            label: 'Filière',
            fieldname: 'filiere',
            options: 'Field of study',
            get_query() {
                if (!faculty_field.get_value()) {
                    return {};
                }

                return {
                    filters: {
                        faculte: faculty_field.get_value()
                    }
                };
            }, 
            change() {
                filters.filiere = this.get_value();
                Udshed.Utils.refresh_filter(filters,"filiere",page,levelMap);

                Udshed.UtilsQueries.loadLevels(this.get_value(),niveau_field,(levels)=>{
                    levelMap = levels ? levels.reduce((acc, curr) => {
                        acc[curr.level] = curr.name;
                        return acc;
                    }, {}) : {};
                    niveau_field.df.options = levels ? levels.map((value)=>({value:value.level,name:value.name})) || [] : [];
                    niveau_field.refresh();
                });
				Udshed.TeachingGrid.UtilsUi.update_page_actions(filters, btnExporter,btnImporter)
                
                teaching_grid.initData()
                teaching_grid.render_datatable()
            }
        });  

        const niveau_field = page.add_field({
            fieldtype: 'Select',
            label: 'Niveau',
            fieldname: 'niveau',
            change() {
                filters.niveau = levelMap[this.get_value()];
                Udshed.Utils.refresh_filter(filters,"niveau",page,levelMap);
                teaching_grid.initData()
                teaching_grid.render_datatable()
            }
        });
        const semestre_field = page.add_field({
            fieldtype: 'Select',
            label: 'Semestre',
            fieldname: 'semestre',
            options: [
                {value:'Semestre 1', label:'Semestre 1'},
                {value:'Semestre 2', label:'Semestre 2'},
            ],
            change() {
                filters.semestre = this.get_value();
                if(this.get_value()) teaching_grid.load_data(filters);
				Udshed.TeachingGrid.UtilsUi.update_page_actions(filters, btnExporter,btnImporter)
            }
        });

    })
}

// frappe/app/teaching_grid/teaching_grid.js


