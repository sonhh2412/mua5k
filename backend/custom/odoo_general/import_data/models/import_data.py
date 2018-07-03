# -*- coding:utf-8 -*-

from openerp.osv import osv, fields
from openerp.tools.translate import _
from openerp.tools import SUPERUSER_ID
from openerp.api import Environment
from datetime import datetime
from datetime import timedelta
import xlrd
import base64
import thread
import os
import time
import types
import logging
log = logging.getLogger(__name__)

SELECTION_STATE = [('new', 'New'),
               ('processing', 'Processing'),
               ('error', 'Error'),
               ('done', 'Done')]

class import_data(osv.osv):
    _name = 'import.data'
    _order = 'id desc'
    _description = 'Import Data'

    def _count_status(self, cr, uid, ids, fieldnames, arg,context=None):
        Sheet = self.pool['import.data.status']
        return {
            import_id: Sheet.search_count(cr,uid, [('import_id', '=', import_id)], context=context)
            for import_id in ids
        }
    
    _columns = {
        'name': fields.char('Name', size=256),
        'model_name': fields.char('Model Name', size=256),
        'model_id': fields.many2one('ir.model', 'Object'),
        'create_date': fields.datetime('Create date'),
        'create_uid': fields.many2one('res.users', 'Created by'),
        'file_import': fields.binary('File select', filters='*.xls', required=1),
        'file_name': fields.char('File name', size=255),
        'total_row': fields.integer('Total record import'),
        'current_row': fields.integer('Current row in file'),
        'success_row': fields.integer('Total success record'),
        'read_count': fields.function(_count_status, string='Count of list status', type='integer'),
        'state': fields.selection(SELECTION_STATE, 'State'),
        'status_ids': fields.one2many('import.data.status','import_id','Status import'),
    }

    _defaults = {
        'state': 'new',
    }


    def default_get(self, cr, uid, fields, context=None):
        if context is None:
            context = {}
        res = super(import_data, self).default_get(cr, uid, fields, context=context)
        if context.has_key('model_create'):
            model_ids = self.pool.get('ir.model').search(cr, uid, [('model','=',context.get('model_create'))], context=context)
            res.update({'model_id': model_ids and model_ids[0] or False})
        return res


    def get_fields_name(self, cr, uid, first_rows, first_cols, ncols, context=None):
        # the first column is STT of row
        return first_rows[first_cols:ncols]


    def compute_data_field_one2many(self, cr, uid, data_one2many, context=None):
        result = {}
        if not data_one2many or type(data_one2many) != type({}):
            return result
        for key, val in data_one2many.iteritems():
            result[key] = [(0, 0, val)]
        return result


    def check_required_field(self, cr, uid, fields_name_in_excel, fields_name, row, REQUIRED_FIELD, context=None):
        inconsistance_fields = []
        for index, field_name in enumerate(fields_name):            
            field_value = u"%s" % row[index]
            field_value = field_value.strip()
            if field_value == 'False':
                field_value = ''
            if field_name in REQUIRED_FIELD and not field_value:
                inconsistance_fields.append(fields_name_in_excel[index])
        if inconsistance_fields:
            return_message = "The fields must is required: %s" % ",".join(inconsistance_fields)
            return return_message
        return ""
    
    
    def get_domain_field_many2one(self, cr, uid, model, field_value, FIELD_NAME=[], context=None):
        field_obj = self.pool.get('ir.model.fields')
        domain = []
        operation_domain = []
        if not FIELD_NAME:
            if model in ('product.product', 'product.template'):
                FIELD_NAME = ['default_code','name', 'ean13']
            else:
                FIELD_NAME = ['code','name']
        for field in FIELD_NAME:
            field_ids = field_obj.search(cr, SUPERUSER_ID, [('model', '=', model),
                                                            ('name', '=', field)], limit=1, context=context)
            if field_ids:
                domain.append((field, 'ilike', field_value))
                operation_domain.append('|')
        operation_domain.pop()
        return operation_domain + domain


    def check_required_for_special_field(self, field_name, vals_fields, required_special={}, context=None):
        message = ""
        if not required_special.get(field_name) is None:
            for required in required_special.get(field_name):
                m_temp = ""
                if required in vals_fields:
                    if type(vals_fields[required]) not in (types.IntType,types.FloatType,types.BooleanType) and vals_fields[required] == False:
                        m_temp = "Value of field %s - %s must be required!" % (field_name, required)
                else:
                    m_temp = "Value of field %s.%s must be required!" % (field_name, required)
                if len(m_temp):
                    message += len(message) == 0 and m_temp or "\n" + m_temp
        return message

        
    def save_file(self, name, value):
        type_path = '/tmp/file_10k'
        if not os.path.exists(type_path):
            os.mkdir(type_path)
        path = '%s/%s' % (type_path,name)       
        f = open( path, 'wb+' )
        try:
            f.write( base64.decodestring( value ) )
        finally:
            f.close()
        return path
    
    
    def xldate_to_datetime(self, xldate):
        tempDate = datetime(1900, 1, 1)
        tempDate = tempDate - timedelta(days=1)
        deltaDays = timedelta(days=int(xldate))
        secs = (int((xldate%1)*86400)-60)
        detlaSeconds = timedelta(seconds=secs)
        TheTime = (tempDate + deltaDays + detlaSeconds )
        return TheTime.strftime("%Y-%m-%d")
    
    
    def create_detail_import(self, cr, uid, detail_pool=None, import_id=False, row=0, message='', status='success', context=None):
        if detail_pool is None:
            detail_pool = self.pool.get('import.data.status')
        vals = {
            'import_id': import_id,
            'row_number': row,
            'message': message,
            'status': status,
                }
        detail_id = detail_pool.create(cr, uid, vals, context=context)
        cr.commit()
        return detail_id
    
    
    def get_value_without_zeros(self, temp_value=False):
        try:
            if temp_value % 1 == 0:
                temp_value = '%.f' % temp_value
        except Exception:
            temp_value = temp_value.strip()
        return temp_value
    
    
    def get_decimal_without_zeros(self, temp_cell=False):
        temp_value = False
        if temp_cell:
            temp_value = temp_cell.value
            try:
                if temp_cell.ctype == 2 and temp_cell.value % 1 == 0:
                    temp_value = '%.f' % temp_cell.value
            except Exception:
                pass
        return temp_value
    
    
    def search_id_with_table(self, cr, uid, model_pool=None, fieldname=False, xvalue=False, context=None):
        try:
            domain = [('%s' % fieldname, '=', '%s' % xvalue)]
            item = model_pool.search(cr, uid, domain, limit=1, context=context)
            if item:
                return item[0]
        except Exception:
            pass
        return False
    
    
    def get_date_with_true_format(self, cr, uid, temp_cell=False, detail_pool=None, import_id=False, row=0, columns_index=False, status='fail', context=None):
        if temp_cell.ctype != 3:
            message = u'Value of Cell [%s:%d] must be has format with date !' % (columns_index,row+1)
