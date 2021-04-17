$(".overlay").hide();
const MODEL_URL = "age_gender_model-weights_manifest.json";
async function myFunction() {

const model = await tf.loadWeightMap(MODEL_URL);
console.log(model);
  }
  myFunction()