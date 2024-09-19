import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Card, CartItem, User, UserDocument } from './user.schema';
import { Model } from 'mongoose';

import { ForgetPswForm, LoginForm, RegisterForm } from './auth.interface';
import { IAddress } from './address.interface';
import { compareAsc, format } from "date-fns";
import { es } from "date-fns/locale";

@Injectable()
export class UsersService {

  private logger = new Logger(UsersService.name);
  
  constructor(
    @InjectModel('user')
    private readonly userModel: Model<UserDocument>
  ) {}

  async login(loginForm: LoginForm): Promise<any> {
    // .select('-password')
    const user = await this.userModel.findOne({ email: loginForm.email });
    if (!user) {
      this.logger.error(`Login fallido, correo incorrecto.`);
      throw new NotFoundException('USER_NOT_FOUND');
    }

    const pass = await this.userModel.findOne({ password: loginForm.password });
    if (!pass) {
      this.logger.error(`Login fallido, contraseña incorrecta.`);
      throw new NotFoundException('INCORRECT_PASSWORD');
    }

    this.logger.log(`Usuario ${user.email} logueado!`);
    return user;
  }

  async register(registerForm: RegisterForm): Promise<any> {
    // Primero, verifica si ya existe un usuario con el mismo correo electrónico
    const existingUser = await this.userModel.findOne({
      email: registerForm.email,
    });
    if (existingUser) {
      this.logger.error(`Registro fallido, el usuario ya existe.`);
      throw new BadRequestException('USER_EXITS');
    }

    const userObject = {
      name: this.capitalizeFirstLetter(registerForm.name),
      lastName: this.capitalizeFirstLetter(registerForm.lastName),
      fullName: this.capitalizeFirstLetter(
        `${registerForm.name} ${registerForm.lastName}`,
      ),
      email: registerForm.email,
      phone: parseInt(registerForm.phone.replace(/\D/g, '')),
      password: registerForm.password,
      address: '',
      country: { code: 'MX', name: 'México' },
      state: { code: 'EM', name: 'Estado de México' },
      city: '',
      zipCode: '',
      billingAddress: {
        name: '',
        phone: '',
        address: '',
        country: 'Mexico',
        state: '',
        city: '',
        zipCode: '',
      },
    };

    this.logger.log(`Usuario ${userObject.email} registrado!`);
    const newUser = new this.userModel(userObject);
    await newUser.save();
    return newUser;
  }

  // Forget password method
  async forgetPassword(forgetPswForm: ForgetPswForm): Promise<any> {
    const user = await this.userModel.findOne({ email: forgetPswForm.email });
    // .select('name lastName email -_id');
    if (!user) {
      this.logger.error(`Olvido contraseña fallido, no se ha encontrado el usuario.`);
      throw new NotFoundException('USER_NOT_FOUND');
    }
    this.logger.log(`Olvido contraseña solicitado`);
    return user;
  }

  async addItemToCart(userId: string, cartItem: CartItem): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      this.logger.error(`Agregar item fallido, no se encontro el usuario`);
      throw new NotFoundException('USER_NOT_FOUND');
    }

    // Busca si el producto ya está en el carrito
    // const existingCartItemIndex = user.cart.findIndex(item => item.product.identifier === cartItem.product.identifier);
    const existingCartItemIndex = user.cart.findIndex((item) => {
      if (
        item.product.identifier === cartItem.product.identifier &&
        item.product.size === cartItem.product.size &&
        item.product.color.id === cartItem.product.color.id
      ) {
        return item;
      } else {
        return null;
      }
    });

    if (existingCartItemIndex !== -1) {
      // Si el producto ya existe, actualiza la cantidad y el tamaño
      user.cart[existingCartItemIndex].quantity += cartItem.quantity;

      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: userId, 'cart.product.identifier': cartItem.product.identifier },
        {
          $set: {
            'cart.$.quantity': user.cart[existingCartItemIndex].quantity,
            'cart.$.product.size': cartItem.product.size,
          },
        },
        { new: true },
      );

      return updatedUser.cart;
    } else {
      // Si el producto no existe, agrégalo al carrito
      user.cart.push(cartItem);
    }

    this.logger.log(`${user.email} => Item agregado con exito`);

    await user.save();
    return user.cart;
  }

  // Show items in cart method
  async showItemsInCart(userId: string, dateNow: number): Promise<any> {
    const user = await this.userModel.findById(userId).populate('cart.product');
    if (!user) {
      this.logger.error(`Mostrar articulos, usuario no encontrado`);
      throw new NotFoundException('USER_NOT_FOUND');
    }

    return {
      items: user.cart,
      dateNow: dateNow,
    };
  }

  // Delete item from cart method
  async deleteItemFromCart(userId: string, productId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      this.logger.error(`Eliminar articulo, usuario no encontrado`);
      throw new NotFoundException('USER_NOT_FOUND');
    }
    user.cart = user.cart.filter(
      (item) => item.product.identifier !== productId,
    );

    this.logger.log(`${user.email} Articulo eliminado correctamente`);

    await user.save();
    return user.cart;
  }

  // Delete all items from cart method
  async deleteAllItemsFromCart(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      this.logger.error(`Eliminando articulos, usuario no encontrado`);
      throw new NotFoundException('USER_NOT_FOUND');
    }
    this.logger.log(`${user.email} => Articulos eliminados correctamente`);
    user.cart = [];
    await user.save();
    return user.cart;
  }

  // Modify item in cart method
  async modifyItemInCart(userId: string, currentItem: CartItem): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      {
        _id: userId,
        'cart.product.identifier': currentItem.product.identifier,
      },
      {
        $set: {
          'cart.$.quantity': currentItem.quantity,
          'cart.$.product.size': currentItem.product.size,
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('ERROR_UPDATING_ITEM');
    }

    return updatedUser.cart;
  }

  // Update user info method
  async updateUserInfo(userId: string, updateData: any): Promise<any> {
    const user = await this.userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!user) {
      this.logger.error(`Actualiando usuario, no encontrado`);
      throw new NotFoundException('USER_NOT_FOUND');
    }

    this.logger.log(`${user.email} => Actualizado correctamente`);
    return user;
  }

  //update userAdress
  async updateUserAddress(
    userId: string,
    updateAddress: IAddress,
  ): Promise<any> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        fullName: updateAddress.fullName,
        phone: parseInt(updateAddress.phoneNumber.replace(/\D/g, '')),
        country: updateAddress.country,
        state: updateAddress.state,
        city: updateAddress.city,
        zipCode: updateAddress.zipCode,
        address: updateAddress.address,
      },
      {
        new: true,
      },
    );
    if (!user) {
      this.logger.error(`Actualizando direccion, usuario no encontrado`);
      throw new NotFoundException('USER_NOT_FOUND');
    }

    this.logger.log(`${user.email} => Direccion actualizada!`);
    return user;
  }

  // Get user info method
  async getUserInfo(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }
    return user;
  }

  capitalizeFirstLetter(str: string): string {
    if (!str) return str;
    str = str.toLowerCase();
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
