const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const Stripe = require("stripe");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8080;

//mongodb connection
//console.log(process.env.MONGODB_URL);
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("connect to database"))
  .catch((err) => console.log(err));

//schema
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  confirmPassword: String,
  image: String,
});

const userModel = mongoose.model("user", userSchema);

app.get("/", (req, res) => {
  res.send("server is running");
});

//signup

app.post("/signup", async (req, res) => {
  //console.log(req.body);
  const { email } = req.body;

  const data2 = await userModel.findOne({ email: email });

  if (data2) {
    res.send({ message: "Email id is already register", alert: false });
  } else {
    const data2 = userModel(req.body);
    const save = data2.save();
    res.send({ message: "Successfully sign up", alert: true });
  }
});

//login
app.post("/login", async (req, res) => {
  //console.log(req.body);
  const { email } = req.body;

  const data1 = await userModel.findOne({ email: email });

  if (data1) {
    const dataSend = {
      _id: data1._id,
      firstName: data1.firstName,
      lastName: data1.lastName,
      email: data1.email,
      image: data1.image,
    };
    //console.log(dataSend);
    res.send({
      message: "Login is successully",
      alert: true,
      data: dataSend,
    });
  } else {
    res.send({
      message: "Email id is not available, Please sign up",
      alert: false,
    });
  }
});

//product section

const schemaProduct = mongoose.Schema({
  name: String,
  category: String,
  image: String,
  price: String,
  description: String,
});

const productModel = mongoose.model("product", schemaProduct);

//save product in database api
app.post("/uploadProduct", async (req, res) => {
  //yconsole.log(req.body);
  const data = await productModel(req.body);
  const datasave = await data.save();
  res.send({ message: "Upload successfully" });
});

//

app.get("/product", async (req, res) => {
  const data = await productModel.find({});
  res.send(JSON.stringify(data));
});

//payment get
console.log(process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
app.post("/checkout-payment", async (req, res) => {
  console.log(req.body);
  try{
    const params = {
      submit_type : "pay",
      mode : "payment",
      payment_method_types : ['card'],
      billing_address_collection : "auto",
      shipping_options : [{shipping_rate : "shr_1OTg5VSEUEpfM4mFbkCR2X8Y"}],
      line_items : req.body.map((item) => {
        return{
          price_data : {
            currency : "inr",
            product_data : { 
              name : item.name,
              //images : [item.image]
            },
            unit_amount : item.price * 100,
          },
          adjustable_quantity : {
            enabled : true,
            minimum : 1,
          },
          quantity : item.qty
        }
      }),
      success_url : `${process.env.FRONTEND_URL}/success`,
      cancel_url : `${process.env.FRONTEND_URL}/cancel`,
    }
  
  const session = await stripe.checkout.sessions.create(params)
  //console.log(session)
  res.status(200).json(session.id)
  }
  catch(err) {
    res.status(err.statusCode || 500).json(err.message)
  }

});

app.listen(PORT, () => console.log("server is running at port : " + PORT));