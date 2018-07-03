#!/bin/sh
`sh -c "sync; echo 3 > /proc/sys/vm/drop_caches"`
`find /var/log -type f -name "*.gz" -delete`
`/etc/cron.daily/logrotate`
`rm -rfv /var/log/postgresql/*`


