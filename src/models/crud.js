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

export { CRUD };
