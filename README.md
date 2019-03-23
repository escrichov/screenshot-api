# Screenshot API

Screenshot API.

## Getting started

Install dependencies
```
npm install
```

Start server
```
npm start
```

## API

Capture Url:
```
GET /api?url=https://google.com&height=500&width=500&lang=en-US&type=png
```
Returns:
```
Image
```

## Create Daemon

Setup
```
sudo npm install pm2@latest -g
pm2 start server.js
pm2 startup systemd
pm2 save
```

View status
```
pm2 status
```

## Setup Nginx proxy

Install Nginx
```
sudo apt update
sudo apt install nginx
```

Remove default configuration
```
rm /etc/nginx/sites-available/default
rm /etc/nginx/sites-enabled/default
```

Create new domain
```
cp nginx-domain.conf to /etc/nginx/sites-available/example.com
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
```

Setup Firewall
```
sudo ufw allow 'Nginx Full'
sudo ufw allow 'OpenSSH'
sudo ufw enable
```

Automatic Certificate
```
sudo add-apt-repository ppa:certbot/certbot
sudo apt update
sudo apt install python-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
# Intro your email
# Select 2 (Redirect http to https)
sudo certbot renew --dry-run # Check auto renew
```

Update configuration to use http2
```
# Change these lines
# listen [::]:443 ssl ipv6only=on;
# listen 443 ssl;
# to:
listen [::]:443 ssl http2 ipv6only=on;
listen 443 ssl http2;
```
