"use strict";

import User from "../../models/User.js";

export async function GetUserPage(req, res) {
  const allUsers = await User.find();
  res.render("admin/users", { users: allUsers });
}

export async function SetBlockStatus(req, res) {
  const userId = req.params.userId;
  const isBlocked = req.body.isBlocked;

  const user = await User.findById(userId);
  user.isBlocked = isBlocked;
  await user.save();
  
  res.sendStatus(201)
}
