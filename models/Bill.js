const mongoose = require('mongoose');

const {Schema} = mongoose;


const billSchema = new Schema({
    merchant_id:{
        type:Schema.Types.ObjectId,
        ref:'Merchant'
    },
    price:{
        type:String,
        require:true
    },
    bill_content:{ // in HTML formate so no need to watch over all the things
        type:String,
        require:true
    }
});

const Bill = mongoose.model('Bill',billSchema);

module.exports = Bill;