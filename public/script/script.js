init();
$("#queryImgUploadInput").change(function (e) {
    refresh()
});

async function init() {
    $(".overlay").fadeIn();
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/')
    await faceapi.loadFaceLandmarkModel('/')
    await faceapi.loadFaceRecognitionModel('/')
    await faceapi.loadFaceExpressionModel('/')
    await faceapi.nets.ageGenderNet.load('/')
    $(".overlay").fadeOut();
}

function refresh() {
    $(".overlay").show();
    $('#queryImg').hide();
    $('#queryImgOverlay').hide();
    $("#collectionDIV").hide();
    $(".collection").empty();
    $(".totalNO").empty();
    $(".modelContainer").empty();
    $(".OverlayCanvas").remove();
    $(".canvasContainer").empty();
    uploadQueryImage('#queryImgUploadInput', '#queryImg', '#queryImgOverlay')
}

async function uploadQueryImage(id, imgId, canvasId) {
    const imgFile = $(id).get(0).files[0]
    if (!imgFile) {
        $(".overlay").fadeOut();
        swal("Oh noes!", "Image not Found", "error");
    } else {
        const img = await faceapi.bufferToImage(imgFile)
        $(".faceContainer").css("border-width", "0px");
        $("#queryImg").css("border", "2px solid");
        $(imgId).get(0).src = img.src
        updateReferenceImageResults(imgId, canvasId)
    }
}

async function updateReferenceImageResults(imgId, canvasId) {
    const inputImgEl = $(imgId).get(0)
    const canvas = $(canvasId).get(0)

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    $(imgId).fadeIn();
    $(canvasId).fadeIn();

    let minConfidence = 0.5;
    const fullFaceDescriptions = await faceapi
        .detectAllFaces(inputImgEl, new faceapi.SsdMobilenetv1Options({
            minConfidence
        }))
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()
        .withFaceDescriptors()


    if (!fullFaceDescriptions.length) {
        $(".totalNO").html("Total Faces: None");
        swal("Faces Not Found", "", "error");
        $(canvasId).hide();
        $(".overlay").fadeOut();
        return
    }
    $(".totalNO").html("Total Faces: None");

    var faceMatcher = new faceapi.FaceMatcher(fullFaceDescriptions)
    faceMatcher = await createBbtFaceMatcher(5)

    faceapi.matchDimensions(canvas, inputImgEl)

    const resizedResults = faceapi.resizeResults(fullFaceDescriptions, inputImgEl)
    var i = 0;
    console.log(resizedResults);
    faceMatcher.labeledDescriptors
        .map(ld => ld.label)
    resizedResults.forEach(({
        detection,
        expressions,
        descriptor,
        age,
        gender,
        genderProbability
    }) => {
        var label = faceMatcher.findBestMatch(descriptor).toString()
        var accuracy = (detection.score * 100).toFixed(2);
        label = label.slice(0, label.indexOf(" ("));
        var sorted = expressions.asSortedArray();
        var resultsToDisplay = sorted.filter(function (expr) {
            return expr.probability > minConfidence;
        });
        var values = label.replaceAll(" ", "_").replace(/[^a-zA-Z ]/g, "") + i
        $(".collection").append('<a value="' + values + '" class="collection-item modal-trigger" href="#M' + values + '">' + label + '</a>');
        var model = "";
        model += '<div id="M' + values + '" class="modal">';
        model += '<div class="modal-content">';
        model += '<div class="row">';
        model += '<h4>' + label + '</h4>';
        model += '</div>';
        model += '<div class="row">';
        model += '<div class="col s2" id="modelImg' + i + '">';
        model += '</div>';
        model += '<div class="col s10">';
        if (label === "unknown") {
            model += '<p>Face is not found in database. Please add this face.</p>';
            model += '<p>For adding new face push below "ADD NEW" button</p>';
        } else {
            model += '<p>' + face_data[label].description + '</p>';
        }
        model += '</div>';
        model += '</div>';
        model += '<div class="row">';
        model += '<p>Face Detection Probability is <strong>' + accuracy + '%</strong></p>';
        model += '<p>Gender of the person is <strong>' + capitalizeFirstLetter(gender) + '</strong> With Probability <strong>' + (genderProbability * 100).toFixed(2) + '%</strong></p>';
        model += '<p>Age of the person approximately <strong>' + Math.round(age) + '</strong>';
        model += '<p>Face Expression is <strong>' + capitalizeFirstLetter(resultsToDisplay[0].expression) + '</strong> With Probability <strong>' + (resultsToDisplay[0].probability * 100).toFixed(2) + '%</strong></p>';
        model += '</div>';
        model += '</div>';
        model += '<div class="modal-footer">';
        if (label === "unknown") {
            model += '<a href="/add_face.html" class="modal-close waves-effect waves-green btn-flat">ADD NEW</a>';
        } else {
            model += '<a href="/add_face.html" class="modal-close waves-effect waves-green btn-flat ">ADD NEW</a>';
            // model += '<a href="#!" class="modal-close waves-effect waves-green btn-flat">UPDATE</a>';
        }
        model += '</div>';
        model += '</div>';
        $(".modelContainer").append(model);
        $('.modal').modal();
        $('.sidenav').sidenav();
        const options = {
            label
        }
        const options2 = {
            label: label,
            drawLabelOptions: {
                fontColor: "#000"
            },
            boxColor: "#ccff00"
        }

        var newCanvas = document.createElement("CANVAS");
        newCanvas.className = "queryimg OverlayCanvas";
        newCanvas.height = detection.imageHeight;
        newCanvas.width = detection.imageWidth;
        newCanvas.id = values;
        newCanvas.style = "display:none";
        const canvasBox = new faceapi.draw.DrawBox(detection.box, options2)
        canvasBox.draw(newCanvas)
        $(".faceContainer").append(newCanvas);
        $(".faceContainer").css("height", detection.imageHeight);


        const drawBox = new faceapi.draw.DrawBox(detection.box, options)
        drawBox.draw(canvas)
        handleImage(fullFaceDescriptions[i].detection, '#modelImg' + i)



        i++;
    })
    $(".collection-item").hover(function (e) {
        var val = this.getAttribute("value");
        $("#" + val).show();
    }, function (e) {
        var val = this.getAttribute("value");
        $("#" + val).hide();
    })
    $(".totalNO").html("Total Faces:" + resizedResults.length);
    $("#collectionDIV").show();
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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}