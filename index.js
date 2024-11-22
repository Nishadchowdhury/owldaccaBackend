const express = require("express");
require('dotenv').config()

const fs = require("fs")
const app = express();
const cors = require("cors");
const multer = require("multer");
const Resend = require('resend').Resend;

const baseURL = "http://localhost:8000";
// const corsOption = {
//   origin: ["https://owldaccabd.com"],
// };
// app.use(cors(corsOption));

app.use(cors());
app.use(express.json());

const admin = require("firebase-admin");
const credentials = require("./key.json");
const generateAnEmail = require("./generator/generateAnaemail");
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});
const db = admin.firestore();
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static("assets/images"));



//--------------------------------------
//sending mail

const resend = new Resend("re_R8YPDWtk_6s5dGVUQ4c7B45uEFZw732ah");
app.post("/sendMail", async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");


  const { email, emailObj } = req.body;

  const owner = {
    email: "nishadanything@gmail.com",
    name: "Owl DaccaBD"
  }
  const html = generateAnEmail(emailObj);

  try {
    const data = await resend.emails.send({
      from: 'Owldacca - Noreply <order@server.owldaccabd.com>',
      to: [owner.email, email],
      html: html,
      subject: "Order confirmed",
      reply_to: owner.email,
    });

    // console.log(data);
    console.log('email sent successfully.');
    return res.send({
      status: 200,
      message: "email sent done.",
      success: true,
    });
  } catch (error) {

    console.log('email sent failed!!!');
    return res.send({
      status: 200,
      error: error,
      message: "email not sent",
      success: false,
    });
  }

})

/* publicEnd */

//get all slider images
app.get("/sliders", async (req, res) => {
  const response = await db.collection('settings').doc("slider").get();

  return res.send({ status: 200, sliders: response.data() })
})


//create an user or check
app.post("/createUser", async (req, res) => {
  try {
    const id = req.body.email;
    const userJson = {
      email: req.body.email,
      name: req.body.name,
      phone: req.body.phone,
    };

    // Check if the document already exists
    const docRef = db.collection("users").doc(id);
    const doc = await docRef.get();

    if (doc.exists) {
      return res.send({ status: 200, user: doc.data(), exists: true });
    } else if (!doc.exists && userJson?.name && userJson?.email && userJson?.phone) {
      const response = db.collection("users").doc(id).set(userJson);

      return res.send({
        response,
        status: 201,
        user: userJson,
        exists: false,
      });
    } else {
      return res.send({
        status: 404,
        user: userJson,
        exists: undefined,
        message: "please fill the inputs properly.",
      });
    }
  } catch (error) {
    return res.send(error);
  }
});

