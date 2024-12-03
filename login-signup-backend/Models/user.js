const mongoose = require('mongoose')
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');



const Schema = mongoose.Schema


const userschema = new Schema({
  email: {
    type: String,
    unique: true
  }, firstname: {
    type: String,

  }, lastname: {
    type: String,

  }, phoneno: {
    type: String,
    unique: true
  }, firmname: {
    type: String,

  }, country: {
    type: String,

  }, state: {
    type: String,

  }, firmsize: {
    type: String,

  },referal:{
    type:String
  },
  firmservices: {
    type: [String],
   
  }, roleinfirm: {
    type: String,

  }, weburl: {
    type: String,
    unique: true
  }, currency: {
    type: String,

  }, usrpassword: {
    type: String,

  }


}, { timestamps: true })




//static login method
userschema.statics.login = async function (email, usrpassword) {

  if (!email || !usrpassword) {
    throw Error('All the Fields must be filled')
  }


  const user = await this.findOne({ email })
  if (!user) {
    throw Error('Incorrect Email')
  }

  const match = await bcrypt.compare(usrpassword, user.usrpassword)
  if (!match) {
    throw Error('Incorrect Password')
  }


  return user
}

module.exports = mongoose.model('Tax', userschema)