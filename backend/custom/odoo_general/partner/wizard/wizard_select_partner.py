# -*- coding: utf-8 -*-

from openerp.osv import osv, fields

class wizard_select_res_partner(osv.osv_memory):
    _name = 'wizard.select.res.partner'
    _description = "Select Customers"
    
    _columns = {
        'member_ids': fields.many2many('res.partner', 'select_res_partner_rel', 'select_id', 'member_id', 'Members', domain = [('customer','=',True)]),
        'active_id': fields.many2one('credit.card.member', 'Ref id'),
                }
    
    def default_get(self, cr, uid, fields, context=None):
        if context is None:
            context = {}
        res = super(wizard_select_res_partner, self).default_get(cr, uid, fields, context=context)
        if context.get('active_model','') == 'credit.card.member':
            res.update({'active_id': context.get('active_id',False)})
        return res
    
    def act_select(self, cr, uid, ids, context=None):
        detail_obj = self.pool.get('credit.card.member.detail')
        credit_obj = self.pool.get('credit.card.member')
        for data in self.browse(cr, uid, ids, context):
            if data.active_id:
                stt = 0
                tmp_ids = detail_obj.search(cr, uid, [('ref_id','=',data.active_id.id)], order="stt desc", limit=1, context=context)
                if tmp_ids:
                    stt = detail_obj.browse(cr, uid, tmp_ids[0]).stt
                for line in data.member_ids:
                    detail_obj.create(cr, uid, {
                                        'ref_id': data.active_id.id,
                                        'partner_id': line.id,
                                        'stt': stt+1,
                                            }, context=context)
                    stt += 1
                credit_obj.write(cr, uid, data.active_id.id, {'state':'update'}, context=context)
        return True