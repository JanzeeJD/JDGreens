"use strict";

import express from 'express';

export function GetCartPage(req,res){
  res.render('user/cart')
}

export function GetShopPage(req,res){
  res.render('/user/shop')
}