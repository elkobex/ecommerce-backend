import { Body, Controller, Post, Get, Param, Delete, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginForm, RegisterForm, ForgetPswForm } from './auth.interface';
import { Card, CartItem } from './user.schema';
import { IAddress } from './address.interface';

@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('login')
  async login(@Body() loginForm: LoginForm) {
    return this.userService.login(loginForm);
  }

  @Post('register')
  async register(@Body() registerForm: RegisterForm) {
    return this.userService.register(registerForm);
  }

  @Post('forget-password')
  async forgetPassword(@Body() forgetPswForm: ForgetPswForm) {
    return this.userService.forgetPassword(forgetPswForm);
  }

  @Post('add-item-to-cart/:userId')
  async addItemToCart(@Param('userId') userId: string, @Body() cartItem: CartItem) {
    return this.userService.addItemToCart(userId, cartItem);
  }

  @Get('show-items-in-cart/:userId')
  async showItemsInCart(@Param('userId') userId: string, @Query('datenow') dateNow: number) {
    return this.userService.showItemsInCart(userId, dateNow);
  }

  @Delete('delete-item-from-cart/:userId/:productId')
  async deleteItemFromCart(@Param('userId') userId: string, @Param('productId') productId: string) {
    return this.userService.deleteItemFromCart(userId, productId);
  }

  @Delete('delete-all-items-from-cart/:userId')
  async deleteAllItemsFromCart(@Param('userId') userId: string) {
    return this.userService.deleteAllItemsFromCart(userId);
  }

  // /:productId
  @Put('modify-item-in-cart/:userId')
  async modifyItemInCart(@Param('userId') userId: string, @Body() item: CartItem) {
    return this.userService.modifyItemInCart(userId, item);
  }

  @Put('update-user-info/:userId')
  async updateUserInfo(@Param('userId') userId: string, @Body() updateData: any) {
    return this.userService.updateUserInfo(userId, updateData);
  }

  @Put('update-user-address/:userId')
  async updateUserAddress(@Param('userId') userId: string, @Body() updateAddress: IAddress) {
    return this.userService.updateUserAddress(userId, updateAddress);
  }

  @Get('get-user-info/:userId')
  async getUserInfo(@Param('userId') userId: string) {
    return this.userService.getUserInfo(userId);
  }
}