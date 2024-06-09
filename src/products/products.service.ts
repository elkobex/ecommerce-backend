import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProductPagination } from './product.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './producto.schema';
import { ColorModel, ColorModelDocument } from './color-model.schema';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
  
  constructor(
    @InjectModel('product') private readonly productModel: Model<ProductDocument>,
    @InjectModel('colorModel') private readonly colorModel: Model<ColorModelDocument>
  ) {}

  async searchProducts(
    category?: string,
    name?: string,
    priceRange?: [number, number],
    color?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ products: Product[], total: number, page: number, pageSize: number }> {
   
    const filter: any = {};

    if (category) {
      filter.category = category;
    }
    if (name) {
      // filter.name = { $regex: new RegExp(name, 'i') };
      name = name.replace('Nios', 'Niños');
      filter.name = { $regex: name, $options: 'i' };
    }

    // Verifica que ambos valores del rango de precios sean números válidos
    if (priceRange && typeof priceRange[0] === 'number' && typeof priceRange[1] === 'number') {
      filter.price = { $gte: priceRange[0], $lte: priceRange[1] };
    }

    if (color) {
      filter.color = color;
      // filter['colors.title'] = color;
    }
  
    const total = await this.productModel.countDocuments(filter);
    const products = await this.productModel.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();
  
    return {
      products,
      total,
      page,
      pageSize
    };
  }
  
  // Método para obtener un producto por su 'identifier'
  async findProductByIdentifier(identifier: string): Promise<Product> {
    const product = await this.productModel.findOne({ identifier }).exec();
    if (!product) {
      throw new HttpException('PRODUCT_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  // Método para obtener un modelo de color por su 'identifier'
  async findModelByIdentifier(identifier: string): Promise<ColorModel> {
    const model = await this.colorModel.findOne({ identifier }).exec();
    if (!model) {
      throw new HttpException('MODEL_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return model;
  }

  // Método para obtener 10 productos por su 'category'
  async findProductsByCategory(category: string): Promise<Product[]> {
    return this.productModel.find({ category }).limit(10).exec();
  }

  async findAllUniqueColors(): Promise<string[]> {
    const products = await this.productModel.find().exec();
    const allColors = products.flatMap(product => product.colors.map(color => color.title));
    const uniqueColors = [...new Set(allColors)];
    return uniqueColors;
  }

  async getPagination(
    query: object,
    page: number,
    offset: number,
    limit: number,
    filterMessage: string,
  ): Promise<ProductPagination | any> {
    try {
      const [products, count] = await Promise.all([
        this.productModel.find(query).skip(offset).limit(limit),
        this.productModel.countDocuments(query),
      ]);

      if (!products.length) {
        throw new HttpException('PRODUCTS_NOT_FOUND', HttpStatus.BAD_REQUEST);
      }

      return {
        isOk: true,
        products,
        pageNumber: page,
        pageSize: limit,
        filterMessage: `${count} ${filterMessage}`,
        totalProducts: count,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      return this.sendHttpExceptionError(error);
    }
  }

  async loadProductsFromFile(): Promise<void> {
    try {
      const filePath = path.join(__dirname, '../..', 'src', 'products/products.txt');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const products = JSON.parse(fileContent);

      for (const productData of products) {
        const product = new this.productModel(productData);
        await product.save();
      }
    } catch (error) {
      return this.sendHttpExceptionError(error)
    }
  }

  async loadProductModelFromFile(): Promise<void> {
    try {
      const filePath = path.join(__dirname, '../..', 'src', 'products/models.txt');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const products = JSON.parse(fileContent);

      for (const productData of products) {
        const product = new this.colorModel(productData);
        await product.save();
      }
    } catch (error) {
      return this.sendHttpExceptionError(error)
    }
  }

  async updateProductColors(): Promise<void> {
    const filePath = path.join(__dirname, '../..', 'src', 'products/colors.txt');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');

    for (const line of lines) {
      const [identifier, name] = line.split('|');
      try {
        await this.colorModel.updateOne({ identifier }, { name });
        console.log(`Actualizado: ${identifier} -> ${name}`);
      } catch (error) {
        console.error(`Error al actualizar ${identifier}:`, error);
      }
    }
  }

  // async updateProductColors(): Promise<void> {
  //   const models = await this.colorModel.find().exec();

  //   for (const model of models) {
  //     console.log(`${model.identifier}|${model.name}|${model.color}`);
  //   }

  //   // for (const model of models) {

  //   //   const product = await this.productModel.findOne({identifier: model.identifier});
  //   //   if(product){
  //   //     for (const productColor of product.colors) {
  //   //       // productColor.id.toUpperCase().trim() === model.identifier.toUpperCase().trim()
  //   //       if(productColor.imagen === model.imageUrl){
  //   //         // model.color = productColor.title;
  //   //         // model.referenceId = product.id;
  //   //         // await model.save();
  //   //         let response = await this.colorModel.updateMany({imageUrl: productColor.imagen}, {
  //   //           color: productColor.title,
  //   //           referenceId: product.id,
  //   //         })

  //   //         console.log("PRODUCT COLOR => ", productColor);
  //   //         console.log("IDENTIFICADOR => ", model.identifier);
  //   //         // console.log("MODELO ACTUALIZADO => ", response);
  //   //       }
  //   //     }
  //   //   }
  //   // }

  //   // const products = await this.productModel.find().exec();
  //   // for (const product of products) {
  //   //   for (const color of product.colors) {

  //   //     color.selected = false;

  //   //     // let response = await this.colorModel.updateMany({imageUrl: color.imagen}, {
  //   //     //   color: color.title,
  //   //     //   referenceId: product.id,
  //   //     // });

  //   //     // console.log("RESPONSE => ", response);
  //   //   }

  //   //   product.colors[0].selected = true;
  //   //   await product.save();
  //   // }
  // }

  // async updateProductColors(): Promise<void> {
  //   const products = await this.productModel.find().exec();

  //   for (const product of products) {
  //     product.size = product.sizes[0];
  //     await product.save();
  //     // for (const color of product.colors) {
  //     //   const relatedProduct = await this.productModel.findOne({ identifier: color.id }).exec();
  //     //   if (relatedProduct) {
  //     //     relatedProduct.color = this.sanitizeAndUpperCase(color.title);
  //     //     relatedProduct.referenceId = product.id;
  //     //     await relatedProduct.save();
  //     //   }
  //     // }
  //   }
  // }

  sanitizeAndUpperCase(input: string): string {
    // Elimina los caracteres especiales y los espacios en blanco de los lados
    const sanitizedInput = input.replace(/[^a-zA-Z0-9 ]/g, '').trim();
    // Convierte el resultado a mayúsculas
    return sanitizedInput.toUpperCase();
  }

  private sendHttpExceptionError(error: any) {
    if (error && error.response && error.status) {
      throw new HttpException(error.response, error.status);
    } else {
      throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
    }
  }
}