//get all restaurants
app.get("/restaurants", async (req, res) => {
  try {
    const restaurantsRef = db.collection("restaurants");
    const response = await restaurantsRef.get();
    let data = [];

    response.forEach(doc => {
      data.push({
        restaurantId: doc.id,
        restaurantData: doc.data(),
      });
    });
    return res.send({
      message: "Successfully got the data of restaurants ",
      status: 200,
      restaurantList: data,
    });
  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});

//get a restaurants
app.get("/restaurants/:id", async (req, res) => {
  console.log("getting");
  const id = req.params.id;
  try {
    const restaurantRef = db.collection("restaurants").doc(id);
    const doc = await restaurantRef.get();

    if (!doc.exists) {
      return res.send({
        message: "restaurant not found you looking for.",
        status: 404,
        cuisine: {},
      });
    } else {
      return res.send({
        message: "Successfully got the data of restaurant.",
        status: 200,
        restaurant: doc.data(),
      });
    }
  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});

//get all cuisines
app.get("/cuisines/:limit", async (req, res) => {

  try {
    const cuisinesRef = db.collection("cuisines");
    const response = await cuisinesRef.limit(+req?.params?.limit).get();

    let data = [];

    response.forEach(doc => {
      data.push({
        cuisineId: doc.id,
        cuisineData: doc.data(),
      });
    });
    return res.send({
      message: "Successfully got the data of cuisines ",
      status: 200,
      cuisineList: data,
    });
  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});

//get all exclusive cuisines
app.get("/cuisinesExclusive", async (req, res) => {
  try {
    const restaurantsRef = db.collection("cuisines");
    const response = await restaurantsRef.where("isExclusive", "==", true).get();

    let data = [];

    response.forEach(doc => {
      data.push({
        cuisineId: doc.id,
        cuisineData: doc.data(),
      });
    });
    return res.send({
      message: "Successfully got the data of cuisines ",
      status: 200,
      cuisineList: data,
    });
  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});

//get a cuisine
app.get("/cuisinesOne/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const cuisineRef = db.collection("cuisines").doc(id);
    const doc = await cuisineRef.get();

    if (!doc.exists) {
      return res.send({
        message: "cuisine not found you looking for.",
        status: 404,
        cuisine: {},
      });
    } else {
      return res.send({
        message: "Successfully got the data of cuisines.",
        status: 200,
        cuisine: doc.data(),
      });
    }
  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});

//get all delivery locations
app.get("/deliveryLocations", async (req, res) => {
  try {
    const restaurantsRef = db.collection("deliveryLocations");
    const response = await restaurantsRef.get();
    let data = [];

    response.forEach(doc => {
      data.push({
        locationId: doc.id,
        locationData: doc.data(),
      });
    });
    return res.send({
      message: "Successfully got the data of locations ",
      status: 200,
      locationList: data,
    });
  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});

//get a delivery location
app.get("/deliveryLocations/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const restaurantRef = db.collection("deliveryLocations").doc(id);
    const doc = await restaurantRef.get();

    if (!doc.exists) {
      return res.send({
        message: "location found you looking for.",
        status: 404,
        location: {},
      });
    } else {
      return res.send({
        message: "Successfully got the data of a location.",
        status: 200,
        location: doc.data(),
      });
    }
  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});

//all about coupons
// get coupons
app.get("/coupons/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const couponRef = db.collection("coupons").doc(id);
    const doc = await couponRef.get();

    if (!doc.exists) {
      return res.send({
        message: "coupon not found you looking for.",
        status: 404,
        coupon: {},
      });
    } else {
      return res.send({
        message: "Successfully got the data of coupon.",
        status: 200,
        coupon: doc.data(),
      });
    }
  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});


// get coupons
app.get("/useCoupons/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const couponRef = db.collection("coupons").doc(id);
    const doc = await couponRef.get();

    if (!doc.exists) {
      return res.send({
        message: "coupon not found you looking for.",
        status: 404,
        coupon: {},
      });
    } else {
      return res.send({
        message: "Successfully got the data of coupon.",
        status: 200,
        coupon: doc.data(),
      });
    }
  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});


// -----------------------------
/* adminEnd */
/* adminEnd */
/* adminEnd */

//uploading restaurant img
const storageOfRestaurantImg = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/images/restaurantImages");
  },

  filename: function (req, file, cb) {
    const restaurantId = req.params.id;
    const fileName = file.originalname;

    let imgName;
    const lastDotIndex = fileName.lastIndexOf(".");

    if (lastDotIndex !== -1) {
      const textAfterLastDot = fileName.slice(lastDotIndex + 1);
      imgName = `${restaurantId}.${textAfterLastDot}`;
    } else {
      imgName = restaurantId + ".jpg";
    }

    cb(null, imgName);
  },

});

const storageOfFoodImg = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/images/foodImages");
  },

  filename: function (req, file, cb) {
    const restaurantId = req.params.id;
    const fileName = file.originalname;

    let imgName;
    const lastDotIndex = fileName.lastIndexOf(".");

    if (lastDotIndex !== -1) {
      const textAfterLastDot = fileName.slice(lastDotIndex + 1);
      imgName = `${restaurantId}.${textAfterLastDot}`;
    } else {
      imgName = restaurantId + ".jpg";
    }

    cb(null, imgName);
  },
});

const storageOfSlidersImg = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/images/sliderImages");
  },

  filename: function (req, file, cb) {
    const restaurantId = req.params.id;
    const fileName = file.originalname;

    let imgName;
    const lastDotIndex = fileName.lastIndexOf(".");

    if (lastDotIndex !== -1) {
      const textAfterLastDot = fileName.slice(lastDotIndex + 1);
      imgName = `${restaurantId}.${textAfterLastDot}`;
    } else {
      imgName = restaurantId + ".jpg";
    }

    cb(null, imgName);
  },
});
const uploadRestaurant = multer({ storage: storageOfRestaurantImg });
const uploadFood = multer({ storage: storageOfFoodImg });
const uploadSlider = multer({ storage: storageOfSlidersImg });