#             self.create_detail_import(cr, uid, detail_pool=detail_pool, import_id=import_id, row=row, message=message, status=status, context=context)
            raise Exception(message)
        date_value = False
        if temp_cell.value:
            date_value = self.xldate_to_datetime(temp_cell.value)
        return date_value
    
    
    def get_selection_of_field(self, cr, uid, field_name=False, model=False, context=None):
        dict_temp =  {}
        try:
            dict_temp = dict(self.pool.get(model).fields_get(cr, uid, [field_name], context=context)[field_name]['selection'])
        except Exception:
            pass
        return dict_temp
    
    
    def check_value_with_selection(self, cr, uid, temp_value=False, field_name=False, model=False, context=None):
        selection_temp = self.get_selection_of_field(cr, uid, field_name=field_name, model=model, context=context)
        if temp_value and temp_value in selection_temp.values():
            return True
        return False
    
    
    def get_key_with_selection(self, cr, uid, temp_value=False, field_name=False, model=False, context=None):
        selection_temp = self.get_selection_of_field(cr, uid, field_name=field_name, model=model, context=context)
        if temp_value:
            if temp_value in selection_temp.values():
                for i,x in enumerate(selection_temp.values()):
                    if x == temp_value:
                        return selection_temp.keys()[i]
            if temp_value in selection_temp.keys():
                for i,x in enumerate(selection_temp.keys()):
                    if x == temp_value:
                        return selection_temp.keys()[i]
        return False  
    
    
    def get_value_with_selection(self, cr, uid, temp_cell=False, field_name=False, model=False, detail_pool=None, import_id=False, row=0, columns_index=False, status='fail', context=None):
        selection_temp = self.get_selection_of_field(cr, uid, field_name=field_name, model=model, context=context)
        if temp_cell.value:
            if temp_cell.value in selection_temp.values():
                return temp_cell.value
            else:
                str_values = ''
                for value in selection_temp.values():
                    value = value.encode('utf-8').decode('utf-8')
                    str_values += len(str_values) == 0 and value or ','+value
                message = u'Value of Cell[%s:%d] must be is a item of selection [' % (columns_index, row) + str_values + u']'
