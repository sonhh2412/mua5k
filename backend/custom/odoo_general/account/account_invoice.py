# -*- coding: utf-8 -*-

from openerp import models, fields, api, _
from lxml import etree

class account_invoice(models.Model):
    _inherit = "account.invoice"
    
    @api.model
    def fields_view_get(self, view_id=None, view_type=False, toolbar=False, submenu=False):
        context = self._context

        def get_view_id(xid, name):
            try:
                return self.env['ir.model.data'].xmlid_to_res_id('account.' + xid, raise_if_not_found=True)
            except ValueError:
                try:
                    return self.env['ir.ui.view'].search([('name', '=', name)], limit=1).id
                except Exception:
                    return False    # view not found

        if context.get('active_model') == 'res.partner' and context.get('active_ids'):
            partner = self.env['res.partner'].browse(context['active_ids'])[0]
            if not view_type:
                view_id = get_view_id('invoice_tree', 'account.invoice.tree')
                view_type = 'tree'
            elif view_type == 'form':
                if partner.supplier and not partner.customer:
                    view_id = get_view_id('invoice_supplier_form', 'account.invoice.supplier.form')
                elif partner.customer and not partner.supplier:
                    view_id = get_view_id('invoice_form', 'account.invoice.form')

        res = super(account_invoice, self).fields_view_get(view_id=view_id, view_type=view_type, toolbar=toolbar, submenu=submenu)

        # adapt selection of field journal_id
        for field in res['fields']:
            if field == 'journal_id' and context.get('journal_type'):
                journal_select = self.env['account.journal']._name_search('', [('type', '=', context['journal_type'])], name_get_uid=1)
                res['fields'][field]['selection'] = journal_select

        doc = etree.XML(res['arch'])

        if context.get('type'):
            for node in doc.xpath("//field[@name='partner_bank_id']"):
                if context['type'] == 'in_refund':
                    node.set('domain', "[('partner_id.ref_companies', 'in', [company_id])]")
                elif context['type'] == 'out_refund':
                    node.set('domain', "[('partner_id', '=', partner_id)]")

        if view_type == 'search':
            if context.get('type') in ('out_invoice', 'out_refund'):
                for node in doc.xpath("//group[@name='extended filter']"):
                    doc.remove(node)

        if view_type == 'tree':
            partner_string = _('Member')
            if context.get('type') in ('in_invoice', 'in_refund'):
                partner_string = _('Supplier')
                for node in doc.xpath("//field[@name='reference']"):
                    node.set('invisible', '0')
            for node in doc.xpath("//field[@name='partner_id']"):
                node.set('string', partner_string)

        res['arch'] = etree.tostring(doc)
        return res