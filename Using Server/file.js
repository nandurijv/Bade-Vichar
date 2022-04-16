const router = require("express").Router();
var fileupload = require("express-fileupload");
const request = require("request");
const  fs = require("fs");
const webmToMp4 = require("webm-to-mp4");

const appId =
  "30326a4252655454523637755a51485574546b4f6855634b39577a38576b5765";
const appSecret =
  "596761655770505f35336c51506d3967783068777165704a386a717035575f4c41754262684a32446b6a56786b2d33686a556a3470716732463344644b724563";

const authOptions = {
  method: "post",
  url: "https://api.symbl.ai/oauth2/token:generate",
  body: {
    type: "application",
    appId: appId,
    appSecret: appSecret,
  },
  json: true,
};
async function auth() {
  return new Promise((resolve, reject) => {
    request(authOptions, (err, res, body) => {
      if (err) {
        console.error("error posting json: ", err);
        reject(err);
      }
      //   console.log(body);
      resolve(body);
    });
  });
}
function sendaudiofile(token, file) {
  const authToken = token;
  // const webhookUrl = WEBHOOK_URL;
  const audioFileStream = fs.createReadStream(`./uploads/${file}`);
  const params = {
    name: "BusinessMeeting",

    confidenceThreshold: 0.6,
  };
  const audioOption = {
    url: "https://api.symbl.ai/v1/process/video",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "video/mp4",
    },
    qs: params,
    json: true,
  };

  const responses = {
    400: "Bad Request! Please refer docs for correct input fields.",
    401: "Unauthorized. Please generate a new access token.",
    404: "The conversation and/or it's metadata you asked could not be found, please check the input provided",
    429: "Maximum number of concurrent jobs reached. Please wait for some requests to complete.",
    500: "Something went wrong! Please contact support@symbl.ai",
  };
  return new Promise((resolve, reject) => {
    audioFileStream.pipe(
      request.post(audioOption, (err, response, body) => {
        const statusCode = response.statusCode;
        if (
          err ||
          Object.keys(responses).indexOf(statusCode.toString()) !== -1
        ) {
          throw new Error(responses[statusCode]);
        }
        //   console.log("Status code: ", statusCode);
        //   console.log("Body", response.body);
        resolve(response.body);
      })
    );
  });
}
function conversation(id, token) {
  const authToken = token;
  console.log(id);
  const conversationId = id;
  return new Promise((resolve, reject) => {
    request.get(
      {
        url: `https://api.symbl.ai/v1/conversations/${conversationId}/topics`,
        headers: { Authorization: `Bearer ${authToken}` },
        json: true,
      },
      (err, response, body) => {
        console.log(body);
        resolve(body);
      }
    );
  });
}
router.post("/upload", async function (req, res, next) {
  const file = req.files.audio;
 file.mv("./uploads/" + file.name, function (err, result) {
    if (err) throw err;
  });

  let x, y, z;
  z = await auth();
  x = await sendaudiofile(z.accessToken, file.name);
  y = await conversation(x.conversationId, z.accessToken);

  res.send({token:z.accessToken,id:x.conversationId});
  //   .then(async(result) => {


  //   });
});

module.exports = router;