#                 self.create_detail_import(cr, uid, detail_pool=detail_pool, import_id=import_id, row=row, message=message, status=status, context=context)
                raise Exception(message)
        return False
    
    
    def check_required_value(self, cr, uid, temp_value=False, detail_pool=None, import_id=False, row=0, columns_index=False, status='fail', context=None):
        if not temp_value:
            message = u'Value of Cell[%s:%d] must be required !' % (columns_index, row+1)
#             self.create_detail_import(cr, uid, detail_pool=detail_pool, import_id=import_id, row=row, message=message, status=status, context=context)
            raise Exception(message)
            return False
        return temp_value
    
    
    def get_boolean_value(self, cr, uid, temp_cell=False, detail_pool=None, import_id=False, row=0, columns_index=False, status='fail', context=None):
        result = False
        if temp_cell.value:
            if temp_cell.value == 1:
                result = True
            elif temp_cell.value == 0:
                result = False
            else:
                message = u'Value of Cell[%s:%d] must be Boolean: False (0), True (1) !' % (columns_index, row+1)
#                 self.create_detail_import(cr, uid, detail_pool=detail_pool, import_id=import_id, row=row, message=message, status=status, context=context)
                raise Exception(message)
        return result
    
    
    def check_float_value(self, cr, uid, temp_value=False, detail_pool=None, import_id=False, row=0, columns_index=False, status='fail', context=None):
        if temp_value:
            try:
                temp_value = float(temp_value)
            except Exception:
                message = u'Value of Cell[%s:%d] not is number !' % (columns_index, row+1)
                raise Exception(message)
        return temp_value
    
    
    def check_value_many2many(self, cr, uid, temp_value=False, model=False, field_name=False, context=None):
        res=[]
        name_wrong = ''
        if temp_value:
            list_value= temp_value.split(',')
            res=[]
            for value in list_value:
                res_id = self.search_id_with_table(cr, uid, model_pool=self.pool.get(model), fieldname=field_name, xvalue=value, context=context)
                if res_id:
                    res.append(res_id)
                else:
                    name_wrong += len(name_wrong) and ',%s' % value or '%s' % value
        return res, name_wrong
    
    
    def get_value_one_cell(self, cr, uid, cell_value, field, temp_cell, field_parent=False, context=None):
        if not context:
            context = {}
        res = {
            'cell_value': False,
            'message': "",
               }
        message = ''
        import_obj = self.pool.get('import.data')
        if field.required and not cell_value:
            message = "Value: %s for field: %s must be required in system" % (cell_value, field.name)
        elif field.ttype == 'many2one':
            model_obj = self.pool.get(field.relation)
            domain = import_obj.get_domain_field_many2one(cr, uid, field.relation, cell_value, context=context)
            model_ids = model_obj.search(cr, uid, domain, context=context)
            if model_ids:
                res['cell_value'] = model_ids[0]
            else:
                if field.relation == 'stock.picking.type':
                    split_values = cell_value.split(':')
                else:
                    split_values = cell_value.split('/')
                value_domain = split_values[-1]
                domain = import_obj.get_domain_field_many2one(cr, uid, field.relation, value_domain.strip(), context=context)                
                model_ids = model_obj.search(cr, uid, domain, context=context)
                find_item = False
                for nget in self.pool.get(field.relation).name_get(cr, uid, model_ids, context=context):
                    if nget[1].strip() == cell_value.strip():
                        res['cell_value'] = nget[0]
                        find_item = True
                        break
                if not find_item:
                    message = "Value: %s for field: %s not found in system" % (cell_value, (field_parent and field_parent+'.'+field.name or field.name))
        elif field.ttype == 'many2many':
            model_obj = self.pool.get(field.relation)
            split_values = cell_value.split(',')
            message_many2many = []
            many2many_ids = []
            for split_value in split_values:
                domain = import_obj.get_domain_field_many2one(cr, uid, field.relation, split_value.strip(), context=context)                
                model_ids = model_obj.search(cr, uid, domain, context=context)
                if model_ids:
                    many2many_ids.append(model_ids[0])
                else:
                    if field.relation == 'stock.picking.type':
                        split_value_child = split_value.split(':')
                    else:
                        split_value_child = split_value.split('/')
                    value_domain = split_value_child[-1]
                    domain = import_obj.get_domain_field_many2one(cr, uid, field.relation, value_domain.strip(), context=context)
                    model_ids = model_obj.search(cr, uid, domain, context=context)
                    find_item = False
                    for nget in self.pool.get(field.relation).name_get(cr, uid, model_ids, context=context):
                        if nget[1].strip() == split_value.strip():
                            many2many_ids.append(nget[0])
                            find_item = True
                            break
                    if not find_item:
                        message_many2many.append(split_value)
            if message_many2many:
                str_values = ''
                for value in message_many2many:
                    value = value.encode('utf-8').decode('utf-8')
                    str_values += len(str_values) == 0 and value or ','+value
                message = "Value: %s for field: %s not found in system!" % (str_values, field.name)
            else:
                if field_parent:
                    res['cell_value'] = [(6,0,many2many_ids)]
                else:
                    res['cell_value'] = many2many_ids
        elif field.ttype == 'selection':
            key_selection = import_obj.get_key_with_selection(cr, uid, temp_value=cell_value, field_name=field.name, model=field.model, context=context)
            if key_selection:
                res['cell_value'] = key_selection
            else:
                message = "Value: %s for field: %s not found in selection in system!" % (cell_value, field.name)
        elif field.ttype not in ['many2many', 'one2many', 'reference']:
            if field.ttype == 'boolean':
                try:
                    cell_value = int(cell_value)
                    if cell_value not in [0,1]:
                        message = "Value for field: %s must be 0 or 1 !" % (field.name)
                except Exception:
                    message = "Value for field: %s must be 0 or 1 !" % (field.name)
                cell_value = bool(cell_value)
            elif field.ttype == 'float':
                try:
                    cell_value = float(cell_value)
                except Exception:
                    message = "Value for field: %s must be number !" % (field.name)
            elif field.ttype == 'integer':
                try:
                    cell_value = int(cell_value)
                except Exception:
                    message = "Value for field: %s must be integer !" % (field.name)
            elif field.ttype == 'datetime' or field.ttype == 'date':
                if temp_cell.ctype != 3:
                    message = "Value for field: %s must be has format with date !" % (field.name)
                else:
                    cell_value = import_obj.xldate_to_datetime(temp_cell.value)
            res['cell_value'] = cell_value
        res['message'] = message
        return res

    
    def get_values_one_row(self, cr, uid, row, fields_name, model_id, sheet, row_index, context=None):
        if not context:
            context = {}            
        res = {
            'values': {},
            'success': True,
            'message': "",
        }
        data_one2_many = {}
        key_many2one = []
        m2m_keys = []
        message = ""
        import_obj = self.pool.get('import.data')
        ir_model_obj = self.pool.get('ir.model')
        field_obj = self.pool.get('ir.model.fields')
        context_temp = context.copy()
        context_temp.update({
                    'active_test': False
                })
        for index, field_name in enumerate(fields_name):
            split_field_name = field_name.split('.')
            field_ids = field_obj.search(cr, SUPERUSER_ID, [('name', '=', split_field_name[0]),
                                                            ('model_id', '=', model_id)], context=context)
            if not field_ids:
                continue
            temp_cell = sheet.cell(row_index,index+1)
            field_value = import_obj.get_value_without_zeros(temp_value=temp_cell.value)
            
            field = field_obj.browse(cr, SUPERUSER_ID, field_ids[0], context=context)
            if temp_cell.ctype == xlrd.XL_CELL_EMPTY:
                continue
            values_get = {}
            if (field.ttype == 'one2many' or field.ttype == 'many2one') and len(split_field_name) > 1:
                if field.ttype == 'one2many':
                    if field.name not in data_one2_many:
                        data_one2_many[field.name] = {}
                else:
                    if field.name not in key_many2one:
                        key_many2one.append(field.name)
                        if not res['values'].get(field.name) is None:
                            res['values'].update({field.name: {'relation': field.relation, 'values': {}},})
                        else:
                            res['values'][field.name] = {'relation': field.relation, 'values': {}}
                field_model_ids = ir_model_obj.search(cr, SUPERUSER_ID, [('model','=',field.relation)], context=context)
                if field_model_ids:
                    field_child_ids = field_obj.search(cr, SUPERUSER_ID, [('name','=', split_field_name[1]),
                                                                          ('model_id','=',field_model_ids[0])], context=context)
                    if field_child_ids:
                        field_child = field_obj.browse(cr, SUPERUSER_ID, field_child_ids[0], context=context)
                        values_get = import_obj.get_value_one_cell(cr, uid, field_value, field_child, temp_cell, field_parent=field.name, context=context_temp)
                        if field.ttype == 'one2many':
                            data_one2_many[field.name].update({split_field_name[1]: values_get.get('cell_value', False)})
                        else:
                            res['values'][field.name]['values'].update({split_field_name[1]: values_get.get('cell_value', False)})
            else:
                values_get = import_obj.get_value_one_cell(cr, uid, field_value, field, temp_cell, context=context_temp)
                if field.ttype == 'many2many':
