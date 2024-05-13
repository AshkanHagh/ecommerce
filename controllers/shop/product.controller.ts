import type { NextFunction, Request, Response } from 'express';
import Product from '../../models/shop/product.model';
import type { IInventory, IPagination, IProduct } from '../../types';
import Inventory from '../../models/shop/inventory.model';

export const newProduct = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { name, price, description, category, color, size, availableQuantity } = req.body;
        const userId : string = req.user._id;

        const newProduct : IProduct | null = new Product({
            name, price, description, category, color, size,
            user : userId,
            images : req.images
        });

        const available : IInventory = new Inventory({
            productId : newProduct._id,
            availableQuantity
        });

        await Promise.all([newProduct.save(), available.save()]);

        res.status(201).json(newProduct);

    } catch (error) {
        
        next(error);
    }

}

export const searchProduct = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { query } = req.params;

        const product : IProduct[] | null = await Product.find({
            $or : [
                {name : {$regex : new RegExp(query, 'i') }},
                {category : {$regex : new RegExp(query, 'i') }}
            ]
        });

        if(!product) return res.status(404).json({error : 'Product not found'});

        res.status(200).json(product);

    } catch (error) {
        
        next(error);
    }

}

export const products = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { page, limit } = req.query;

        const NPage = Number(page);
        const NLimit = Number(limit);

        const startIndex = (NPage -1) * NLimit;
        const endIndex = NPage * NLimit;

        const results = <IPagination>{}

        if(endIndex < await Product.countDocuments().exec()) results.next = { page : NPage + 1, limit : NLimit }

        if(startIndex > 0) results.previous = { page : NPage - 1, limit : NLimit }

        results.result = await Product.find().select('-updatedAt -__v').limit(NLimit).skip(startIndex);

        if(!products) return res.status(404).json({error : 'Product not found'});

        res.status(200).json(results);

    } catch (error) {
        
        next(error);
    }

}

export const singleProduct = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { id: productId } = req.params;

        const products : IProduct | null = await Product.findById(productId).select('-updatedAt -__v');
        const inventory : IInventory | null = await Inventory.findOne({productId : products._id});

        if(inventory.availableQuantity === 0) return res.status(404).json({error : 'The product is not available in stock'}); 

        if(!products) return res.status(404).json({error : 'Product not found'});

        res.status(200).json(products);

    } catch (error) {
        
        next(error);
    }

}

export const editProduct = async (req : Request, res : Response, next : NextFunction) => {

    try {
        const { name, price, description, category, color, size, availableQuantity } = req.body;
        const { id: productId } = req.params;
        const ownerId = req.user._id;

        const product = await Product.findById(productId);

        if(product.user.toString() !== ownerId.toString()) return res.status(401).json({error : 'Access denied - cannot edit others products'});

        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.category = category || product.category;
        product.color = color || product.color;
        product.size = size || product.size;

        const available : IInventory = await Inventory.findOne({productId : product._id});

        available.availableQuantity = availableQuantity || available.availableQuantity;

        await Promise.all([product.save(), available.save()]);

        res.status(200).json(product);

    } catch (error) {
        
        next(error);
    }

}