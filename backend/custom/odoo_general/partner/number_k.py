# -*- coding: utf-8 -*-
from openerp import tools
from openerp.osv import fields, osv

class number_k_report(osv.osv):
    _name = "number.k.report"
    _description = "Number K"
    _auto = False
    _rec_name = 'date'

    _columns = {
        'month': fields.integer('Month'),
        'year': fields.integer('Year'),
        'date': fields.datetime('Date Tracsaction', readonly=True),
        'partner_id': fields.many2one('res.partner', 'Member', readonly=True),
        'amount_exchange': fields.float('K Exchange'),
        'nbr': fields.integer('# of Lines', readonly=True),
    }
    _order = 'date desc'

    def _select(self):
        select_str = """
             SELECT min(r.id) as id, r.partner_id as partner_id, count(*) as nbr, r.date_exchange as date,
                date_part('month', r.date_exchange) as month, date_part('year', r.date_exchange) as year, sum(r.amount_exchange) as amount_exchange
        """
        return select_str

    def _from(self):
        from_str = """res_partner_history_exchange r join res_partner p on r.partner_id=p.id"""
        return from_str

    def _group_by(self):
        group_by_str = """GROUP BY r.date_exchange, r.partner_id"""
        return group_by_str

    def _where(self):
        where_str = """ WHERE type_exchange='subtraction' """
        return where_str
    
    def init(self, cr):
        # self._table = sale_report
        tools.drop_view_if_exists(cr, self._table)
        cr.execute("""CREATE or REPLACE VIEW %s as (%s FROM %s %s %s)""" % (self._table, self._select(), self._from(), self._where(), self._group_by()))
