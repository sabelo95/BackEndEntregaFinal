import { CartManager } from "../services/carts.services.js";
import { ManagerProduct } from "../services/products.services.js";
import { TicketModel } from "../dao/models/ticket.model.js";
import { CustomError , trataError} from '../utils/CustomErrors.js';
import { ERRORES_INTERNOS, STATUS_CODES } from '../utils/tiposError.js';
import { errorArgumentos, errorArgumentosDel } from '../utils/errores.js';
import nodemailer from 'nodemailer'

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

const cartManager = new CartManager();
const productManager = new ManagerProduct();
export class cartsController {
  constructor() {}

  static async postCarts(req, res) {
    /* const newCart = cartManager.createCart();
        res.status(201).json(newCart); */
    try {
      const newCart = await cartManager.createCart(userCar);
      res.status(201).json(newCart);
    } catch (error) {
      req.logger.error(error)
      res.status(500).json({ error: "Error al crear el carrito" });
    }
  }

  static async getOneCart(req, res) {
    let id = req.params.cid;
    
    try {
      const resultado = await cartManager.getCart(id);

      if (!resultado) {
        res.status(404).json("Carrito no encontrado");
      } else {
        res.setHeader("Content-Type", "text/html");
        res.status(200).render("carrito", { resultado, id });
      }
    } catch (error) {
      req.logger.error(error)
      res.status(500).json({ error: "Error al obtener el carrito" });
    }
  }

  static async postProductOnCart(req, res) {
    let productId = req.params.pid;
    let id = req.params.cid;
    
    try {
      
       const product = await productManager.listarProductosIdMongo(productId);
       console.log('producto',product)
       const owner = product.owner;
      
      console.log('owner',owner)
      let emailUser = req.session.usuario.email
      console.log('mail',emailUser)  

      if (owner === emailUser) {
         res
          .status(200)
          .json({ message: "No puedes agregar tus propios productos al carrito" });
    } else {
    
      if (await cartManager.addProductToCart(id, productId)) {
        res
          .status(200)
          .json({ message: "Producto agregado al carrito con éxito" });
      } else {
        res.status(404).json({ error: "Carrito no encontrado" });
      }
    }
    } catch (error) {
     
      res
        .status(500)
        .json({ error: "Error al agregar el producto al carrito " });
    }
  }

  static async postProductOnCartAct(req, res) {
    const productId = req.params.pid;
    let id = req.params.cid;

    const newQuantity = req.body.quantity;
    req.logger.info(newQuantity)

    try {

      const product = await productManager.listarProductosId(productId);
      const owner = product.owner;
      let emailUser = req.session.usuario.email
      console.log('owner',owner)
      console.log('mail',emailUser)

      if (owner == emailUser) {
        throw new CustomError("Error de permisos ", "No puede agregar productos tuyos", STATUS_CODES.ERROR_AUTENTICACION, ERRORES_INTERNOS.PERMISOS, errorArgumentosDel(req.params));
      }

      if (newQuantity !== undefined && newQuantity !== null) {
        // Actualiza la cantidad del producto en el carrito
        if (
          await cartManager.updateProductQuantityInCart(
            id,
            productId,
            newQuantity
          )
        ) {
          res
            .status(200)
            .json({ message: "Cantidad del producto actualizada con éxito" });
        } else {
          res
            .status(404)
            .json({ error: "Producto no encontrado en el carrito" });
        }
      } else {
        res
          .status(400)
          .json({ error: "La cantidad del producto no se proporcionó" });
      }
    } catch (error) {
      req.logger.error(error)
      res.status(500).json({ error: "Error al procesar la solicitud" });
    }
  }

  static async deleteCart(req, res) {
    let productId = req.params.pid;
    
    
    let id = req.params.cid;
   /*  id = parseInt(id);
    

    if (isNaN(id)) {
      return res.send("Error, ingrese un argumento id numerico");
    } */

    try {
      if (await cartManager.removeProductFromCart(id, productId)) {
        res.status(200).json({ message: "Producto eliminado con exito" });
      } else {
        res.status(404).json({ error: "Carrito no encontrado" });
      }
    } catch (error) {
       req.logger.error(error); 
      
      res.status(500).json({ error: "Error al eliminar el producto" });
    }
  }

  

  static async generateTicket(req, res) {
    try {
     
      let carUsuario = req.user.car;
      let carrito = await cartManager.getCart(carUsuario);

      
      let { noStock, productsStock } = await productManager.updateProductQuantities(carrito);

      
      let amount = productsStock.reduce((totalAmount, product) => {
        const price = product.product.price;
        if (!isNaN(price)) {
          return totalAmount + price * product.quantity;
        } else {
          return totalAmount;
        }
      }, 0);

      
      const nuevoTicketData = {
        purchase_datetime: new Date(),
        products: productsStock,
        amount: amount,
        purchaser: req.user.email,
      };
      const nuevoTicket = await TicketModel.create(nuevoTicketData);

      
      cartManager.updateCartWithNoStockProducts(carUsuario, noStock);

      
      const ticketHTML = `
        <h1>Ticket de Compra</h1>
        <h2>GRACIAS POR TU COMPRA :)</h2>
        <p>Fecha de Compra: ${nuevoTicketData.purchase_datetime}</p>
        <h2>Productos:</h2>
        <ul>
          ${nuevoTicketData.products.map(product => `
            <li>
              <strong>${product.product.title}</strong> - Precio: ${product.product.price} - Cantidad: ${product.quantity}
            </li>
          `).join('')}
        </ul>
        <p>Total a Pagar: ${nuevoTicketData.amount}</p>
        <p>Comprador: ${nuevoTicketData.purchaser}</p>
        ${noStock.length ? `
          <h2>Productos no disponibles:</h2>
          <ul>
            ${noStock.map(product => `
              <li>${product.product.title} - ${product.product.description}</li>
            `).join('')}
          </ul>
          <p>Lo sentimos, estos productos no están disponibles en este momento. Te avisaremos cuando haya inventario.</p>
        ` : ''}
      `;

      
      await transport.sendMail({
        from: "Santiago Berrio santiagoberriolopez@gmail.com",
        to: req.user.email,
        subject: "Detalle de tu compra",
        html: ticketHTML,
      });

      
      res.status(200).render('ticket', {
        purchase_datetime: nuevoTicketData.purchase_datetime,
        products: nuevoTicketData.products,
        amount: nuevoTicketData.amount,
        purchaser: nuevoTicketData.purchaser,
        noStock: noStock
    });
    } catch (error) {
      
      req.logger.error(error);
      res.status(500).json({ error: "Error al generar el ticket y enviar el correo electrónico" });
    }
  }
}
