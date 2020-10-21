const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const app = express();


mongoose.connect("mongodb+srv://admin-ashutosh:Test123@cluster0.r06ls.mongodb.net/todoDB", {useNewUrlParser: true});

const itemsSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name : "Task 1"
});

const item2 = new Item({
  name : "Task 2"
});

const item3 = new Item({
  name : "Task 3"
});

let itemsArray = [item1, item2, item3];

const listSchema = mongoose.Schema({
  listName: String,
  items: [itemsSchema]
});

const List = mongoose.model("list", listSchema);


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


app.get("/:customListName", function (req, res) {

  const customListName = req.params.customListName;

  List.findOne({listName: customListName}, function (err, list) {
    if(err)
      console.log(err);

    if(list) {
      res.render("todo", {listTitle : customListName, newItems: list.items});
    }
    else {
      const newList = new List({
        listName: customListName,
        items: itemsArray
      });

      newList.save();
      res.redirect("/"+customListName);
    }
  });

});


app.get("/", function(request, response){

  Item.find({}, function (err, foundItems) {
    if(err)
      console.log(err);
    else{
      if(foundItems.length === 0){
        Item.insertMany(itemsArray, function (err) {
          if(err)
            console.log(err);
          else
            console.log("successfully added");
        });
        response.redirect("/");
      }
      response.render("todo", {listTitle : "Today", newItems: foundItems});
    }

  });

});

app.post("/", function(req,res){

  let newItem = req.body.newtask;
  const listName = req.body.button;

  const item = new Item({
    name: newItem
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({listName: listName}, function(err, list){
      if(err)
        console.log(err);
      else{
        list.items.push(item);
        list.save();
        res.redirect("/" + listName);
      }
    });
  }



});

app.post("/delete", function (req, res) {
  const _id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(_id, function(err) {
      if(err)
        console.log(err);
      else
        console.log("Deleted");
    });

    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({listName: listName},
      {$pull: {items: {_id:_id}}},
      function (err, results) {
        if(err)
          console.log(err);
        else{
          res.redirect("/"+listName);
        }
      });

  }

});


app.listen(3000, function () {
  console.log("The server is running at 3000");
});