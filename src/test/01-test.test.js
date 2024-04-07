import { expect } from "chai";
import supertest from "supertest";
import { describe, it, before, after } from "mocha";
import mongoose from "mongoose";


await mongoose.connect(
  "mongodb+srv://santiagoberriolopez:mecanica95@cluster0.d1pj6rg.mongodb.net/?retryWrites=true&w=majority&dbName=ecommerce"
);
const requester = supertest("http://localhost:8080");

describe("Prueba proyecto ", async function () {
  this.timeout(5000);

  describe("Pruebas modulos", async function () {
    before(async () => {
      // Código de configuración previa a las pruebas si es necesario
    });

    

    it("La ruta /api/carts, en su metodo get, permite obtener un carrito", async () => {
     

      
      const response = await requester
        .get("/api/carts/65f23e157df0e17a6f635bcb")
        

      
      expect(response.status).to.equal(200);
      
    });
    
    it("La ruta /api/products/:pid, en su metodo GET, permite obtener información de un producto específico", async () => {
     
      const response = await requester.get("/api/products/1");

      
      expect(response.status).to.equal(200);
    })

     it("debería devolver un mensaje de éxito al actualizar un producto existente", async function () {
      
      const requestData = {
        id: 3, 
        title: "Nuevo título del producto",
        description: "Nueva descripción del producto",
        code: "ABC123",
        price: 99.99,
        stock: 50,
        category: "Electrónica",
        estado: true,
        thumbnail: "https://example.com/thumbnail.jpg",
      };
  
      
      const response = await requester
        .post("/api/productsAct")
        .send(requestData);
  
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("message").that.equals("Producto actualizado con éxito");
    }); 

    it("debería devolver un mensaje de éxito al agregar un nuevo producto", async function () {
      // Datos del nuevo producto a agregar
      const newProductData = {
        title: "Nuevo título del producto",
        description: "Nueva descripción del producto",
        code: "ABC123",
        price: 99.99,
        stock: 50,
        category: "Electrónica",
        thumbnail: "https://example.com/thumbnail.jpg",
        owner: "admin" // Este valor puede variar dependiendo de la lógica de tu aplicación
      };
    
     
      const response = await requester
        .post("/api/Products")
        .send(newProductData);
    
      
      expect(response.status).to.equal(201);
    
      
      expect(response.body).to.have.property("message").that.equals("Producto agregado con éxito");
    });
    

    it("Debería redirigir al usuario a la página de productos después de iniciar sesión correctamente", async () => {
      
      const response = await requester.post("/api/sessions/login")
        .send({ email: "santiagoberriolopez@gmail.com", password: "12345" });
  
      
      expect(response.status).to.equal(302); 
      expect(response.header.location).to.equal("/api/products");
    });
    
  });
});
