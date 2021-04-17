var fs = require('fs');
module.exports = {
    getfiles: function (req, res) {
        var dir = `public/tests/`
        fs.readdir(dir, (err, files) => {
            if (err) {
                res.send({
                    "statusCode": 500,
                    "error": err,
                });
            } else {
                res.send(files);
            }
        });
    }
}