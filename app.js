//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://pranavcd:PranavMongooseda@cluster0.hzgxql1.mongodb.net/todolistDB");
const itemSchema = new mongoose.Schema({name:String});
const Item = mongoose.model("Item",itemSchema);

const motm= new Item({name:"Welcome to your todo list"});
const motm2= new Item({name:"click + to add more items"});
const motm3= new Item({name:"<--- Hit this to delete an item"});


const listSchema = new mongoose.Schema({name:"String",items:[itemSchema]});
const  List = mongoose.model("List",listSchema);




app.get("/", function(req, res) {
  Item.find({},function(err,itemsObj)
  {
    if(itemsObj.length==0)
    {
      
           Item.insertMany([motm,motm2,motm3],function(err)
           {
           if(err)
              { 
                console.log(err);
               }
                else 
                 {
              console.log("documents added to collection");
                }
            });
            res.redirect("/");
          }  

      else
      {
        res.render("list", {listTitle: "Today", newListItems: itemsObj});
      }   
    
});
});

    app.get("/:dynamicName",function(req,res)
    {
     
      const paramName = _.capitalize(req.params.dynamicName);
      List.findOne({name:paramName},function(err,foundObject)
      {
        if(!foundObject)
        {
          const list = new List({name:paramName,
            items:motm,motm2,motm3
           });
            list.save();
            res.redirect("/"+ paramName);
        }
        else
        {
res.render("list",{listTitle:foundObject.name,newListItems:foundObject.items});
        }
      })
    });
           
          
 



  

app.post("/", function(req, res){

  const additem = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({name:additem});
  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }  
  else
  {
    List.findOne({name:listName},function(err,foundDoc)
    {
foundDoc.items.push(item);
foundDoc.save();
res.redirect("/"+ listName);
    });
  }

  
 
});
app.post("/delete",function(req,res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItem,function(err,docs){
      if(!err){
        console.log(docs);
        res.redirect("/");
      }
     
    });
  }
  else
  {
List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,deletedItem){
  if(!err){
    console.log(deletedItem);
    res.redirect("/"+ listName);
  }
});
  }
 

});


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
