const mongoose = require('mongoose');

const {Schema} = mongoose;


const merchantSchema = new Schema({
    merchant_name:{
        type:String
    },
    merchant_address:{
        type:String
    },
    email:{
        type:String,
        unique:true
    },
    password:{
        type:String
    },
    store_name:{
        type:String
    },
    store_desc:{
        type:String
    },
    bills:[
        {
            type:Schema.Types.ObjectId,
            ref:'Bill'
        }
    ]
    
});

const Merchant = mongoose.model('Merchant',merchantSchema);

module.exports = Merchant;