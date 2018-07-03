server {
        listen 80;
        listen [::]:80;

        server_name  mua5k.com 5kmua.com;

        location / {
                proxy_pass              http://127.0.0.1:9979;
                proxy_pass_header       Accept;
                proxy_pass_header       Server;
                proxy_http_version      1.1;
                keepalive_requests      1000;
                keepalive_timeout       360s;
                proxy_read_timeout      360s;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "upgrade";
		proxy_set_header Host $host;
        }
}
