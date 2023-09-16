const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./mongodb/connect')
const userRouter = require('./routes/user.routes')
const propertyRouter = require('./routes/property.routes')

dotenv.config();

app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
})
app.use(express.json({limit: '50mb'}));

app.get('/', (req, res)=>{
    res.send({message: 'hello world!'})
})

app.use('/api/v1/users', userRouter)
app.use('/api/v1/properties', propertyRouter)

const startServer = async () => {
    try {
        connectDB(process.env.MONGODB_URL);

        app.listen(8080, ()=>{
            console.log('server is started');
        })
    } catch (err) {
        console.log(err);
    }
}
startServer()