#                     import pdb
#                     pdb.set_trace()
                    if field.name not in m2m_keys:
                        m2m_keys.append(field.name)
                    res['values'].update({
                        field.name: values_get.get('cell_value', False)
                                          })
                else:
                    res['values'][field.name] = values_get.get('cell_value', False)
            if values_get.get('message', False):
                res.update({
                        'success': False,
                            })
                message += len(message) == 0 and values_get.get('message', "") or "\n" + values_get.get('message', "")
        res['key_many2one'] = key_many2one
        res['m2m_keys'] = m2m_keys
        res['field_one2many'] = data_one2_many.keys()
        for o2m_key in res['field_one2many']:
            res['values'][o2m_key] = [(0, 0, data_one2_many[o2m_key])]
        res['message'] = message
        return res
    
    
    
    def thread_general_import_common(self, cr, uid, ids, sheet, required_fields, o2m_required_fields, context=None):
        context.update({'active_test':False})
        import_obj = self.pool.get('import.data')
        with Environment.manage():
            try:
                new_cr = self.pool.cursor()
                for record in import_obj.browse(new_cr, uid, ids, context=None):
                    record.status_ids.unlink()
                    create_pool = self.pool.get(record.model_id.model)
                    model_id = record.model_id.id
                    path = self.save_file(record.file_name, record.file_import)
                    try:   
                        book=xlrd.open_workbook(path) 
                    except:
                        self.create_detail_import(new_cr, uid, import_id=record.id, message='Not found file!. Please check path....', status='fail')
                    finally:
                        pass
                
                    sheet=book.sheet_by_index(0)
                    from_row = 3                
                    total_row = 0
                    mess_temp = ""
                    for r in range(from_row, sheet.nrows):
                        if sheet.cell(r,0).value:
                            try:
                                int(sheet.cell(r,0).value)
                                total_row += 1
                            except Exception:
                                mess_line = "Row %s in columns A must be integer" % r
                                mess_temp += len(mess_temp) == 0 and mess_line or "\n" + mess_line
                    if len(mess_temp) or total_row == 0:
                        if len(mess_temp):
                            import_obj.create_detail_import(new_cr, uid, import_id=record.id, row=0, message=mess_temp, status='fail')
                        else:
                            import_obj.create_detail_import(new_cr, uid, import_id=record.id, row=0, message="Don't have row has value in columns A", status='fail')
                        raise Exception(mess_temp)
                    
                    val = {'state': 'processing', 'current_row': 0, 'total_row': total_row}
                    if context.get('from_row', False):
                        val.update({'current_row': context.get('from_row',0)})
                        from_row += context.get('from_row',0)
                    import_obj.write(new_cr, uid, record.id, val, context=context)
                    new_cr.commit()
                    
                    row_counter = 2
                    success_row = 0
                    current_row = 0
                    fields_name = import_obj.get_fields_name(new_cr, uid, sheet._cell_values[0], 1, sheet.ncols, context=context)
                    fields_name_in_excel = import_obj.get_fields_name(new_cr, uid, sheet._cell_values[1], 1, sheet.ncols, context=context)
