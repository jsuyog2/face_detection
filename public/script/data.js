let classes = [];
$.ajax({
    type: "POST",
    url: "http://127.0.0.1:8000/getfiles",
    async: false,
    success: function (o) {
        classes = o;
    }
});