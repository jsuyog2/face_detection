const insertFaceID = () => {
    return `INSERT INTO public.face_data(face_id, face_name, description) VALUES ($1,$2,$3);
`;
}
const getFaceID = () => {
    return `SELECT count(face_id) FROM public.face_data;
`;
}
module.exports = {
    add_data: function (req, res) {
        var client = req.app.get('client'); //db client connect

        //query for authentication

        client.query(getFaceID(), [], function onResult(err, result) {
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
                        "error": "Check The Query"
                    });
                } else {
                    var totalValues = 'face' + (parseInt(result.rows[0].count, 10) + 1)
                    client.query(insertFaceID(), [totalValues, req.body.face_name, req.body.description], function onResult(err, result) {
                        //show error if query failed
                        if (err) {
                            res.send({
                                "statusCode": 500,
                                "error": "Internal Server Error",
                                "message": "unable to connect to database server."
                            });
                        } else {
                            res.send({
                                "statusCode": 200,
                                "face_id": totalValues,
                                "message": "Success New Face Added In Database"
                            })
                        }
                    });

                }
            }
        })
    }
}