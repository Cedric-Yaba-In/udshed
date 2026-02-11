import frappe
from frappe.utils import cint
from frappe.query_builder import DocType
from frappe.query_builder.functions import Concat


@frappe.whitelist()
def get_room_by_building( building):
	Room = DocType("Room")
	Building = DocType("Building")

	query = (
    	frappe.qb.from_(Room)
    	.join(Building)
    	.on(Room.parent == Building.name)
    	.select(
        	Room.name.as_("value"),
			Concat(Room.code,'  ',Room.etage).as_("label") 
    	)
    	.where(
        	(Building.name == building) 
		)
	)

	data =  query.run(as_dict=True)
	print("Room ",data)
	return data