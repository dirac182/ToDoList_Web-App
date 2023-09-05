import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
import 'dotenv/config'

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday","Friday","Saturday"];
const monthNames = ["January", "February", "March", "April","May","June","July","August", "September", "October", "November","December"];
const app = express();

// Database Stuff
mongoose.connect(process.env.DB_LINK);
const itemsSchema = {
    name: String
}
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item ({
    name: "Welcome to your Todolist!"
});
const item2 = new Item ({
    name: "Hit the + button to add a new item."
});
const item3 = new Item ({
    name: "<-- Hit this to delete an item."
});
const defaultItems = [item1,item2,item3];

function addDefaults(){
    Item.insertMany(defaultItems)
    .then(function(){
        console.log("Successfully saved defaults into our DB.");
    })
    .catch(function(err){
        console.log(err);
    });
};

const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);
// End database stuff

var date = new Date();
var dayOfWeek = dayNames[date.getDay()];
var dayOfMonth = date.getDate();
var month = monthNames[date.getMonth()];
var timestamp = dayOfWeek + ", " + month + " " + dayOfMonth;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
var tabs = [];

function getTabs() {
    List.find({})
        .then((i) => { 
            tabs = [];
            tabs = i;
        })
        .catch((error) =>{
            console.error('Error:', error);    
        })
}

app.get("/", (req, res) => {
    getTabs();
    Item.find().exec()
    .then((items) => {
        if (items.length === 0){
            addDefaults();
            res.redirect("/")
        } else{
            var todoListName = "Today"
            res.render("index.ejs",{tabs:tabs, todoListName:todoListName, todoList: items, timestamp:timestamp});
        }})
    .catch((error) => {
        console.error('Error:', error);    
        })
});

app.post("/submitHome", (req,res) => {
    console.log(req.body);
    var input = req.body.addList;
    var todoListName = req.body.list;
    var newItem = new Item ({
        name: `${input}`
     });
     if (todoListName === "Today"){
        newItem.save();
        res.redirect("/");
    }else {
        List.findOne({name: todoListName})
        .then ((foundList) =>{
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + todoListName)
        })
        .catch((error) => {
            console.log("Error:" + error);
        })
     }
})
app.post("/delete", (req,res) =>{
    const checkedItemId = req.body.checkedBox;
    const todoListName = req.body.listName;
    if(todoListName === "Today"){
        Item.deleteOne({_id: checkedItemId})
        .then((items) => {
            res.redirect("/");
        })
        .catch((error) => {
            console.error('Error:', error);    
        })
    }else {
        List.findOneAndUpdate({name: todoListName},{$pull:{items:{_id:checkedItemId}}})
        .then((foundList) => {
            res.redirect("/" + todoListName);
        })
        .catch((error) => {
            console.log(error);
        })
    }
})
app.post("/clearHome", (req,res) =>{
    List.deleteMany({})
    .then((items) => {
        res.redirect("/");
    })
    .catch((error) => {
        console.error('Error:', error);    
        })
    Item.deleteMany({})
    .then((items) => {
        res.redirect("/");
    })
    .catch((error) => {
        console.error('Error:', error);    
        })
})

app.post("/submit", (req,res) => {
    const userInput = req.body.inputField;
    const newListName = _.capitalize(userInput);
    List.findOne({name: newListName})
    .then((foundList) => {
        if (foundList){
            res.render("index.ejs", {tabs: tabs, todoListName:foundList.name, todoList: foundList.items, timestamp:timestamp})
        } else {
            const list = new List({
                name: newListName,
                items: defaultItems
            });
            list.save();
            console.log("new list saved");
            getTabs();

            res.redirect("/" + newListName);
        }
    })
    .catch((error) => {
        console.log("Error:" + error);
    })
})

app.get("/:customListName", (req,res) =>{
    List.findOne({name: req.params.customListName})
    .then((foundList) => {
        if (foundList){
            getTabs();
            res.render("index.ejs", {tabs: tabs, todoListName:foundList.name, todoList: foundList.items, timestamp:timestamp})
        }})
    .catch((error) =>{
        console.log("Error:" + error);
    })
});

let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}

app.listen(port,() =>{
    console.log(`Server has started successfully.`);
})