# -*- coding: utf-8 -*-

from openerp.osv import osv, fields
from openerp.osv.expression import get_unaccent_wrapper
from openerp.osv import fields, osv, expression
import time
from datetime import datetime
from openerp.tools.translate import _

class res_partner(osv.osv):
    _inherit = 'res.partner'
    
    def _calcu_total_amount(self, cr, uid, ids, fieldname, args, context=None):
        res = dict.fromkeys(ids, 0)
        for record in self.browse(cr, uid, ids, context=context):
            res[record.id] = sum(line.amount_exchange if line.type_exchange == 'addition' else -line.amount_exchange for line in record.history_exchange_ids)
        return res
    
    def _get_partner(self, cr, uid, ids, context=None):
        result = {}
        for line in self.pool.get('res.partner.history.exchange').browse(cr, uid, ids, context=context):
            result[line.partner_id.id] = True
        return result.keys()
    
    def _total_session_order(self, cr, uid, ids, field_name, arg, context=None):
        result = {}
        session_order_pool = self.pool.get('product.session.order')
        for partner_id in ids:
            sesiion = session_order_pool.search(cr, uid, [('partner_id', 'child_of', partner_id)], context=context)
            result[partner_id] = len(sesiion) or 0
        return result
    
    _columns = {
        'total_amount': fields.function(_calcu_total_amount, type='float', string='Total Amount',
                store = {
                    'res.partner.history.exchange': (_get_partner, ['amount_exchange'], 10)
                }),
        'history_exchange_ids': fields.one2many('res.partner.history.exchange', 'partner_id', 'History Exchange'),
        'login': fields.char('Nick name'),
        'password': fields.char('Password'),
        'password_temp': fields.char('Password'),
        'show_pass': fields.boolean('Show Password'),
        'gender': fields.selection([('male','Male'),('female','Female'),('confiden','Confidentiality')],'Gender'),
        'income_monthly': fields.float('Income/Monthly'),
        'signature': fields.text('Signature'),
        'total_session_order': fields.function(_total_session_order, string="Total Session Order", type='integer'),
        'identity': fields.char('ID'),
        'register_date': fields.datetime('Register Date'),
        'login_history': fields.one2many('res.partner.history.login', 'partner_id', 'History Login'),
        'avantar_link': fields.char('Hình ảnh cá nhân', help="Đường link hình ảnh cá nhân của khách hàng upload từ website."),
    }
    
    def _check_constraints_login(self, cr, uid, ids, context=None):
        for data in self.browse(cr, uid, ids, context=context):
            if data.customer:
                search_ids = self.search(cr, uid, [('login','=',data.login),('id','!=',data.id)], context=context)
                if search_ids:
                    return False
        return True
    
