import express from "express";
import { productsController } from "../controller/products.controller.js";
import { auth,authAdmin,authUser,authPremium } from "../utils/utils.js";



const router = express.Router();



router.get("/products", auth,productsController.getCart );

router.get("/crudProduct",authAdmin,auth, productsController.crud )

router.get("/products/:pid",auth,  productsController.getOneProduct);

router.post("/products",auth,authAdmin, productsController.postProduct);

router.post("/productsAct",auth,authAdmin,productsController.actProduct);

router.post("/delete",auth, authAdmin, productsController.deleteProd);

export default router;
