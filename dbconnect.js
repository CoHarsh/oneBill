const mongoose = require('mongoose')
const DBconnect = async () => {

    await mongoose.connect("mongodb://127.0.0.1:27017/onebill", {
        useNewUrlParser: true
    })
    .then( () => {
        console.log("DB connected!");
    })
    .catch((error)=>{
        console.log(error);
        throw error;
    })

};

module.exports = DBconnect;