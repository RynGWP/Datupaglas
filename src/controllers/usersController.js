import { CRUD } from "../models/crud.js";
import bcryptjs from "bcryptjs";

const usersCrud = new CRUD("users", "user_id");
const taxpayersCrud =  new CRUD('taxpayers', 'taxpayer_id');
//for assessor dashboard

async function assessorDashboard(req, res) {
   try {
    
    const session = req.user;
    const assessorCount = (await usersCrud.readAll({usertype:'assessor'})).length;
    const treasurerCount = (await usersCrud.readAll({usertype:'treasurer'})).length;
    const taxpayersCount =  (await taxpayersCrud.readAll()).length;
    console.log(taxpayersCount)
    res.render('admin/adminDashboard', {
      session,
      assessorCount,
      treasurerCount,
      taxpayersCount
    });
    
   }  catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}
//for assessor dashboard

async function createUsers(req, res) {
    try {


      const {
        email,
        firstname,
        middlename,
        lastname,
        password,
        userType,
      } = req.body;
  
      // Hash the password before saving
      const hashedPassword = await bcryptjs.hash(password, 10);
  
      // Create a new users entry
      const newUser = await usersCrud.create({
        email,
        firstname,
        middlename,
        lastname,
        password: hashedPassword,
        userType,
      });
  
      res.redirect('/userlist');
    } catch (error) {
      res.status(500).json({
        message: `Error: ${error.message}`,
      });
    }
  }
  

// Read all information of users (all row)
async function readUsers(req, res) {
  try {

    const session =  req.user;
   
   const users = await usersCrud.readAll();
    console.log(users)
    res.render('admin/userList', {
      users,
      session
    });


  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}

// UPDATE users by id
async function updateUsers(req, res) {
  try {
    const id = parseInt(req.body.user_id, 10);
    const { firstname,
            middlename,
            lastname,
            email,
            password,
            userType } = req.body;

    // Hash the password only if provided
    const hashedPassword = await bcryptjs.hash(password, 10);

    await usersCrud.update(
        id,
      { firstname,
        middlename,
        lastname,
        email,
        password: hashedPassword,
        userType}
    );

    res.redirect('/userlist');
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


// DELETE users
async function deleteUsers(req, res) {
  try {
    const users_id = req.params.id;
    await usersCrud.delete(users_id);
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


export {
  assessorDashboard,
  createUsers,
  readUsers,
  updateUsers,
  deleteUsers
}