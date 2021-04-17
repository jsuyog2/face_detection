var fs = require('fs');
module.exports = {
    saveimg: function (req, res) {
        var img = req.body.imgBase64;
        var name = req.body.name;
        var data = img.replace(/^data:image\/\w+;base64,/, "");
        var buf = Buffer.from(data, 'base64');
        var dir = `public/tests/${name}`
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.readdir(dir, (err, files) => {
            var fileName = 'face' + ' (' + (files.length + 1) + ')';
            fs.writeFile(`${dir}/${fileName}.png`, buf, function (err) {
                if (err) {
                    res.send({
                        "statusCode": 500,
                        "error": err,
                    });
                } else {
                    res.send({
                        "statusCode": 200,
                        "message": "success"
                    })
                    // fs.readFile('public/script/data.js', function (err, file) {
                    //     if (err) {
                    //         res.send({
                    //             "statusCode": 500,
                    //             "error": err,
                    //         });
                    //     } else {
                    //         var og = file.toString();
                    //         var add = og.splice(file.toString().lastIndexOf("]"), 0, ",'" + name + "'");
                    //         fs.writeFile('public/script/data.js', add, function (err) {
                    //             if (err) {
                    //                 res.send({
                    //                     "statusCode": 500,
                    //                     "error": err,
                    //                 });
                    //             } else {
                    //                 res.send({
                    //                     "statusCode": 200,
                    //                     "message": "success"
                    //                 })
                    //             }
                    //         });
                    //     }
                    // });
                }
            });
        });
    }
}

String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};