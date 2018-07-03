# -*- coding: utf-8 -*-
##############################################################################
#    
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2009 Tiny SPRL (<http://tiny.be>).
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
#
##############################################################################

from openerp.osv import fields, osv


class district(osv.osv):
    _name = 'res.district'
    _description = 'District'
    _columns = {
        'name': fields.char('District Name', size=64, required=True),
        'code': fields.char('District Code', size=5,required=True,),
        'state_id': fields.many2one('res.country.state', 'Country state',required=True),
    }
    _order='name'

class ward(osv.osv):
    _description="ward"
    _name = 'res.ward'
    _columns = {        
        'name': fields.char('Ward Name', size=64, required=True),
        'code': fields.char('Ward Code', size=5, required=True),
        'district_id': fields.many2one('res.district', 'District',required=True,),
    }
    _order = 'name'    

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:

