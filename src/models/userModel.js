import { db } from '../../config/db.js';


class User {

 
  static async findByEmail(email) {
    
    const tables = [ 'users', 'taxpayers'];  // Replace with your actual table names
  
    for (const table of tables) {
      try {
        const query = `SELECT * FROM ${table} WHERE email = $1`;
        const result = await db.query(query, [email]);
  
        if (result.rows.length > 0) {
          return { ...result.rows[0], table };  // Include the table name if needed
        }
      } catch (err) {
        console.error(`Error querying ${table}:`, err);
      }
    }
  
    throw new Error('User not found in any table');
  }


  static async updatePictureByEmail(email, picture) {
    const tables = ['users', 'taxpayers']; // Your actual table names
    
    for (const table of tables) {
      try {
        // Check if email exists in the current table and if the picture is already set
        const selectQuery = `SELECT * FROM ${table} WHERE email = $1`;
        const result = await db.query(selectQuery, [email]);
  
        if (result.rows.length > 0) {
          // Check if the picture is already set
          const existingUser = result.rows[0];
  
          // If picture already exists, do not update
          if (existingUser.picture) {
            console.log('Picture already exists, skipping update.');
            return existingUser; // Return the user without updating
          }
  
          // If no picture exists, proceed with updating the picture
          const updateQuery = `UPDATE ${table} SET picture = $1 WHERE email = $2 RETURNING *`;
          const updateResult = await db.query(updateQuery, [picture, email]);
          
          // Return the updated user data
          return updateResult.rows[0];
        }
      } catch (err) {
        console.error(`Error querying ${table}:`, err);
      }
    }
    
    throw new Error('Email not found in any table');
  }
  
  
  
  
  static async findById(id) {
    const result = await db.query('SELECT * FROM users WHERE user_id = $1', [id]);
    return result.rows[0];
  }

  static async isValidPassword(user, password) {
    return user.password === password; // Hash comparison for real apps
  }

  
}

export  {
  User
};
