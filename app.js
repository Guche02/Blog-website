const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose")
// To use user module
const User = require("./user.js")
const _ = require("lodash");
//It is used to add functionality to the URL encoding and provide specified pages according to the URL.


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/blogDB", { useNewUrlParser: true }).then(function () {
  console.log("Successfully Connected.")
})

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema)

app.get("/", function (req, res) {
  Post.find({}).then(function (result) {
    if (result.length === 0) {
      console.log("No posts are present.")
      res.render("home", { homeContent: homeStartingContent, posts: result });
    }
    else {
      res.render("home", { homeContent: homeStartingContent, posts: result });
      // console.log(result);
    }
  })
})

app.get("/compose", function (req, res) {
  res.render("compose");
})

app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent });
})

app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent });
})

app.get("/register", function (req, res) {
  res.render("register");
})

app.get("/login", function (req, res) {
  res.render("login");
})



//To specify the parameters, to avoid making a custom route for each and every options.
app.get("/posts/:postID", function (req, res) {
  const requestedId = req.params.postID
  // console.log(requestedId)

  Post.findOne({ _id: requestedId }).then((function (result) {
    if (result) {
      res.render("post", { post: result })
    }
    else {
      res.render("post", { notFoundMessage: "No results found." })
    }
  }))

  // used while implementing without database.
  // storedtitle = _.lowerCase(post.title)
  // // It is used to change all the words into lowerCase and ignore the - in the URL
  // // The - format used to speicfy the parameters in URL is called kebab format.
})


app.post("/compose", function (req, res) {
  // creating a document to store the blog posts.

  const post = new Post({
    title: _.capitalize(req.body.newTitle),
    content: req.body.newPost
  });
  post.save();
  res.redirect("/")
})

app.post("/reg", function (req, res) {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email
  })
  newUser.password = newUser.generateHash(req.body.pass);
  newUser.save();
  res.redirect("/login")
})

// let loggedIn = false;

// checking the credentials.
app.post("/log", function (req, res) {
  User.findOne({email: req.body.email}).then(function(user) {
    console.log("User found")
    if (!user.validPassword(req.body.pass)) {
      console.log("Password didn't match")
    } else {
      // loggedIn = true
      console.log("Password Matched.")
      res.redirect("/home")
    }
  }).catch(function(error)
  {
    console.log(error)
  })
})

app.post("/search", function (req, res) {
  const requestedTitle = _.capitalize(req.body.blogName)

  Post.findOne({ title: requestedTitle }).then(function (result) {
    if (result) {
      res.redirect("/posts/" + result._id)
    }
    else {
      res.render("post", { notFoundMessage: "No results found.", post: NaN })
    }
  })
})


app.listen(3000, function () {
  console.log("Server started on port 3000");
});
