import { db } from '../../config/db.js';

async function addUser(userData) {
  const {
    firstName,
    lastName,
    email,
    contactNumber,
    barangay,
    hashedPassword
  } = userData;

  try{
  const result =  await db.query (
    `INSERT INTO users (firstname, lastname, email, contactnumber, barangay, password)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id`,
      [
        firstName,
        lastName,
        email,
        contactNumber,
        barangay,
        hashedPassword     
      ]
    );
    return result.rows[0].user_id;
  } catch (error) {
    console.error("Error adding user", error.stack);
    throw error;
  }
}

async function findUserByEmail(email) {
  const userTypes = ['patients', 'users', 'admin'];

  for (const userType of userTypes) {
    const result = await db.query(`SELECT * FROM ${userType} WHERE email = $1 AND status = 'Approved'` , [email]);

    if (result.rows.length > 0) {
      // Check if the user is from the 'users' table to check the user limit
      if (userType === 'users') {
        await checkUserLimit();
      }

      // Attach the role to the user object for further use
      return { ...result.rows[0], role: userType === 'patients' ? 'patient' : userType };
    }
  }

  return null; // No user found
}

async function checkUserLimit() {
  const userCountResult = await db.query('SELECT COUNT(*) FROM users');
  const userCount = parseInt(userCountResult.rows[0].count, 10);

  if (userCount >= 17) {
    throw new Error('User registration closed. Maximum number of users reached.');
  }
}


async function getUserById(userId) {
  try {
    const result = await db.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [userId]
    );
    
    // Check if the user is found
    if (result.rows.length > 0) {
      return result.rows[0]; // Return the first row which contains the user's data
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching user by ID:", error.message);
    throw error;
  }
}





//------------------------------------------------------FOR ADMIN QUERIES TO USER MANAGEMENT--------------------------------------------------


async function getUsers() {
  try {
    const result = await db.query(
      `SELECT * FROM users WHERE status = 'Approved'  ORDER BY firstname ASC; -- Order by firstname in ascending order` // Adjust the order as necessary
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching  user", error.stack);
    throw error;
  }
}

async function getPendingUsers() {
  try {
    const result = await db.query(
      `SELECT * FROM users WHERE status = 'pending'  ORDER BY firstname ASC; -- Order by firstName in ascending order`, // Adjust the order as necessary
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching patients by user", error.stack);
    throw error;
  }
}

async function updatePendingUsers(status, userId) {
  try {
    const result = await db.query(
      `UPDATE users SET status = $1 WHERE user_id = $2`,  
      [status, userId]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching patients by user", error.stack);
    throw error;
  }
}

async function deleteUserById(userId) {
  try {
     await db.query(`DELETE FROM users WHERE user_id = $1`, [userId]);
  } catch(error) {
    console.log("Error deleting Patient", error.stack);
    throw error;
  }
}


async function updatePassword(userType, id, hashedPassword) {
  let query;
  let values;

  switch (userType) {
      case 'users':
          query = `
              UPDATE users 
              SET password = $1
                  
              WHERE user_id = $2
              RETURNING *
          `;
          values = [hashedPassword, id];
          break;

      case 'patients':
          query = `
              UPDATE patients 
              SET password = $1
                  
              WHERE patient_id = $2
              RETURNING *
          `;
          values = [hashedPassword, id];
          break;

      case 'admin':
          query = `
              UPDATE admin 
              SET password = $1
                  
              WHERE admin_id = $2
              RETURNING *
          `;
          values = [hashedPassword, id];
          break;

      default:
          throw new Error('Invalid user type');
  }

  const result = await db.query(query, values);
  
  if (result.rows.length === 0) {
      throw new Error('Failed to update password');
  }
  
  return result.rows[0];
}


export { 
  addUser,
  findUserByEmail,
  getUserById,
  getUsers,
  getPendingUsers,
  updatePendingUsers,
  deleteUserById,



  //update password
  updatePassword
  };
