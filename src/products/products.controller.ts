import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ClearString } from 'src/shared/class/clear-string';
import { Product } from './producto.schema';
import { ColorModel } from './color-model.schema';

@Controller('product')
export class ProductsController {
  private clearString: ClearString;

  constructor(private readonly productsService: ProductsService) {
    this.clearString = new ClearString();
  }

  @Get()
  async search(
    @Query('category') category: string,
    @Query('name') name: string,
    @Query('minPrice') minPrice: number,
    @Query('maxPrice') maxPrice: number,
    @Query('color') color: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    const result = await this.productsService.searchProducts(
      category,
      name,
      [minPrice, maxPrice],
      color,
      page,
      pageSize
    );
    return {
      data: result.products,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize
    };
  }

  // Ruta para obtener un producto por 'identifier'
  @Get('/:identifier')
  async getProductByIdentifier(@Param('identifier') identifier: string): Promise<Product> {
    return this.productsService.findProductByIdentifier(identifier);
  }

  // Ruta para obtener un color de modelo por 'identifier'
  @Get('/model/:identifier')
  async findModelByIdentifier(@Param('identifier') identifier: string): Promise<ColorModel> {
    return this.productsService.findModelByIdentifier(identifier);
  }

  // Ruta para obtener 10 productos por 'category'
  @Get('/category/:category')
  async getProductsByCategory(@Param('category') category: string): Promise<Product[]> {
    return this.productsService.findProductsByCategory(category);
  }

  @Get('/colors')
  async getUniqueColors() {
    return this.productsService.findAllUniqueColors();
  }

  @Patch('/update-colors')
  async updateColors() {
    await this.productsService.updateProductColors();
    return { message: 'Product colors updated successfully' };
  }
  
  @Get('filter/pagination')
  async productsPagination(
    @Query('current') current: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const filter = {
      filterMessage: `PRODUCTOS ENCONTRADOS`,
      query: {
        $and: [
          {
            $or: [
              {
                name: {
                  $regex: this.clearString.diacriticSensitiveRegex(current || ''),
                  $options: 'i',
                },
              },
              {
                category: {
                  $regex: this.clearString.diacriticSensitiveRegex(current || ''),
                  $options: 'i',
                },
              },
              {
                description: {
                  $regex: this.clearString.diacriticSensitiveRegex(current || ''),
                  $options: 'i',
                },
              },
              {
                'colors.title': {
                  $regex: this.clearString.diacriticSensitiveRegex(current || ''),
                  $options: 'i',
                },
              }
            ],
          },
        ],
      }
    };

    const offset = page ? page * limit : 0;

    return this.productsService.getPagination(
      filter.query,
      page,
      offset,
      limit,
      filter.filterMessage,
    );
  }

  @Post('load-products-from-file')
  async loadProducts() {
    await this.productsService.loadProductsFromFile();
    return { message: 'Products loaded successfully' };
  }

  @Post('load-models-from-file')
  async loadModels() {
    await this.productsService.loadProductModelFromFile();
    return { message: 'Models loaded successfully' };
  }
}