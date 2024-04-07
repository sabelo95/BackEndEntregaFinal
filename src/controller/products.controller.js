import { ManagerProduct } from "../services/products.services.js";
import { CartManager } from "../services/carts.services.js";
import { usuariosModelo } from "../dao/models/usuarios.modelo.js";
import { CustomError , trataError} from '../utils/CustomErrors.js';
import { ERRORES_INTERNOS, STATUS_CODES } from '../utils/tiposError.js';
import { errorArgumentos, errorArgumentosDel } from '../utils/errores.js';




const cartManager = new CartManager()
const productManager = new ManagerProduct();

export class productsController {
  constructor() {}
  
  static count= 0
  static async getCart(req, res) {
    try {
      
      
     let updateUsuario

     if ( productsController.count <1){
      
      let userCar = req.user._id;
      const newCart = await cartManager.createCart(userCar);
      req.logger.info(`carrito nuevo ${newCart}`)

       updateUsuario = await usuariosModelo.findOne({
        email: req.session.usuario.email,
      });

      updateUsuario.car =  await newCart._id;
      await updateUsuario.save();
      
    } 

    if (req.session) {
      productsController.count = 1 
  }
  
      
      updateUsuario = await usuariosModelo.findOne({ email: req.session.usuario.email }).lean()

      let usuario = updateUsuario; 
      let rol = updateUsuario.rol;
      let auto = false
      let autoUser= false; 

     
      req.logger.info(`usuario en sesion es ${updateUsuario}`)
      let pagina = 1;
      if (req.query.pagina) {
        pagina = req.query.pagina;
      }

      let limite = null;
      if (req.query.limit) {
        limite = req.query.limit;
      }

      let resultado;
      let preresultado = await productManager.listarProductos(pagina, limite);
      let categoria = req.query.categoria
        ? req.query.categoria.toLowerCase()
        : null;

      if (req.query.categoria) {
        req.logger.info(`entrando a categoria`)
        preresultado = await productManager.listarProductos(
          pagina,
          limite,
          undefined,
          categoria
        );
      }

      if (req.query.sort) {
        req.logger.info(`entrando al sort`)
        let sortOrder = req.query.sort === "desc" ? -1 : 1;
        preresultado = await productManager.listarProductos(
          pagina,
          limite,
          sortOrder,
          categoria
        );
      }

      resultado = preresultado.docs;

      let { totalPages, hasNextPage, hasPrevPage, prevPage, nextPage } =
        preresultado;

      if (rol === "admin") {
        auto = true;
      }

      if (rol === "usuario" || rol === 'premium') {
       autoUser = true;
      }

     

      res.status(200).render("products", {
        resultado: resultado,
        totalPages,
        hasNextPage,
        hasPrevPage,
        prevPage,
        nextPage,
        usuario,
        auto,
        autoUser
      });
    } catch (error) {
      // Manejar errores aquí
      console.log(error)
      res.status(500).send("Error interno del servidor");
    }
  }

  static async crud(req, res) {
    try {
      res.status(200).render("CRUDproducts");
    } catch (error) {
      // Manejar errores aquí
      req.logger.error(error)
      res.status(500).send("Error interno del servidor");
    }
  }


 static async getOneProduct (req, res){
    let id = req.params.pid;
    let idprod = parseInt(id);
  
    if (isNaN(idprod)) {
      return res.send("Error, ingrese un argumento id numerico");
    }
  
   
  
    let resultado = await productManager.listarProductosId(idprod);
  
    res.status(200).render("products", {
      resultado,
    });
  }

  static async postProduct(req, res){
    try {

      if (req.session.usuario.rol !== 'premium' && req.session.usuario.rol !== 'admin') {
        throw new CustomError("Error de permisos", "No puede agregar ningún producto nuevo", STATUS_CODES.ERROR_AUTORIZACION, ERRORES_INTERNOS.PERMISOS, errorArgumentosDel(req.params));
    }
     
      
  
    let  { title, description, code, price, stock, category, thumbnail ,owner} =
      req.body;

      
  
       if (!title || !description || !code || !price || !stock || !category) {
     
        throw new CustomError("Complete campos", "Falta completar los campos requeridos", STATUS_CODES.ERROR_ARGUMENTOS, ERRORES_INTERNOS.ARGUMENTOS, errorArgumentos());
    }   
   
    if (owner === null || owner === '') {
      owner = 'admin';
  }
  
 
    
      const savedProduct = await productManager.addProduct({title, description, code, price, stock, category, thumbnail ,owner});
      res
        .status(201)
        .json({ message: "Producto agregado con éxito", producto: savedProduct });
    } catch (error) {
       res.status(500).json({ error: error });  
     console.log(error)
    }
    
  }

 static  async actProduct(req, res){
    
  
    const {
      id,
      title,
      description,
      code,
      price,
      stock,
      category,
      estado=true,
      thumbnail,
    } = req.body;

    
  
    if (
      !id ||
      !title ||
      !description ||
      !code ||
      !price ||
      !stock ||
      !category ||
      estado === undefined
    ) {
      res.status(400).send("Complete todos los campos");
      
      req.logger.info("No se completo las propiedades necesarias")
    }else {

    
      try {
   
      // Crea un objeto con los campos que deseas actualizar
      const updateFields = {
        title,
        description,
        code,
        price,
        stock,
        category,
        estado,
        thumbnail,
      };
  
      // Utiliza el método updateProductById del manager para actualizar el producto por ID
      const success = await productManager.updateProductById(
        id,
        updateFields
      );
  
      if (success) {
        res.status(200).json({ message: "Producto actualizado con éxito" });
      } else {
        res.status(404).json({ error: "Producto no encontrado" });
      }
    } catch (error) {
      req.logger.error(error)
      res.status(500).json({ error: "Error al actualizar el producto" });
    }
  }
   
  }

  static async deleteProd(req, res){
    
   

    try {

    let {id} = req.body;
    let idprod = parseInt(id);
    let profile= req.session.usuario.rol
    let emailUser = req.session.usuario.email
    
    
    const productToDelete = await productManager.listarProductosId(idprod);
    const owner = productToDelete.owner;

    if (profile !== 'admin'){
      if (owner !== emailUser) {
        throw new CustomError("Error de permisos ", "No puede eliminar productos que no son suyos", STATUS_CODES.ERROR_AUTENTICACION, ERRORES_INTERNOS.PERMISOS, errorArgumentosDel(req.params));
      }
    }
      
     
    if (isNaN(idprod)) {
      throw new CustomError("Complete campos", "Ingrese un id numerico", STATUS_CODES.ERROR_ARGUMENTOS, ERRORES_INTERNOS.ARGUMENTOS, errorArgumentosDel(req.params));
    }
  
   
  
  
      // Utiliza el método deleteProductById del manager para eliminar el producto por ID
      const success = await productManager.deleteProductById(idprod);
  
      if (success) {
        res.status(200).json({ message: "Producto eliminado con éxito" });
      } else {
        res.status(404).json({ error: "Producto no encontrado" });
      }
    } catch (error) {
      /* req.logger.error(error);
      res.status(500).json({ error: "Error al eliminar el producto" }); */
      trataError(error, res) 
    }
  }
}
