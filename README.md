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

## Create Deamon

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
