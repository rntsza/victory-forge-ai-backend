const postgres = require("postgres");
require("dotenv").config({ path: "../.env" });
const bcrypt = require("bcrypt");
let { PGHOST_POOLED, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID_POOLED } = process.env;

const saltRounds = 10; // Número de rounds para o salt do Bcrypt (quanto maior, mais seguro)

const sql = postgres({
  host: PGHOST_POOLED,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
  connection: {
    options: `project=${ENDPOINT_ID_POOLED}`,
  },
});

class User {
  static async find() {
    const rows = await sql`SELECT * FROM users`;
    rows.forEach((user) => {
      user.password = undefined;
    });
    return rows;
  }

  static async findById(id) {
    const user = await sql`SELECT * FROM users WHERE userid = ${id}`;
    const { ...userWithoutPassword } = user[0];
    userWithoutPassword.password = undefined;
    return userWithoutPassword;
  }

  static async createUser(name, email, password) {
    try {
      const userExists = await sql`SELECT * FROM users WHERE email = ${email}`;
      if (userExists.count > 0) {
        throw new Error("Usuário já existe");
      }
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = await sql`INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${hashedPassword}) RETURNING *`;
      return newUser;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findByIdAndUpdate(id, body, validadors) {
    const { name, email, password, username } = body;
    if(!validadors || validadors.length === 0) {
      throw new Error('No validadors');
    }
    const getUserPassword = await sql`SELECT password FROM users WHERE userid = ${id}`;
    const isPasswordValid = password === getUserPassword[0].password ? true : false;
    if(!isPasswordValid) {
      throw new Error('Password is not valid');
    }
    const user = await sql`UPDATE users SET name = ${name}, email = ${email}, password = ${password}, username = ${username} WHERE userid = ${id} RETURNING *`;
    user[0].password = undefined;
    return user;
  }

  static async findByIdAndDelete(id) {
    const userToDelete =  await sql`DELETE FROM users WHERE userid = ${id} RETURNING *`;
    const message = {
      message: 'User deleted successfully',
      user: userToDelete[0]
    }
    return message;
  }
}

module.exports = User;
