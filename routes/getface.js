const getFaceID = () => {
    return `SELECT * FROM public.face_data WHERE face_id ilike $1;
`;
}

module.exports = {
    getface: function (req, res) {
        var client = req.app.get('client'); //db client connect

        //query for authentication
        
        client.query(getFaceID(), [req.body.faceid], function onResult(err, result) {
            //show error if query failed
            if (err) {
                res.send({
                    "statusCode": 500,
                    "error": "Internal Server Error",
                    "message": "unable to connect to database server."
                });
            } else {
                if (result.rows.length === 0) {
                    res.send({
                        "statusCode": 500,
                        "error": "Face Not Found"
                    });
                }else{
                    res.send(result.rows[0]);
                }
            }
        })
    }
}