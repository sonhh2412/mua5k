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


import xmlrpclib
import pika
import time
import ConfigParser
Config = ConfigParser.ConfigParser()
Config.read("/home/user/git/lama/customize/lama_queue_process/config.ini")

def ConfigSectionMap(section):
    dict1 = {}
    options = Config.options(section)
    for option in options:
        try:
            dict1[option] = Config.get(section, option)
            if dict1[option] == -1:
                print ("skip: %s" % option)
        except:
            print("exception on %s!" % option)
            dict1[option] = None
    return dict1

host= ConfigSectionMap("ClusterOne")['host']

def odoo_pushPrice(addr='http://127.0.0.1', port=8069, dbname='mycompany', data={}):
    time.sleep(1)
    try:
        result = xmlrpclib.ServerProxy('%s:%s/xmlrpc/object' % (addr, port)).execute(
            dbname, int(ConfigSectionMap("OdooAccount")['uid']), ConfigSectionMap("OdooAccount")['password'], 'general.rpc.price', 'write', [1], data )    
        return result
    except:
        return False
     
odoo_pushPrice(addr=ConfigSectionMap("OdooAccount")['host'],port=int(ConfigSectionMap("OdooAccount")['port']), dbname=ConfigSectionMap("OdooAccount")['db'],data={}) 


    


# send message
