//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Swal = require("sweetalert2");
// const swal = require('sweetalert');
const sessiion = require("express-session");
const alert = require("alert");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const checksum_lib = require("./Paytm/checksum");
const config = require("./Paytm/config");
const showToast = require("show-toast");

const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });

let userEmail;
const app = express();
app.use(cookieParser());

// const url = "mongodb+srv://ajay770:ajay770@cluster0.kisg8.mongodb.net/testDB?retryWrites=true&w=majority";

const url =
  "mongodb+srv://exceldb:exceldb@cluster0.5ocpe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const connectionParams = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};
mongoose
  .connect(url, connectionParams)
  .then(() => {
    console.log("Connected to database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  sessiion({
    secret: "secret",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUnintialized: false,
  })
);

//email

app.get("/", function (req, res) {
  res.clearCookie("userData");
  res.render("home");
});

app.post("/", function (req, res) {
  let newSubscriber = req.body.Subscriber;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "broadband.excel17@gmail.com",
      pass: "TYproject",
    },
  });

  const mailOptions = {
    from: "broadband.excel17@gmail.com",
    to: newSubscriber,
    subject: "Welcome to Excel Broadband.",
    text: `Hello New Subscriber`,
    html: "<p> <b>Thanks for Subscribe.</b> <br> Welcome to Excel Broadband. <br> We’re thrilled to see you here! <br> We’re confident that we will help you provide with <br> all the latest offers and promotional mails. <br> You can also find more about us through the <br> official website of Excel Broadband. <br> We promise your personal details to be safe with us. <br> Reply to this email if you have any questions.<br> We are here for your help !.<b><br> Regards <br> Excel Broadband PVT LTD.</b></p>",
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log("email sent");
    }
  });
  res.redirect("/");
});

app.get("/loginhome", function (req, res) {
  res.render("loginhome");
});

app.get("/myaccount", function (req, res) {
  const pic = req.body.userimg;
  console.log(pic);
  // const usercookie = req.cookies;
  const { userData } = req.cookies;
  console.log(userData);
  User.findOne(
    { email: userData.email, password: userData.password },
    function (err, data) {
      res.render("myaccount", {
        useremail: data.email,
        userfname: data.fname,
        userlname: data.lname,
        userpassword: data.password,
        usermobile: data.mobile,
        userplan: data.plan,
        planexpiry: data.expiry,
        planstatus: data.status,
        cardno: data.cardno,
        expirydate: data.expirydate,
        cvv: data.cvv,
      });
    }
  );
  // res.render("myaccount");
});

app.get("/editinfo", function (req, res) {
  const { userData } = req.cookies;
  User.findOne(
    { email: userData.email, password: userData.password },
    function (err, data) {
      res.render("editinfo", {
        fname: data.fname,
        lname: data.lname,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
      });
    }
  );
});

app.post("/editinfo", function (req, res) {
  let fname = req.body.fname;
  let lname = req.body.lname;
  let email = req.body.email;
  let mobile = req.body.mobile;
  let password = req.body.password;
  const { userData } = req.cookies;

  User.findOneAndUpdate(
    { email: userData.email, password: userData.password },
    {
      email: email,
      fname: fname,
      lname: lname,
      mobile: mobile,
      password: password,
    },
    function (err, data) {
      if (err) {
        console.log(err);
      } else {
        alert("Update Successfully!");
      }
    }
  );
  res.redirect("/myaccount");
});

app.get("/editcard", function (req, res) {
  const { userData } = req.cookies;
  User.findOne(
    { email: userData.email, password: userData.password },
    function (err, data) {
      res.render("editcard", {
        cardno: data.cardno,
        expirydate: data.expirydate,
        cvv: data.cvv,
      });
    }
  );
});

app.post("/editcard", function (req, res) {
  let cardno = req.body.cardno;
  let expirydate = req.body.expirydate;
  let cvv = req.body.cvv;
  const { userData } = req.cookies;

  User.findOneAndUpdate(
    { email: userData.email, password: userData.password },
    { cardno: cardno, expirydate: expirydate, cvv: cvv },
    function (err, data) {
      if (err) {
        console.log(err);
      } else {
        alert("Update Successfully!");
      }
    }
  );
  res.redirect("/myaccount");
});

app.get("/business", function (req, res) {
  res.render("business");
});

app.get("/lbusiness", function (req, res) {
  res.render("lbusiness");
});

app.get("/service", function (req, res) {
  res.render("service");
});

app.get("/lservice", function (req, res) {
  res.render("lservice");
});

app.get("/terms", function (req, res) {
  res.render("terms");
});

app.get("/lterms", function (req, res) {
  res.render("lterms");
});

app.get("/aboutus", function (req, res) {
  res.render("aboutus");
});

app.get("/laboutus", function (req, res) {
  res.render("laboutus");
});

app.get("/contactus", function (req, res) {
  res.render("contactus");
});

