# -*- coding: utf-8 -*-

from openerp import tools
from openerp.osv import fields, osv

class product_report(osv.osv):
    _name = "product.report"
    _description = "Product Statistics"
    _auto = False
    _rec_name = 'name_template'
    
    
    _columns = {
        'name_template': fields.char('Name', readonly=True),  
        'category_id': fields.many2one('category.convert', 'Category', readonly=True),
        'type_with_session': fields.selection([('up_session', 'Up Sessions'), 
                                               ('in_session', 'In Sessions')], 'Type', readonly=True),
        'total_session_sale': fields.float('Total Session on Sale', readonly=True),
        'total_session': fields.float('Total Session', readonly=True),
        'total_session_dial': fields.float('Total Session Dial', readonly=True),
  
    }
    
    def _select(self):
        select_str = """
            select pp.id as id, name_template, type_with_session, total_session_sale, total_session, total_session_dial, cc.id category_id
        """
        return select_str
    
    def _from(self):
        from_str = """ product_product pp
            inner join category_convert_product_rel rel on rel.product_id = pp.id 
            inner join category_convert cc on rel.category_convert_id = cc.id
        """
        return from_str
    
    
    def init(self, cr):
        tools.drop_view_if_exists(cr, self._table)
        cr.execute("""CREATE or REPLACE VIEW %s as (
            %s
            FROM ( %s )
            )""" % (self._table, self._select(), self._from()))
        
        
        
        