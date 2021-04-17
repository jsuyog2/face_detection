init();
async function init() {
    $(".overlay").fadeIn();
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/')
    await faceapi.loadFaceLandmarkModel('/')
    await faceapi.loadFaceRecognitionModel('/')
    $(".overlay").fadeOut();
}


$("#submit").click(function (e) {
    var name = document.getElementById("face_name");
    var description = document.getElementById("description");
    var filesUpload = true;
    $(".UploadFile").each(function () {
        if (document.getElementById(this.id).files.length == 0) {
            filesUpload = false
        }
    })
    if ((name && name.value) && (description && description.value) && filesUpload) {
        addData(name.value, description.value)
    } else {
        swal("Oh noes!", "Some Values are missing", "error");
    }
})

$(".UploadFile").change(function (e) {
    $(".overlay").show();
    uploadQueryImage('#' + this.id, '#queryImg', '#queryImgOverlay')
});

async function uploadQueryImage(id, imgId, canvasId) {
    const imgFile = $(id).get(0).files[0]
    const img = await faceapi.bufferToImage(imgFile)
    $(imgId).get(0).src = img.src
    updateReferenceImageResults(id, imgId, canvasId)
}

async function updateReferenceImageResults(id, imgId, canvasId) {
    const inputImgEl = $(imgId).get(0)
    const canvas = $(canvasId).get(0)

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const fullFaceDescriptions = await faceapi.detectSingleFace(inputImgEl).withFaceLandmarks().withFaceDescriptor()

    if (!fullFaceDescriptions) {
        swal("Faces Not Found", "", "error");
        $(canvasId).hide();
        $(".overlay").fadeOut();
        return
    }
    var val = $(id).data('val')
    handleImage(fullFaceDescriptions.detection, "#imgCanvas" + val)
    $(".overlay").fadeOut();
}

function handleImage(detection, id) {
    $(id).empty();
    var x = detection.box.x;
    var y = detection.box.y;
    var height = detection.box.height;
    var width = detection.box.width;
    var storeCanvas = document.createElement("CANVAS");
    var ctx = storeCanvas.getContext('2d');
    storeCanvas.width = width;
    storeCanvas.height = height;
    var img = document.getElementById("queryImg");
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
    $(id).removeClass("imgdiv");
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = "white";
    ctx.globalAlpha = 1; // alpha 0 = no effect 1 = full effect
    ctx.fillRect(0, 0, storeCanvas.width, storeCanvas.height);

    ctx.globalCompositeOperation = "source-over";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000";
    ctx.strokeRect(0, 0, storeCanvas.width, storeCanvas.height);

    $(id).append(storeCanvas);
    storeCanvas.style.height = '100px';
}

function addData(name, description) {
    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:8000/add_data",
        data: {
            face_name: name,
            description: description
        },
        async: false,
        success: function (o) {
            switch (o.statusCode) {
                case 200:
                    $(".UploadFile").each(function (params) {
                        var canvas = $("#imgCanvas" + (params + 1) + " canvas")[0]
                        if (canvas) {
                            addFace(o.face_id, canvas)
                        }
                    })
                    swal("Save Successfully", "Store your test", "success").then((value) => {
                        location.reload();
                    });
                    break;
                case 500:
                    swal("Oh noes!", "The AJAX request failed!", "error");
                    break;
            }
        }
    });
}

function addFace(name, canvas) {
    var dataURL = canvas.toDataURL();
    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:8000/saveimg",
        data: {
            name: name,
            imgBase64: dataURL
        },
        async: false,
        success: function (o) {
            switch (o.statusCode) {
                case 200:
                    // swal("Save Successfully", "Store your test", "success");
                    break;
                case 500:
                    swal("Oh noes!", "The AJAX request failed!", "error");
                    break;
            }
        }
    });
}