import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res) {

  const { name, email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const avatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({ name, email, password, avatar });

    //Create User in Stream Chat
    // const { user } = await serverClient.upsertUser({
    //   id: newUser._id.toString(),
    //   name,
    //   image: avatar
    // });


    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

    res.cookie("jwt", token, { 
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true ,
      sameSite:"strict",
      secure: process.env.NODE_ENV === "production"
     });

    res.status(201).json({ 
      user: newUser,
      success: true,
      message: "User created successfully" 
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req, res) {
  res.send("Login route");
}

export function logout(req, res) {
  res.send("Logout route");
}
