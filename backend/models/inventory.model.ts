import { Schema, model } from 'mongoose';
import type { IInventory } from '../types';

const InventorySchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        unique: true
    },
    availableQuantity: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Inventory = model<IInventory>('Inventory', InventorySchema);

export default Inventory;