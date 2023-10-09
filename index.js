const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { parse } = require('csv-parse');
const ejs = require('ejs');

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
  return res.render('homepage');
});

app.post('/', upload.single('userBill'), async (req, res) => {

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

    let saved_filename;
    try {
      let template = fs.readFileSync('./views/bill_formate.ejs', 'utf-8');
      let html_bill = ejs.render(template, datas);
      saved_filename = Date.now();
      fs.writeFileSync(`./bills/${saved_filename}.html`, html_bill, 'utf8');
    } catch (error) {
      console.log(error);
      throw new Error();
    }

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

app.post('/onboard',(req,res)=>{
  const { name, address, email, password, storeName, fssaiNo } = req.body;
  // Example: Validate the data (you can add more validation logic)
  if (!name || !address || !email || !password || !storeName || !fssaiNo) {
    return res.render('merchant-registration.ejs', { error: 'Please fill out all fields.' });
  }

  // Handle registration logic (e.g., store in a database)

  // Redirect to a success page or send a success message
  res.render('registration-success.ejs', { name });
})

app.get('/profile/:id',(req,res)=>{
  const merchantProfile = {
      "image": "path/to/profile-image.jpg",
      "name": "Merchant Name",
      "email": "merchant@example.com",
      "storeName": "My Store",
      "fssaiNo": "FSSAI123456789",
      "description": "A brief description of the merchant.",
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

app.get('/:id', (req, res) => {
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
  console.log('Listening on port ' + PORT);
});
