const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { parse } = require('csv-parse');
const ejs = require('ejs');
const DBconnect = require('./dbconnect')
const Merchant = require('./models/Merchant')
const Bill = require('./models/Bill');
const app = express();
const PORT = 8000;
let filename_final;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    filename_final = `${Date.now()}-${file.originalname}`;
    cb(null, filename_final);
  },
});

function GenerateBill(filename) {
  return new Promise((resolve, reject) => {
    const resto_info = [];
    const resto_bill = [];
    const billname = `./uploads/${filename}`;
    fs.createReadStream(billname)
      .pipe(parse({ delimiter: ',' }))
      .on('headers', function (row) {
        resto_info.push(row);
      })
      .on('data', function (row) {
        resto_bill.push(row);
      })
      .on('end', function () {
        console.log('Finished');
        resolve([resto_info, resto_bill]);
      })
      .on('error', function (err) {
        console.error(err);
        reject(err);
      });
  });
}

const upload = multer({ storage });

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get('/', (req, res) => {
  return res.render('intropage');
});

app.get('/bill/:id',(req,res)=>{
  return res.render('homepage');
})

app.post('/generatebill', upload.single('userBill'), async (req, res) => {
  let merchant_id = '653a5b17ef3c567375d8d427';
  try {
    const data = await GenerateBill(filename_final);
    if (!data[0] || !data[1]) {
      return res.render('errorpage');
    }

    let datas = {
      resto_name: data[1][0][0],
      resto_desc: data[1][0][1],
      resto_addr: data[1][0][2],
      menuItems: data[1].slice(1, data[1].length),
    };

    let new_bill;
    try{
      new_bill = await new Bill({
        merchant_id:merchant_id,
        price:"50",
        bill_content:JSON.stringify(datas)
      });
      new_bill.save();
    }catch(error){
      console.log(error);
      return res.render(`/bill/${merchant_id}`);
    }


    let saved_filename = `/bill/${new_bill._id}`;
    // try {
    //   let template = fs.readFileSync('./views/bill_formate.ejs', 'utf-8');
    //   let html_bill = ejs.render(template, datas);
    //   saved_filename = Date.now();
    //   fs.writeFileSync(`./bills/${saved_filename}.html`, html_bill, 'utf8');
    // } catch (error) {
    //   console.log(error);
    //   throw new Error();
    // }

    return res.render('ackno_billgen', {
      link_url: `${saved_filename}`,
    });
  } catch (error) {
    console.error(error);
    return res.render('errorpage', { error: error });
  }
});


app.get('/onboard',(req,res)=>{
  return res.render('merchant-registration',{name:'harsh'})
})
app.get('/login',(req,res)=>{
  return res.render('login');
});

app.post('/login',async (req,res)=>{
  const {email,password} =req.body;
  if(!email || !password){
    return res.render('login',{ error: 'Please fill out all required fields'});
  }

  console.log(email,password);
  let merchant_profile;
  try{
    merchant_profile= await Merchant.findOne({
      'email':email
    });
    console.log(merchant_profile)
  }catch(error)
  {
    console.log(error);
    return res.render('login',{'error':"Some technical error! please try again!"});
  }
  let timestamp = merchant_profile._id;
  if(merchant_profile){
    return res.redirect(`profile/${timestamp}`)
  }else{
    return res.render('login',{error:"User does not exist! please enter valid credentials"});
  }
})

app.post('/onboard',(req,res)=>{
  const { name, address, email, password, storeName, store_desc } = req.body;
  // Example: Validate the data (you can add more validation logic)
  if (!name || !address || !email || !password || !storeName || !store_desc) {
    return res.render('merchant-registration.ejs', { error: 'Please fill out all fields.' });
  }

  // Handle registration logic (e.g., store in a database)
  let new_merchant;
  try{
    new_merchant=new Merchant({
    merchant_name:name,
    merchant_address:address,
    email:email,
    password:password,
    store_name:storeName,
    store_desc:store_desc
  });
  }catch(error){
    console.log(error);
    throw error;
  }

  try{
    new_merchant.save();
  }catch(error){
    console.log(error);
    throw error;
  }
  // Redirect to a success page or send a success message
  res.render('registration-success.ejs', { name });
})

app.get('/profile/:id',async (req,res)=>{
  let merchant_id = req.params.id;
  let merchant_info;
  try{
    merchant_info = await Merchant.findOne({_id:merchant_id});
  }catch(error){
    console.log(error);
    return res.redirect('/login');
  }

  //fetch the bill detail
  let bill_details = [];
  for(let i = 0;i<merchant_info.bills.length;i++){
    let bill_details_1;
    try{
      bill_details_1 = await Bill.findById(merchant_info.bills[i]);
    }catch(error){
      console.log(error);
      return res.redirect(`profile/${merchant_id}`)
    }
    if(bill_details_1){
      bill_info = {};
      bill_info.name = `Bill ${i}`;
      bill_info.orderPrice = bill_details_1.price;
      bill_info_orderPrice
    }
  }
  
  const merchantProfile = {
      "image": "path/to/profile-image.jpg",
      "name": merchant_info.merchant_name,
      "email": merchant_info.email,
      "storeName": merchant_info.store_name,
      "description": merchant_info.store_desc,
      "bill_generate_link":`/bill/${merchant_info._id}`,
      "bills": [
        {
          "name": "Bill 1",
          "orderPrice": 20,
          "billURL": "https://example.com/bill1",
          "billID": "12345"
        },
        {
          "name": "Bill 2",
          "orderPrice": 30,
          "billURL": "https://example.com/bill2",
          "billID": "67890"
        },
        {
          "name": "Bill 3",
          "orderPrice": 25,
          "billURL": "https://example.com/bill3",
          "billID": "54321"
        },
        {
          "name": "Bill 4",
          "orderPrice": 40,
          "billURL": "https://example.com/bill4",
          "billID": "98765"
        }
      ]
  }
  
  res.render('merchant_profile.ejs', {merchantProfile})
})

app.get('/bill/:id', (req, res) => {
  const id = req.params.id;
  let htmllbill_file = `${id}.html`;
  console.log(htmllbill_file);
  try {
    return res.sendFile(path.join(__dirname, `bills/${htmllbill_file}`));
  } catch (error) {
    return res.render('error', { error: error });
  }
});

app.listen(PORT, function () {
  DBconnect();
  console.log('Listening on port ' + PORT);
});