//creating res img
app.post("/restaurants_image/:id", uploadRestaurant.single("image"), async (req, res) => {
  const restaurantId = req.params.id;
  const fileName = req.file.filename;

  let imgName;
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex !== -1) {
    const textAfterLastDot = fileName.slice(lastDotIndex + 1);
    imgName = `${restaurantId}.${textAfterLastDot}`;
  } else {
    imgName = restaurantId + ".jpg";
  }

  return res.send({
    status: 201,
    message: "img uploaded",
    imgName,
  });
});

//creating food img
app.post("/food_image/:id", uploadFood.single("image"), async (req, res) => {
  const foodId = req.params.id;
  const fileName = req.file.filename;

  let imgName;
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex !== -1) {
    const textAfterLastDot = fileName.slice(lastDotIndex + 1);
    imgName = `${foodId}.${textAfterLastDot}`;
  } else {
    imgName = foodId + ".jpg";
  }

  return res.send({
    status: 201,
    message: "img uploaded",
    imgName,
  });
});

//create a restaurants
app.post("/restaurants", async (req, res) => {
  const restaurantId = (req.body.Id).toLowerCase();
  const doc = await db.collection("restaurants").doc(restaurantId).get();

  if (doc.exists) {
    return res.send({
      message: "This restaurant is already exist please try with some different data.",
      status: 403,
    });
  }
  try {
    const restaurantJson = {
      name: req.body.name,
      closeAt: req.body.closeAt,
      picture: `${baseURL}/images/restaurantImages/${req.body.imgName}`,
      cuisines: [
        {
          cuisineImg: `${baseURL}/images/foodImages/${req.body.cuisines[0].cuisineImg}`,
          isExclusive: req.body.cuisines[0].isExclusive,
          price: req.body.cuisines[0].price,
          name: req.body.cuisines[0].name,
          availableAt: req.body.cuisines[0].availableAt,
          findWith: req.body.cuisines[0].findWith,
        },
      ],
    };

    // Check if the document already exists

    const docRef = db.collection("restaurants").doc(restaurantId);
    const doc = await docRef.get();

    if (doc.exists) {
      return res.send({ status: 400, restaurant: doc.data(), exists: true });
    } else if (!doc.exists && restaurantJson?.name && restaurantJson?.closeAt && restaurantJson?.picture && restaurantJson?.cuisines[0]) {
      const response = db.collection("restaurants").doc(restaurantId).set(restaurantJson);

      return res.send({
        response,
        status: 201,
        restaurant: restaurantJson,
        exists: false,
      });

      //not created
    } else {
      return res.send({
        status: 404,
        user: restaurantJson,
        exists: undefined,
        message: "please fill the inputs properly.",
      });
    }
  } catch (error) {
    return res.send(error);
  }

});

//add a food to a res
app.post("/restaurants/:id", async (req, res) => {
  const resId = req.params.id;

  try {
    const resSlider = await db.collection("restaurants").doc(resId).update({
      cuisines: admin.firestore.FieldValue.arrayUnion(req.body),
    })


    return res.send({ status: 201, message: "food also added in the restaurant." });


  } catch (error) {
    return res.send(error);
  }

})

//delete a food to res
app.delete("/restaurantsFood/:id", async (req, res) => {
  const resId = req.params.id;
  try {
    const resSlider = await db.collection("restaurants").doc(resId).update({
      cuisines: admin.firestore.FieldValue.arrayRemove(req.body),
    })
    return res.send({ status: 201, message: "food deleted." });
  } catch (error) {
    return res.send(error);
  }

})


//delete a restaurant
app.delete("/restaurants/:id", async (req, res) => {

  const restaurantId = req.params.id;
  const adminId = req.body.adminId;
  const imgName = req.body.image;



  const docRef = db.collection("admins").doc(adminId);
  const doc = await docRef.get();
  try {

    // Check if the document already exists

    if (doc.exists) {
      try {
        const docRef = db.collection("restaurants").doc(restaurantId);
        const doc = await docRef.get();
        if (doc.exists) {
          const response = await db.collection("restaurants").doc(restaurantId).delete();

          fs.unlink("assets/images/restaurantImages/" + imgName, (error) => {
            if (error) {
              console.log(error)
            }
          })

          return res.send({
            status: 200,
            response: response,
            message: `${restaurantId} has been deleted.!`,
          });
        }
      } catch (error) {
        return res.send({ status: 400, message: error });
      }
    } else {
      return res.send({
        status: 401,
        message: "sorry you are not an admin.!",
      });
    }
  } catch (error) {
    return res.send(error);
  }
});