app.get("/lcontactus", function (req, res) {
  res.render("lcontactus");
});

app.get("/cart", function (req, res) {
  const { productData } = req.cookies;
  const { userData } = req.cookies;
  // res.render("cart", {
  //    title : productData.title,
  //    price : productData.price,
  //    url : productData.image
  // })

  User.findOne(
    { email: userData.email, password: userData.password },
    function (err, data) {
      res.render("cart", {
        title: productData.title,
        price: productData.price,
        url: productData.image,
        name: data.fname,
        email: data.email,
        mobile: data.mobile,
      });
    }
  );
});

app.post("/buynow", function (req, res) {
  let product = {
    title: req.body.title,
    price: req.body.price,
    image: req.body.image,
  };
  res.cookie("productData", product);

  const { userData } = req.cookies;

  if (!userData) {
    return res.redirect("/login");
  } else {
    res.redirect("/cart");
  }
});

app.get("/addreview", function (req, res) {
  res.render("addreview");
});

app.get("/laddreview", function (req, res) {
  res.render("laddreview");
});

app.get("/reviews", function (req, res) {
  Review.find({}, function (err, data) {
    if (err) {
      console.log(err);
    }
    if (data) {
      res.render("reviews", {
        review: data,
      });
    }
  });
});

app.get("/lreviews", function (req, res) {
  Review.find({}, function (err, data) {
    if (err) {
      console.log(err);
    }
    if (data) {
      res.render("lreviews", {
        review: data,
      });
    }
  });
});

const reviewSchema = new mongoose.Schema({
  name: String,
  review: String,
  date: String,
});

const Review = mongoose.model("Review", reviewSchema);

app.post("/addreview", function (req, res) {
  var name = req.body.name;
  var review = req.body.review;

  var d = new Date();
  var n = d.toDateString();

  var reviews = new Review({
    name: name,
    review: review,
    date: n,
  });

  if (!name && !review) {
    console.log("null values");
  }
  if (name && review) {
    reviews.save(function (err) {
      if (!err) {
        res.redirect("/reviews");
      } else {
        console.log(err.message);
      }
    });
  }
});

app.post("/laddreview", function (req, res) {
  var name = req.body.name;
  var review = req.body.review;

  var d = new Date();
  var n = d.toDateString();

  var reviews = new Review({
    name: name,
    review: review,
    date: n,
  });

  if (!name && !review) {
    console.log("null values");
  }
  if (name && review) {
    reviews.save(function (err) {
      if (!err) {
        res.redirect("/lreviews");
      } else {
        console.log(err.message);
      }
    });
  }
});

app.get("/loginhome", function (req, res) {
  res.render("loginhome");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", function (req, res, next) {
  let users = {
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie("userData", users);

  var email = req.body.email;
  var password = req.body.password;
  User.findOne({ email: email, password: password }, function (err, docs) {
    if (docs) {
      alert("Login Successfully!");
      res.redirect("/loginhome");
      // res.send(docs);
    } else {
      alert("invalid login credentials!");
      console.log(err);
    }
  });
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

const userSchema = new mongoose.Schema({
  email: String,
  fname: String,
  lname: String,
  password: String,
  mobile: String,
  plan: String,
  expiry: String,
  status: String,
  cardno: String,
  expirydate: String,
  cvv: String,
});

const User = mongoose.model("User", userSchema);

app.post("/signup", function (req, res, next) {
  let users = {
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie("userData", users);

  var email = req.body.email;
  var fname = req.body.fname;
  var lname = req.body.lname;
  var password = req.body.password;
  var mobile = req.body.mobile;

  var data = new User({
    email: email,
    fname: fname,
    lname: lname,
    password: password,
    mobile: mobile,
  });

  data.save(function (err) {
    if (!err) {
      alert("User Created Successfully!");
      res.redirect("/loginhome");
    } else {
      console.log(err.message);
    }
  });
});

const partnerUs = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String,
  company: String,
  address: String,
});

const Partner = mongoose.model("PartnerUs", partnerUs);

app.post("/business", function (req, res) {
  var name = req.body.name;
  var mobile = req.body.mobile;
  var email = req.body.email;
  var company = req.body.company;
  var address = req.body.address;

  var data = new Partner({
    name: name,
    mobile: mobile,
    email: email,
    company: company,
    address: address,
  });

  if (!name && !mobile && !email && !company && !address) {
    console.log("null Values");
  }
  if (name && mobile && email && company && address) {
    data.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        alert("form Submitted!");
        res.redirect("/business");
      }
    });
  }
});

app.post("/lbusiness", function (req, res) {
  var name = req.body.name;
  var mobile = req.body.mobile;
  var email = req.body.email;
  var company = req.body.company;
  var address = req.body.address;

  var data = new Partner({
    name: name,
    mobile: mobile,
    email: email,
    company: company,
    address: address,
  });

  if (!name && !mobile && !email && !company && !address) {
    console.log("null Values");
  }
  if (name && mobile && email && company && address) {
    data.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        alert("form Submitted!");
        res.redirect("/lbusiness");
      }
    });
  }
});

