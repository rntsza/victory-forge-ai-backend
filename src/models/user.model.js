const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const saltRounds = 10;

class User {
  static async find() {
    if (!prisma) {
      throw new Error('Prisma não está definido corretamente.');
    }
    const users = await prisma.users.findMany();
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  static async findById(id) {
    const user = await prisma.users.findUnique({
      where: {
        userid: id
      }
    });
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  static async createUser(name, email, password) {
    const userExists = await prisma.users.findUnique({
      where: {
        email: email
      }
    });
    if (userExists) {
      throw new Error("Usuário já existe");
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.users.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword
      }
    });
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  static async findByIdAndUpdate(id, body, validators) {
    const { name, email, password, username } = body;
    if (!validators || validators.length === 0) {
      throw new Error('No validators');
    }
    const user = await prisma.users.findUnique({
      where: {
        userid: id
      }
    });
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Password is not valid');
    }
    const updatedUser = await prisma.users.update({
      where: {
        userid: id
      },
      data: {
        name: name,
        email: email,
        password: password,
        username: username
      }
    });
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  static async findByIdAndDelete(id) {
    const user = await prisma.users.findUnique({
      where: {
        userid: id
      }
    });
    if (!user) {
      throw new Error('User not found');
    }
    await prisma.users.delete({
      where: {
        userid: id
      }
    });
    return {
      message: 'User deleted successfully',
      user: user
    };
  }
}

module.exports = User;
