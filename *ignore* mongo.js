const mongoose = require("mongoose");

const password = process.argv[2];

const newPerson = process.argv[3] || null;
const newNumber = process.argv[4] || null;
console.log("Newperson", newPerson, "Newnumber", newNumber);

const url = `mongodb://bob:${password}@cluster0-shard-00-00.uutbw.mongodb.net:27017,cluster0-shard-00-01.uutbw.mongodb.net:27017,cluster0-shard-00-02.uutbw.mongodb.net:27017/note-app?ssl=true&replicaSet=atlas-r52v3b-shard-0&authSource=admin&retryWrites=true&w=majority`;

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("Successfully connected!"))
  .catch((err) => console.log("There was a problem", err));

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (newPerson && newNumber) {
  const person = new Person({
    name: newPerson,
    number: newNumber,
  });
  person.save().then((result) => {
    console.log("Person saved!!");
    mongoose.connection.close();
  });
} else {
  Person.find({}).then((result) => {
    result.forEach((person) => console.log(person));
    mongoose.connection.close();
  });
}
