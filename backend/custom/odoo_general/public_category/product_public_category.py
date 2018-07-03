# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2009 Tiny SPRL (<http://tiny.be>).
#    Copyright (C) 2010-2014 OpenERP s.a. (<http://openerp.com>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#    Terminal view queue: sudo rabbitmqctl list_queues
#
##############################################################################
# -------------
#!/usr/bin/env python
from openerp import tools
from openerp.osv import osv, fields

class product_public_category(osv.osv):
    _inherit = "product.public.category"
    
    def _get_hot_products(self, cr, uid, ids, field_name, arg, context=None):
        res = {}
        for category in self.browse(cr, uid, ids, context=context):
            cr.execute('''select pp.id, to_timestamp(ps.date_stop, 'DD-MM-YYYY hh24:mi:ss.MS') , is_dial, number_win 
                          from product_product pp
                          inner join product_template pt on pp.product_tmpl_id = pt.id
                          inner join product_public_category_product_template_rel rel on rel.product_template_id = pt.id 
                          inner join product_public_category ppc on rel.product_public_category_id = ppc.id
                          left join product_session ps on ps.product_id = pp.id
                          where ppc.id = %s 
                          order by to_timestamp(ps.date_stop, 'DD-MM-YYYY hh24:mi:ss.MS') desc, is_dial , number_win
                           ''' % str(category.id))
            
            product_list = []
            for item in cr.dictfetchall():
                if item['id'] not in product_list:
                    product_list.append(item['id'])
                if len(product_list) == 8:
                    break
            res[category.id] = product_list
        return res
    
    _columns = {
                'hot_products': fields.function(_get_hot_products, type="one2many", obj='product.product', string="Hot Products"),
                'image_ids':fields.one2many('product.public.category.image','category_id','Image Link'),
                'icon':fields.char('Icon Link'),
                'bg_color': fields.char('Background Color')
                }
    
class product_public_category_image(osv.osv):
    _name = "product.public.category.image"
    _order="sequence"
    _columns = {
                'name':fields.char('Image Link', required=True),
                'sequence':fields.integer('Sequence'),
                'link_href' : fields.text('Href Link'),
                'category_id':fields.many2one('product.public.category','Category')
                }
    _defaults = {
                  'sequence':1,
                 }
product_public_category_image()