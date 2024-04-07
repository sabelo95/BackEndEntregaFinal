import { Router } from 'express';
import nodemailer from 'nodemailer'
export const router=Router()

const transport=nodemailer.createTransport(
      {
          service: 'gmail',
          port: 587, 
          auth: {
              user: "santiagoberriolopez@gmail.com",
              pass: "sqznhvyyrhvcoctd"
          }
      }
  )

 

  router.post("/", async (req, res) => {
      try {
         
         
      } catch (error) {
          console.log(error.message);
          return res.status(404).json({ error: error.message });
      }
  }); 