//create a foodItem
app.post("/cuisines/:id", async (req, res) => {
  const foodId = req.params.id;
  const docId = foodId + "_" + req.body.availableAt.replace(/\s+/g, '');
  const doc = await db.collection("cuisines").doc(docId).get();

  if (doc.exists) {
    return res.send({
      message: "This cuisine is already exist please try with some different data.",
      status: 403,
    });
  } else {
    try {


      const foodJson = {
        cuisineImg: `${baseURL}/images/foodImages/${req.body.cuisineImg}`,
        isExclusive: req.body.isExclusive,
        price: req.body.price,
        availableAt: req.body.availableAt,
        name: req.body.name,
        findWith: req.body.findWith,
      }


      if (!doc.exists && foodJson.cuisineImg && foodJson.price && foodJson.availableAt && foodJson.name && foodJson.findWith[0]) {
        const response = await db.collection("cuisines").doc(docId).set(foodJson);

        return res.send({
          response: response,
          status: 201,
          food: foodJson,
          exists: false,
        });


        //not created
      } else {
        return res.send({
          status: 404,
          user: foodJson,
          exists: undefined,
          message: "please fill the inputs properly.",
        });
      }
    } catch (error) {
      return res.send(error);
    }
  }

});

//delete a food
app.delete("/cuisines/:id", async (req, res) => {
  try {
    const cuisineId = req.params.id;
    const adminId = req.body.adminId;
    const imgName = req.body.image;

    // Check if the document already exists
    // const docRef = db.collection("admins").doc(adminId);
    // const doc = await docRef.get();

    if (!!cuisineId) {
      try {
        const docRef = db.collection("cuisines").doc(cuisineId);
        const doc = await docRef.get();
        if (doc.exists) {
          fs.unlink("assets/images/foodImages/" + imgName, (error) => {
            if (error) {
              console.log(error)
            }
          })
          const response = await db.collection("cuisines").doc(cuisineId).delete();
          return res.send({
            status: 200,
            response: response,
            message: `${cuisineId} has been deleted.!`,
          });
        }
      } catch (error) {
        return res.send({ status: 400, message: error });
      }
    } else {
      return res.send({
        status: 401,
        message: "sorry you are not an admin.!",
      });
    }
  } catch (error) {
    return res.send(error);
  }
});


