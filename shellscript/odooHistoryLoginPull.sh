#!/bin/sh
`sh -c "pkill -9 -f /opt/mua5k/shellscript/odoo_recieve_history.py"`
`sh -c "python /opt/mua5k/shellscript/odoo_recieve_history.py"`
`sh -c "sync; echo 3 > /proc/sys/vm/drop_caches"`
`echo "login" >> /home/ubuntu/text.txt`
