var express = require("express");
var router = express.Router();
const bcrypt = require('bcryptjs');
const { uuid } = require('uuidv4');
const { blogsDB } = require("../mongo");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();


const createUser = async (username,passwordHash) => {
const collection = await blogsDB().collection('users');

const user ={
username:username,
password:passwordHash,
uid:uuid()
}
try{
await collection.insertOne(user);
return true;


}catch{
    console.error(e)
    return false;

};
}

router.post('/register-user', async (req,res) => {
try{
const username = req.body.username;
const password = req.body.password;
const saltRounds = 5;
const salt = await bcrypt.genSalt(saltRounds);
const hash = await bcrypt.hash(password,salt);
const userJoin = await createUser(username,hash);
res.status(200).json({success:userJoin});

}catch(e){
    res.status(500).json({message: "Error User Join Faild",success:false})
}


})

router.post('/login-user', async(req,res) =>{
const password = req.body.password;
try{
const collection = await blogsDB().collection('users');
const user = await collection.findOne({
    username:req.body.username
    
})

const authenticated = await bcrypt.compare(password,user.password);
if (authenticated) {
    const secretKey = process.env.JWT_SECRET_KEY;
    const userData = {
        time: new Date(),
        userId:user.uid
    };
const token = jwt.sign(userData,secretKey);
res.status(200).json({success:true,token});
return;
}

}catch(e){
    console.log(e);
    res.status(500).json({message:'Error authentication faild',success:false})
}


})

router.get('/validate-token',function(req,res){
    const tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
try{
const token = req.header(tokenHeaderKey);
const verified = jwt.verify(token, jwtSecretKey);
if(verified){
    return res.json({success: true});
    }else{
    // Access Denied
    throw Error("Access Denied")
    }
    } catch (error) {
    // Access Denied
    return res.status(401).json({success: true, message: String(error)});
    }
    

});







 module.exports = router