#     _sql_constraints = [('login_uniq', 'unique(login)', 'Nick name must be unique!')]
    _constraints = [(_check_constraints_login, 'Nick name must be unique!', ['login'])]
    
    _defaults = {
        'show_pass': False,
        'register_date': lambda *a: datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
    }
    
    def onchange_password(self, cr, uid, ids, password, password_temp, show_pass, context=None):
        res_return = {}
        if show_pass:
            res_return['value'] = {'password': password_temp}
        else: 
            res_return['value'] = {'password_temp': password}
        return res_return
    
    def create(self, cr, uid, vals, context=None):
        if context is None:
            context = {}
        if vals.get('identity', '/') == '/':
            vals['identity'] = self.pool.get('ir.sequence').get(cr, uid, 'id.res.partner', context=context) or '/'
        if not vals.get('customer', False):
            vals['login'] = False
            vals['password'] = False
            vals['password_temp'] = False
        ctx = dict(context or {}, mail_create_nolog=True)
        new_id = super(res_partner, self).create(cr, uid, vals, context=ctx)
        return new_id
    
    def unlink(self, cr, uid, ids, context=None):
        for record in self.browse(cr, uid, ids, context=context):
            if record.website_id:
                raise osv.except_osv(
                    _('Invalid Action!'),
                    _('You can not delete Partner have Website ID. Please deactive it.')
                )
        return super(res_partner, self).unlink(cr, uid, ids, context=context)


    def name_get(self, cr, uid, ids, context=None):
        if context is None:
            context = {}
        if isinstance(ids, (int, long)):
            ids = [ids]
        res = []
        for record in self.browse(cr, uid, ids, context=context):
            login = record.login and ' (%s)' % record.login or ''
            name = '%s%s' % (record.name,login)
            if record.parent_id and not record.is_company:
                name = "%s, %s" % (record.parent_name, name)
            if context.get('show_address_only'):
                name = self._display_address(cr, uid, record, without_company=True, context=context)
            if context.get('show_address'):
                name = name + "\n" + self._display_address(cr, uid, record, without_company=True, context=context)
            name = name.replace('\n\n','\n')
            name = name.replace('\n\n','\n')
            if context.get('show_email') and record.email:
                name = "%s <%s>" % (name, record.email)
            res.append((record.id, name))
        return res
    
    def name_search(self, cr, uid, name, args=None, operator='ilike', context=None, limit=100):
        if not args:
            args = []
        if name and operator in ('=', 'ilike', '=ilike', 'like', '=like'):

            self.check_access_rights(cr, uid, 'read')
            where_query = self._where_calc(cr, uid, args, context=context)
            self._apply_ir_rules(cr, uid, where_query, 'read', context=context)
            from_clause, where_clause, where_clause_params = where_query.get_sql()
            where_str = where_clause and (" WHERE %s AND " % where_clause) or ' WHERE '
            # search on the name of the contacts and of its company
            search_name = name
            if operator in ('ilike', 'like'):
                search_name = '%%%s%%' % name
            if operator in ('=ilike', '=like'):
                operator = operator[1:]

            unaccent = get_unaccent_wrapper(cr)

            query = """SELECT id
                         FROM res_partner
                      {where} ({email} {operator} {percent}
                           OR {display_name} {operator} {percent}
                           OR {login} {operator} {percent})
                     ORDER BY {display_name}
                    """.format(where=where_str, operator=operator,
                               email=unaccent('email'),
                               display_name=unaccent('display_name'),
                               percent=unaccent('%s'),
                               login=unaccent('login'))

            where_clause_params += [search_name, search_name, search_name]
            if limit:
                query += ' limit %s'
                where_clause_params.append(limit)
            cr.execute(query, where_clause_params)
            ids = map(lambda x: x[0], cr.fetchall())

            if ids:
                return self.name_get(cr, uid, ids, context)
            else:
                return []
        return super(res_partner,self).name_search(cr, uid, name, args, operator=operator, context=context, limit=limit)
    
class res_partner_history_exchange(osv.osv):
    _name = 'res.partner.history.exchange'
    _description = "History Exchange of Partner"
    
    _columns = {
        'partner_id': fields.many2one('res.partner', 'Partner Id', ondelete='cascade'),
        'date_exchange': fields.datetime('Date Transaction', required=True),
        'type_exchange': fields.selection([('addition','+'),('subtraction','-')], 'Type Exchange', required=True),
        'amount_exchange': fields.float('Exchange(K)'),
        'balance': fields.float('Balance(K)', readonly=True),
        'millisecond': fields.integer('Millisecond'),
        'product_id': fields.many2one('product.product','Product'),
        'codes':fields.text('Codes'),
    }
    
    _defaults = {
        'date_exchange': fields.datetime.now,
        'type_exchange': 'addition',
        'amount_exchange': 0,
        'balance': 0,
    }
    
    def create(self, cr, uid, vals, context=None):
        history_ids = self.search(cr, uid, [('partner_id','=',vals['partner_id'])], order="id desc", limit=1, context=context)
        history_record = self.browse(cr, uid, history_ids, context=context)
        total_prepare = history_record and history_record.balance or 0
        if 'type_exchange' in vals:
            if vals['type_exchange'] == 'addition':
                vals['balance'] = total_prepare + vals.get('amount_exchange',0)
            elif vals['type_exchange'] == 'subtraction':
                vals['balance'] = total_prepare - vals.get('amount_exchange',0)
        return super(res_partner_history_exchange, self).create(cr, uid, vals, context=context)
    
    
class res_partner_history_login(osv.osv):
    _name = 'res.partner.history.login'
    _description = "History Login of Partner"
    _order = 'date desc'
    _columns = {
        'date': fields.datetime('Login Date'),
        'ip': fields.char('IP Address'),
        'partner_id': fields.many2one('res.partner', 'Member', ondelete='cascade'),
    }
