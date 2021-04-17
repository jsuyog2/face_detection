var face_data = {};
function getFaceImageUri(className, idx) {
  return `tests/${className}/face (${idx}).png`
}

// fetch first image of each class and compute their descriptors
async function createBbtFaceMatcher(numImagesForTraining = 1) {
  const maxAvailableImagesPerClass = 5
  numImagesForTraining = Math.min(numImagesForTraining, maxAvailableImagesPerClass)

  const labeledFaceDescriptors = await Promise.all(classes.map(
    async className => {
      const descriptors = []
      for (let i = 1; i < (numImagesForTraining + 1); i++) {
        const img = await faceapi.fetchImage(getFaceImageUri(className, i))
        descriptors.push(await faceapi.computeFaceDescriptor(img))
      }
      var face = postData(className);
      return new faceapi.LabeledFaceDescriptors(
        face,
        descriptors
      )
    }
  ))

  return new faceapi.FaceMatcher(labeledFaceDescriptors)
}

function postData(className) {
  var retVar;
  $.ajax({
    type: "POST",
    url: "http://127.0.0.1:8000/getface",
    data:{
      faceid:className
    },
    async: false,
    success: function (o) {
      face_data[o.face_name] = {
        name: o.face_name,
        description: o.description
      }
      retVar = o.face_name;
    }
  });
  return retVar;
}