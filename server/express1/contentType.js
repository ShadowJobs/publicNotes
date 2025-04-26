const express = require('express');
const contentTypeRouter = express.Router()
const bodyParser = require('body-parser');
// const multer = require('multer');
// const upload = multer();

contentTypeRouter.use(bodyParser.json()); // for parsing application/json
contentTypeRouter.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// contentTypeRouter.use(upload.array()); // for parsing multipart/form-data

contentTypeRouter.post('/content-type', function (req, res) {
    try {
        let contentType = req.headers['content-type'];
        let urlParams = req.query;
        let data = {};
        if (contentType.includes('text/plain')) {
            let rawData = '';
            req.on('data', (chunk) => { rawData += chunk; });
            req.on('end', () => {
                try {
                    data = JSON.parse(rawData);
                    res.json({ "body": data, 'urlParams': urlParams });
                } catch (e) {
                    console.error(e);
                    res.status(500).send({ "msg": "error", 'code': 0 });
                }
            });
        } else {
            if (req.is('json')) {  // 判断是否为JSON数据
                data = req.body;
            } else if (contentType.includes('application/x-www-form-urlencoded')) {
                data = JSON.parse(Object.keys(req.body)[0]);
            } else if (contentType.includes('multipart/form-data')) {
                data = JSON.parse(req.body);
            } else {
                data = req.body;
            }
            res.json({ "body": data, 'urlParams': urlParams });
        }
    } catch (e) {
        console.error(e);
        res.status(500).send({ "msg": "error", 'code': 0 });
    }
});

contentTypeRouter.get('/content-type', function (req, res) {
    res.json({ "msg": "GET request received" });
});

module.exports = contentTypeRouter