const query = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String,
  query: String,
});

const Query = mongoose.model("query", query);

app.post("/contactus", function (req, res) {
  var name = req.body.name;
  var mobile = req.body.mobile;
  var email = req.body.email;
  var query = req.body.query;

  var data = new Query({
    name: name,
    mobile: mobile,
    email: email,
    query: query,
  });

  if (!name && !mobile && !email && !query) {
    console.log("null Values");
  }
  if (name && mobile && email && query) {
    data.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        alert("Query Submitted!");
        res.redirect("/contactus");
      }
    });
  }
});

app.post("/lcontactus", function (req, res) {
  var name = req.body.name;
  var mobile = req.body.mobile;
  var email = req.body.email;
  var query = req.body.query;

  var data = new Query({
    name: name,
    mobile: mobile,
    email: email,
    query: query,
  });

  if (!name && !mobile && !email && !query) {
    console.log("null Values");
  }
  if (name && mobile && email && query) {
    data.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        alert("Query Submitted!");
        res.redirect("/lcontactus");
      }
    });
  }
});

// let users = {
// name : "Ajay Mourya ",
// Age : "18"
// }

// app.get('/setuser', (req, res)=>{
// res.cookie("userData", users);
// res.send('user data added to cookie');
// });

app.get("/getuser", (req, res) => {
  //shows all the cookies
  res.send(req.cookies);
  // console.log(req.cookies);
});

//payment

app.post("/paynow", [parseUrl, parseJson], (req, res) => {
  // Route for making payment
  const { productData } = req.cookies;
  console.log(productData);
  var paymentDetails = {
    amount: productData.price,
    customerId: req.body.firstname,
    customerEmail: req.body.email,
    customerPhone: req.body.phone,
  };
  if (
    !paymentDetails.amount ||
    !paymentDetails.customerId ||
    !paymentDetails.customerEmail ||
    !paymentDetails.customerPhone
  ) {
    res.status(400).send("Payment failed");
  } else {
    var params = {};
    params["MID"] = config.PaytmConfig.mid;
    params["WEBSITE"] = config.PaytmConfig.website;
    params["CHANNEL_ID"] = "WEB";
    params["INDUSTRY_TYPE_ID"] = "Retail";
    params["ORDER_ID"] = "TEST_" + new Date().getTime();
    params["CUST_ID"] = paymentDetails.customerId;
    params["TXN_AMOUNT"] = paymentDetails.amount;
    params["CALLBACK_URL"] = "http://localhost:3000/callback";
    params["EMAIL"] = paymentDetails.customerEmail;
    params["MOBILE_NO"] = paymentDetails.customerPhone;

    checksum_lib.genchecksum(
      params,
      config.PaytmConfig.key,
      function (err, checksum) {
        var txn_url =
          "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
        // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

        var form_fields = "";
        for (var x in params) {
          form_fields +=
            "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
        }
        form_fields +=
          "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(
          '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
            txn_url +
            '" name="f1">' +
            form_fields +
            '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
        );
        res.end();
      }
    );
  }
});
app.post("/callback", (req, res) => {
  // Route for verifiying payment

  var body = "";

  req.on("data", function (data) {
    body += data;
  });

  req.on("end", function () {
    var html = "";
    var post_data = qs.parse(body);

    // received params in callback
    console.log("Callback Response: ", post_data, "\n");

    // verify the checksum
    var checksumhash = post_data.CHECKSUMHASH;
    // delete post_data.CHECKSUMHASH;
    var result = checksum_lib.verifychecksum(
      post_data,
      config.PaytmConfig.key,
      checksumhash
    );
    console.log("Checksum Result => ", result, "\n");

    // Send Server-to-Server request to verify Order Status
    var params = { MID: config.PaytmConfig.mid, ORDERID: post_data.ORDERID };

    checksum_lib.genchecksum(
      params,
      config.PaytmConfig.key,
      function (err, checksum) {
        params.CHECKSUMHASH = checksum;
        post_data = "JsonData=" + JSON.stringify(params);

        var options = {
          hostname: "securegw-stage.paytm.in", // for staging
          // hostname: 'securegw.paytm.in', // for production
          port: 443,
          path: "/merchant-status/getTxnStatus",
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": post_data.length,
          },
        };

        // Set up the request
        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on("data", function (chunk) {
            response += chunk;
          });

          post_res.on("end", function () {
            console.log("S2S Response: ", response, "\n");

            var _result = JSON.parse(response);
            if (_result.STATUS == "TXN_SUCCESS") {
              res.send("payment sucess");
            } else {
              res.send("payment failed");
            }
          });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();
      }
    );
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