#                     list_missing = map(lambda x:x, [x for x in required_fields if x not in fields_name])
                    list_missing = []
                    if list_missing:
                        str_list_missing = ""
                        for missing in list_missing:
                            value = missing.encode('utf-8').decode('utf-8')
                            str_list_missing += len(str_list_missing) == 0 and value or ','+value
                        import_obj.create_detail_import(new_cr, uid, import_id=record.id, row=current_row, message='Missing columns required: [%s]. Please check again!' % str_list_missing, status='fail')
                    else:
                        is_child = False
                        data_temp = {}
                        message = ""
                        success = True
                        for row in sheet._cell_values[from_row:]:
                            row_counter += 1
                            next_row = row_counter + 1 < sheet.nrows and row_counter + 1 or row_counter
                            if current_row == 0:
                                current_row = row_counter + 1
                            required_mess = import_obj.check_required_field(new_cr, uid, fields_name_in_excel, fields_name, row[1:], required_fields, context=None)
                            if required_mess and not is_child and sheet.cell(row_counter, 0).value:
                                import_obj.create_detail_import(new_cr, uid, import_id=record.id, row=row[0], message=required_mess, status='fail')
                            else:
                                if not (is_child or sheet.cell(row_counter, 0).value):
                                    line_message = "Row %s in file is child content of parent row has value in columns A before !" % (row_counter + 1)
                                    message += len(message) == 0 and line_message or "\n" + line_message
                                    if sheet.cell(next_row, 0).value:
                                        import_obj.create_detail_import(new_cr, uid, import_id=record.id, row=current_row, message=message, status='fail')
                                        message = ""
                                        current_row = 0
                                    continue                           
                                data = import_obj.get_values_one_row(new_cr, uid, row[1:], fields_name, model_id, sheet, row_counter, context=context)
                                vals_create = data.get('values', {})
                                for field_o2m in data.get('field_one2many', []):
                                    o2m_value = vals_create.get(field_o2m, [])
                                    if o2m_value:
                                        message_temp_child_o2m = import_obj.check_required_for_special_field(field_o2m, o2m_value[0][2], o2m_required_fields, context=None)
                                        if message_temp_child_o2m:
                                            message_tmp = data.get('message', "")
                                            message_tmp += len(message_tmp) == 0 and message_temp_child_o2m or "\n" + message_temp_child_o2m
                                            data.update({
                                                    'message': message_tmp
                                                         })
                                        if data_temp:
                                            if field_o2m in data_temp:
                                                data_temp[field_o2m].append(o2m_value[0])
                                            else:
                                                data_temp.update({field_o2m:o2m_value})
                                for m2m_key in data.get('m2m_keys', []):
                                    m2m_value = vals_create.get(m2m_key,False)
                                    if m2m_value:
                                        if data_temp:
                                            if m2m_key not in data_temp:
                                                data_temp.update({m2m_key : [(6,0,[])]})
                                            data_temp[m2m_key][0][2].append(m2m_value)
                                        else:
                                            vals_create[m2m_key] = [(6,0,[m2m_value])]
                                if not sheet.cell(next_row, 0).value:
                                    if not is_child:
                                        is_child = True
                                        data_temp = vals_create
                                        current_row = current_row
                                        success = data.get('success', False)
                                    if row_counter + 1 == sheet.nrows:
                                        is_child = False
                                else:
                                    is_child = False
                                    if not data_temp:
                                        data_temp = vals_create
                                        success = data.get('success', False)
                                if data.get('message', "") != "":
                                    message += len(message) == 0 and data.get('message', "") or "\n" + data.get('message', "")
                                    success = False
                                if not is_child:
                                    if success:
                                        try:
                                            if data.get('key_many2one',[]):
                                                message_temp = ""
                                                for key_m2o in data.get('key_many2one',[]):
                                                    message_temp_child = import_obj.check_required_for_special_field(key_m2o, data_temp[key_m2o]['values'], o2m_required_fields, context=None)
                                                    if len(message_temp_child):
                                                        message_temp += len(message_temp) == 0 and message_temp_child or "\n" + message_temp_child
                                                    if not len(message_temp):
                                                        m2o_id = self.pool.get(data_temp[key_m2o]['relation']).create(new_cr, uid, data_temp[key_m2o]['values'], context=context)
                                                        data_temp[key_m2o] = m2o_id
                                                if len(message_temp):
                                                    raise Exception(message_temp)
                                            create_pool.create(new_cr, uid, data_temp, context=context)
                                            import_obj.create_detail_import(new_cr, uid, import_id=record.id, row=current_row, message='Import line success.')
                                            new_cr.commit()
                                            success_row += 1
                                        except Exception as excep:
                                            new_cr.rollback()
                                            import_obj.create_detail_import(new_cr, uid, import_id=record.id, row=current_row, message=excep.message or excep.value, status='fail')
                                    else:
                                        import_obj.create_detail_import(new_cr, uid, import_id=record.id, row=current_row, message=message, status='fail')                                             
                            import_obj.write(new_cr, uid, record.id, {'current_row': current_row,'success_row': success_row}, context=context)
                            new_cr.commit()
                            if not is_child:
                                data_temp = {}
                                message = ""
                                current_row = 0
                    import_obj.write(new_cr, uid, record.id, {'state': 'done'}, context=context)
                    new_cr.commit()
            except Exception as excep:
                log.exception(excep)
                import_obj.create_detail_import(new_cr, uid, import_id=record.id, row=row[0], message=excep.message or excep.value, status='fail')
                import_obj.write(new_cr, uid, record.id, {'state': 'error'}, context=context)
                new_cr.commit()
                log.info(excep)
            finally:
                new_cr.close()
        return True


    def act_call_read_excel_thread(self, cr, uid, ids, context = None):
        log.info('Begin: import_excel_thread')
        field_obj = self.pool.get('ir.model.fields')
        if context is None:
            context = {}
        if not isinstance(ids, list):
            ids = [ids]
        for data in self.browse(cr, uid, ids, context=context):
            if not data.model_id:
                raise osv.except_osv('Error !', 'Dont have model to import')
            if not data.file_import:
                raise osv.except_osv('Validation Error !', 'Dont have file excel to import')
            base_data = base64.decodestring(data.file_import)
            row_book = False
            try:
                row_book = xlrd.open_workbook(file_contents=base_data)
            except:
                raise osv.except_osv('Error!', 'Format error. Please change file format from xlsx to xls.')
            sheet = row_book.sheet_by_index(0)
            if sheet.ncols == 0:
                raise osv.except_osv('Validation Error !', 'Please check file Import. File is Empty!')
            model_hold_method = self.pool.get(context.get('model_hold_method','import.data'))
            method_called = context.get('method_called','thread_general_import_common')
            if model_hold_method and hasattr(model_hold_method, method_called):
                required_ids = field_obj.search(cr, SUPERUSER_ID, [('model_id','=',data.model_id.id),('required','=',True)], context=context)
                list_required_tmp = [x.name for x in field_obj.browse(cr, uid, required_ids, context=context)]
                required_fields = list(set(list_required_tmp + context.get('required_fields',[])))
                if data.model_id.model == 'product.product':
                    index = 0
                    while index < len(required_fields):
                        f_name = required_fields[index]
                        if f_name in ('product_variant_ids','valuation','product_tmpl_id', 'created_date'):
                            required_fields.remove(f_name)
                        else:
                            index += 1
                o2m_required_fields = context.get('o2m_required_fields',{})
                o2m_field_ids = field_obj.search(cr, SUPERUSER_ID, [('model_id','=',data.model_id.id),('ttype','=','one2many')], context=context)
                for o2m_field in field_obj.browse(cr, SUPERUSER_ID, o2m_field_ids):
                    if o2m_field.name not in o2m_required_fields:
                        o2m_required_fields.update({o2m_field.name : []})
                    for o2m_key in o2m_required_fields.keys():
                        if o2m_key == o2m_field.name:
                            model_ids = self.pool.get('ir.model').search(cr, SUPERUSER_ID, [('model','=',o2m_field.relation)], limit=1, context=context)
                            if model_ids:
                                field_ids = self.pool.get('ir.model.fields').search(cr, SUPERUSER_ID, [('model_id','=',model_ids[0]),('required','=',True)], context=context)
                                list_required = [x.name for x in field_obj.browse(cr, SUPERUSER_ID, field_ids, context=context)]
                                o2m_required_fields[o2m_key] = list(set(o2m_required_fields[o2m_key] + list_required))
                            break
                method = getattr(model_hold_method, method_called)
                thread.start_new_thread(method, (cr, uid, [data.id], sheet, required_fields, o2m_required_fields, context))
            else:
                raise osv.except_osv('Error!', 'Not found method %s in model %s' % (method_called, model_hold_method))
        time.sleep(1.5)
        log.info('End: import_excel_thread')
        if not context.get('return_view',False):
            return True
        return self.return_form_view(cr, uid, ids, context=context)


    def return_form_view(self, cr, uid, id, context=None):
        mod_obj = self.pool.get('ir.model.data')
        module = context.get('module_temp')
        res_model = context.get('view_form_temp')
        res = mod_obj.get_object_reference(cr, uid, module, res_model)
        res_id = res and res[1] or False,
        return {
            'name': _('Import status'),
            'view_type': 'form',
            'view_mode': 'form',
            'view_id': [res_id],
            'res_model': context.get('res_model_temp'),
            'type': 'ir.actions.act_window',
            'nodestroy': True,
            'target': 'current',
            'res_id': id,
        }
    

class import_data_status(osv.osv):
    _name = 'import.data.status'
    _description = "Import Data Statis"
    _order = 'status asc, row_number desc'
    
    _columns = {
        'status': fields.selection([('success','Success'),('fail','Fail')], 'Status'),
        'import_id': fields.many2one('import.data', 'Import ID', ondelete='cascade'),
        'row_number': fields.integer('Row'),
        'id_data': fields.char('Id Data'),
        'message': fields.text('Message'),
    }
    