// create a coupon
app.post("/coupons/:id", async (req, res) => {
  const id = req.params.id;

  const common = {
    available: req.body.available,
    createdOn: req.body.createdOn,
    expiryDate: req.body.expiryDate,
    isActive: req.body.isActive,
    minimumAmount: req.body.minimumAmount,
    prize: req.body.prize,
    totalUse: req.body.totalUse
  }

  const unCommon = {
    isActive: req.body.isActive,
    minimumAmount: req.body.minimumAmount,
    prize: req.body.prize,
    usedBy: req.body.usedBy
  }


  try {
    const doc = await db.collection("coupons").doc(id).get();

    if (common.expiryDate) {

      if (doc.exists) {
        return res.send({ status: 405, message: "this coupon does exist.!" })
      } else {
        const doc = await db.collection("coupons").doc(id).set(common)

        return res.send({ status: 201, message: "coupon has been created.!" })
      }
    } else {

      if (doc.exists) {
        return res.send({ status: 405, message: "this coupon does exist.!" })
      } else {
        const doc = await db.collection("coupons").doc(id).set(unCommon)

        return res.send({ status: 201, message: "coupon has been created.!" })
      }
    }

  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});

// get all coupons
app.get("/couponsAll/:id", async (req, res) => {
  const adminId = req.params.id;
  try {
    const docRef = db.collection("admins").doc(adminId);
    const doc = await docRef.get();

    // if (!!doc.exists) {
    //   return res.send({ status: 401, message: "you are not an admin.!" })
    // }
    const docs = await db.collection("coupons").get();

    let data = [];

    if (!docs.empty) {
      docs.forEach(doc => {
        data.push({
          couponId: doc.id,
          couponData: doc.data(),
        });
      });

      return res.send({
        message: "coupons are found you looking for.",
        status: 200,
        coupons: data,
      });
    }


    return res.send({
      message: "coupons are not found you looking for.",
      status: 404,
      coupons: data,
    });


  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});


// update status of a coupon
app.post("/couponsUpdate/:id", async (req, res) => {
  const id = req.params.id;
  const adminId = req.body.adminId;

  const common = {
    available: req.body.available,
    createdOn: req.body.createdOn,
    expiryDate: req.body.expiryDate,
    isActive: req.body.isActive,
    minimumAmount: req.body.minimumAmount,
    prize: req.body.prize,
    totalUse: req.body.totalUse
  }

  const unCommon = {
    isActive: req.body.isActive,
    minimumAmount: req.body.minimumAmount,
    prize: req.body.prize,
    usedBy: req.body.usedBy
  }

  const doc = await db.collection('coupons').doc(id).get();
  if (!doc.exists) {
    return res.send({ status: 400, message: "coupon not found to update" })
  }

  try {
    // const docRef = db.collection("admins").doc(adminId);
    // const doc = await docRef.get();

    if (!id) {
      return res.send({ status: 401, message: "you are not an admin.!" })
    } else {

      if (common.expiryDate) {
        const doc = await db.collection("coupons").doc(id).update(common)

        return res.send({ status: 201, message: "coupon has been updated.!" })
      } else {

        const doc = await db.collection("coupons").doc(id).update(unCommon)
        return res.send({ status: 201, message: "coupon has been updated.!" })


      }
    }

  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});

//delete a coupon
app.delete("/couponsDelete/:id", async (req, res) => {
  const adminId = req.body.adminId;
  const couponId = req.params.id;

  try {
    // const doc = await db.collection('admins').doc(adminId).get();
    if (!couponId) {
      return res.send({ status: 400, message: "coupon not found to update" })
    }
    const deleteRes = db.collection("coupons").doc(couponId).delete();
    return res.send({ status: 410, message: "coupon deleted." })



  } catch (error) {
    return res.send(error);
  }
});

//add slider img
app.post("/sliders/:id", uploadSlider.single("image"), async (req, res) => {
  const imgId = req.params.id;
  const fileName = req?.file?.filename || "img"


  try {

    const newImage = { active: true, src: `${baseURL}/images/sliderImages/${fileName}` };

    const resSlider = await db.collection("settings").doc("slider").update({
      images: admin.firestore.FieldValue.arrayUnion(newImage),
    })


    return res.send({ status: 201, message: "new image added." });


  } catch (error) {
    return res.send(error);
  }

})


//delete a slider
app.delete("/slider/:id", async (req, res) => {
  const slider = req.body.sliderId;
  const status = req.body.status;
  const adminId = req.params.id;

  try {
    const doc = await db.collection('admins').doc(adminId).get();
    if (!doc.exists) {
      return res.send({ status: 400, message: "coupon not found to update" })
    }



    const newImage = { src: slider, active: status };

    const resSlider = await db.collection("settings").doc("slider").update({
      images: admin.firestore.FieldValue.arrayRemove(newImage),
    })


    const pathParts = slider.split('/');
    const imgName = pathParts[pathParts.length - 1];




    fs.unlink("assets/images/sliderImages/" + imgName, (error) => {
      if (error) {
        console.log(error)
      }
    })

    return res.send({ status: 410, message: "coupon deleted." })

  } catch (error) {
    return res.send(error);
  }
});

//update a slider
app.post("/sliderUpdate/:id", async (req, res) => {
  const slider = req.body.sliderId;
  const status = req.body.status;
  const adminId = req.params.id;

  try {
    const doc = await db.collection('admins').doc(adminId).get();
    if (!doc.exists) {
      return res.send({ status: 400, message: "coupon not found to update" })
    }

    const newImage = { src: slider, active: status };

    const resSlider = await db.collection("settings").doc("slider").update({
      images: admin.firestore.FieldValue.arrayUnion(newImage),
    })


    const pathParts = slider.split('/');
    const imgName = pathParts[pathParts.length - 1];




    fs.unlink("assets/images/sliderImages/" + imgName, (error) => {
      if (error) {
        console.log(error)
      }
    })

    return res.send({ status: 410, message: "coupon deleted." })

  } catch (error) {
    return res.send(error);
  }
});


//add a location
app.post("/location", async (req, res) => {

  const adminId = req.body.adminId;

  // const doc = await db.collection('admins').doc(adminId).get();
  // if (!doc.exists) {
  //   return res.send({ status: 400, message: "coupon not found to update" })
  // }

  const locationId = req.body.id;
  const locationFee = req.body.fee;
  const locationObj = {
    fee: Number(locationFee)
  }

  try {
    const response = await db.collection("deliveryLocations").doc(locationId).set(locationObj)
    return res.send({ status: 201, message: "location added successfully." })

  } catch (error) {
    return res.send(error)
  }
})


//delete a location
app.delete("/location", async (req, res) => {
  const adminId = req.body.adminId;
  const locationId = req.body.id;

  // const doc = await db.collection('admins').doc(adminId).get();
  // if (!doc.exists) {
  //   return res.send({ status: 400, message: "coupon not found to update" })
  // }

  try {
    const response = await db.collection("deliveryLocations").doc(locationId).delete();

    return res.send({ status: 410, message: "location deleted." })

  } catch (error) {
    return res.send(error);
  }
});

// get all coupons
app.get("/usersAll/:id", async (req, res) => {
  const adminId = req.params.id;
  try {
    const docRef = db.collection("admins").doc(adminId);
    const doc = await docRef.get();
    if (!doc.exists) return res.send({ status: 401, message: "you are not an admin.!" })

    const docs = await db.collection("users").get();

    let data = [];

    if (!docs.empty) {
      docs.forEach(doc => {
        data.push({
          usersId: doc.id,
          userData: doc.data(),
        });
      });
      return res.send({
        message: "users are found you are looking for.",
        status: 200,
        users: data,
      });
    }
    return res.send({
      message: "coupons are not found you looking for.",
      status: 404,
      users: data,
    });
  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});

// get all admin
app.get("/adminsAll/:id", async (req, res) => {
  const adminId = req.params.id;
  try {
    const docRef = db.collection("admins").doc(adminId);
    const doc = await docRef.get();
    if (!doc.exists) return res.send({ status: 401, message: "you are not an admin.!" })



    const docs = await db.collection("admins").get();

    let data = [];

    if (!docs.empty) {
      docs.forEach(doc => {
        data.push({
          usersId: doc.id,
          userData: doc.data(),
        });
      });
      return res.send({
        message: "admins are found you are looking for.",
        status: 200,
        admins: data,
      });
    }
    return res.send({
      message: "admins are not found you looking for.",
      status: 404,
      admins: data,
    });
  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});

// make an admin
app.post("/makeAdmin/:id", async (req, res) => {
  const adminId = req.params.id;
  const userId = req.body.userId;
  const docRef = db.collection("admins").doc(adminId);
  const doc = await docRef.get();
  if (!doc.exists) return res.send({ status: 401, message: "you are not an admin.!" })
  const superAdmin = doc.data()?.superAdmin;
  if (!superAdmin) return res.send({ status: 401, message: "you are not a super admin.!" })
  if (adminId == userId) return res.send({ status: 405, message: "Super admin can not promote or demote itself." })

  try {
    const docs = await db.collection("admins").doc(userId).set({ admin: true })
    return res.send({
      message: `${userId} is an admin now.`,
      status: 201,
    });

  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});

// delete a admin
app.delete("/makeAdmin/:id", async (req, res) => {
  const adminId = req.params.id;
  const userId = req.body.userId;
  const docRef = db.collection("admins").doc(adminId);
  const doc = await docRef.get();
  if (!doc.exists) return res.send({ status: 401, message: "you are not an admin.!" })
  const superAdmin = doc.data()?.superAdmin;
  if (!superAdmin) return res.send({ status: 401, message: "you are not a super admin.!" })
  if (adminId == userId) return res.send({ status: 405, message: "Super admin can not promote or demote itself." })

  try {
    const docs = await db.collection("admins").doc(userId).delete()
    return res.send({
      message: `${userId} is not an admin anymore.`,
      status: 200,
    });

  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});


// check admin or not
app.get("/admins/:id", async (req, res) => {
  const adminId = req.params.id;
  try {
    const doc = await db.collection("admins").doc(adminId).get();

    if (doc.exists) {
      return res.send({
        admin: true
      });
    }
    return res.send({
      admin: false
    });
  } catch (error) {
    return res.send({ message: error.message, status: 404 });
  }
});


// to run the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("server is running on port:- " + PORT);
});

return;