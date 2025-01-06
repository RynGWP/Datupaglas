import { db } from "../../config/db.js";

// Reusable CRUD class
class CRUD {
  constructor(tableName, idColumnName) {
    this.tableName = tableName;
    this.idColumnName = idColumnName;
  }

  // Create a new record
  async create(data) {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Create Error: ${err.message}`);
    }
  }

  // Read a record by ID
  async readById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.idColumnName} = $1`;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Read Error: ${err.message}`);
    }
  }
 
  // Read a record by ID
  async readByIdWithMultipleRow(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.idColumnName} = $1 `;

    try {
      const result = await db.query(query, [id]);
      return result.rows;
    } catch (err) {
      throw new Error(`Read Error: ${err.message}`);
    }
  }

  // Read a record by ID
  async readFiles(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.idColumnName} = $1`;

    try {
      const result = await db.query(query, [id]);
      return result.rows;
    } catch (err) {
      throw new Error(`Read Error: ${err.message}`);
    }
  }
  
  // Read a record by ID
  async readByEmail(email) {
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.idColumnName} = $1`;

    try {
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Read Error: ${err.message}`);
    }
  }

  // Read all records (with optional filters)
  async readAll(filters = {}) {
    let query = `SELECT * FROM ${this.tableName}`;
    const keys = Object.keys(filters);
    const values = Object.values(filters);

    if (keys.length > 0) {
      const conditions = keys
        .map((key, i) => `${key} = $${i + 1}`)
        .join(" AND ");
      query += ` WHERE ${conditions}`;
    }

    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (err) {
      throw new Error(`Read All Error: ${err.message}`);
    }
  }

  // Read all records (with optional filters)
  async readUserList(email) {
    const query = `SELECT * FROM ${this.tableName} WHERE email != $1`;

    try {
      const result = await db.query(query, [email]);
      return result.rows;
    } catch (err) {
      throw new Error(`Read Error: ${err.message}`);
    }
  }

  async readNumberOfPropertiesPerTaxpayers() {
    const query = `SELECT 
    taxpayers.taxpayer_id,
    taxpayers.firstname,
    taxpayers.middlename,
    taxpayers.lastname,
    taxpayers.email,
    taxpayers.complete_address,
    taxpayers.date_of_birth,
    taxpayers.phone,
    taxpayers.gender,
    taxpayers.picture,
    COUNT(DISTINCT properties.property_id) AS property_count, -- Count distinct property IDs
    COUNT(DISTINCT statement_of_account.id) AS statement_count -- Count distinct statement IDs
FROM 
    taxpayers
LEFT JOIN 
    properties 
ON 
    taxpayers.taxpayer_id = properties.taxpayer_id
LEFT JOIN
    statement_of_account
ON
    taxpayers.taxpayer_id = statement_of_account.taxpayer_id
GROUP BY 
    taxpayers.taxpayer_id, 
    taxpayers.firstname,
    taxpayers.middlename,
    taxpayers.lastname,
    taxpayers.date_of_birth,
    taxpayers.phone,
    taxpayers.gender,
    taxpayers.picture;
`;

    try {
      const result = await db.query(query);
      return result.rows;
    } catch (err) {
      throw new Error(`Read Error: ${err.message}`);
    }
  }


  

  // Update a record by ID
  async update(id, data) {
    const updates = Object.keys(data)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(", ");
    const values = Object.values(data);

    const query = `UPDATE ${this.tableName} SET ${updates} WHERE ${this.idColumnName} = $1 RETURNING *`;

    try {
      const result = await db.query(query, [id, ...values]);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Update Error: ${err.message}`);
    }
  }


  // Delete a record by ID
  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE ${this.idColumnName} = $1 RETURNING *`;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Delete Error: ${err.message}`);
    }
  }

 


}


// Utility for Tax Queries
class TaxUtils {
  static async taxReceivables() {
    const query = `
      SELECT SUM(total_tax_amount) AS total_tax
      FROM statement_of_account
      WHERE EXTRACT(YEAR FROM due_date) = EXTRACT(YEAR FROM CURRENT_DATE) ;
    `;

    try {
      const result = await db.query(query);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Tax Receivables Error: ${err.message}`);
    }
  }

  static async collectedTax() {
    const query = `
      SELECT SUM(total_tax_amount) AS total_collected_tax
      FROM statement_of_account
      WHERE EXTRACT(YEAR FROM due_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND status = 'paid';
    `;

    try {
      const result = await db.query(query);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Collected Tax Error: ${err.message}`);
    }
  }

  static async uncollectedTax() {
    const query = `
      SELECT SUM(total_tax_amount) AS total_uncollected_tax
      FROM statement_of_account
      WHERE EXTRACT(YEAR FROM due_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      AND status = 'pending';
    `;

    try {
      const result = await db.query(query);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Uncollected Tax Error: ${err.message}`);
    }
  }

  static async taxpayerCount() {
    const query = `SELECT COUNT(taxpayer_id) AS taxpayer_count FROM taxpayers`;

    try {
      const result = await db.query(query);
      return result.rows[0];
    } catch (err) {
      throw new Error(`Taxpayer Count Error: ${err.message}`);
    }
  }
}

export { CRUD, TaxUtils };
