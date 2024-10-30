const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const { Parser } = require("htmlparser2");
var querystring = require("querystring");
const session = require("express-session");

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/.well-known/web-identity", async (req, res) => {
  res.type("json");
  res.send({
    provider_urls: ["/fedcm.json"],
  });
});

app.use("/fedcm.json", async function (req, res, next) {
  res.type("json");
  res.send({
    accounts_endpoint: "/accounts",
    id_token_endpoint: "/idtoken_endpoint.json",
    client_metadata_endpoint: "/client_metadata",
    id_assertion_endpoint: "/id_assertion_endpoint",
    revocation_endpoint: "/revoke_endpoint.json",
    metrics_endpoint: "/metrics_endpoint.json",
    login_url: "/",
    // types: ["indieauth"],
    branding: {
	     background_color: "#1a73e8",
	     color: "#fff",
	     icons: [{
        // url: "https://accounts.google.com/gsi-static/google-logo.png",
        url: "https://img.freepik.com/premium-vector/google-wallet-logo_689336-957.jpg",
        size: 32
      }, {
        //url: "https://accounts.google.com/gsi-static/google-logo_40.png",
        url: "https://img.freepik.com/premium-vector/google-wallet-logo_689336-957.jpg",
        //url: "https://static.wikia.nocookie.net/logopedia/images/8/83/Google_Wallet_%282022%29_icon.svg/revision/latest/scale-to-width-down/250?cb=20220803140845",
        size: 40
      }]
    },
  });
});

function error(res, message) {
  return res.status(400).end();
}

app.use("/accounts", (req, res) => {
  res.type("json");
  res.send({
    accounts: [{
      id: "1234",
      account_id: "1234",
      email: "CA DMV #23134",
      name: "Sam Goto",
      given_name: "Sam",
      picture: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/California_Department_of_Motor_Vehicles_logo.svg/1200px-California_Department_of_Motor_Vehicles_logo.svg.png",
      // picture: "https://pbs.twimg.com/profile_images/920758039325564928/vp0Px4kC_400x400.jpg",
      approved_clients: [],
    },],
  });
});

app.use("/client_metadata", (req, res) => {
  // Check for the CORS headers
  res.type("json");
  res.send({
    privacy_policy_url: "https://rp.example/privacy_policy.html",
    terms_of_service_url: "https://rp.example/terms_of_service.html",
  });
});

const tokens = {};

app.get("/present", (req, res) => {
  //console.log(req.query);

  const token = JSON.stringify({name: "Sam", id: "23134"});

  res.send(`
     <br> <img width="60px" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/California_Department_of_Motor_Vehicles_logo.svg/1200px-California_Department_of_Motor_Vehicles_logo.svg.png">

     <br><br>Are you sure you want to share your information with ${req.query.client_id}?

     <br><br>
     <br> Name: Sam Goto
     <br> Number: CA DMV #23134

     <br><br>

     <button onclick="IdentityProvider.resolve('${encodeURIComponent(token)}')">Yes</button>
  `);
});

app.post("/id_assertion_endpoint", (req, res) => {
  res.type("json");
  res.set("Access-Control-Allow-Origin", req.headers.origin);
  res.set("Access-Control-Allow-Credentials", "true");
  //console.log(req);
  res.json({
    //token: JSON.stringify({
    //  hello: "world",
    //}),
    continue_on: "/present?client_id=" + req.body.client_id,
  });
});

app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.send(`
    This is the absolutely simplest FedCM Holder.

    <br><br>

    <button onclick="IdentityProvider.register(window.location.origin + '/fedcm.json')">Register</button>
    <button onclick="IdentityProvider.unregister(window.location.origin + '/fedcm.json')">Unregister</button>

  `);
});

const listener = app.listen(process.env.PORT || 8080, async () => {
  console.log("Your app is listening on port " + listener.address().port);
});

