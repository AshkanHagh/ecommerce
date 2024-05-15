import { Model, Schema, model } from 'mongoose';
import type { IInventoryModel } from '../../types';

const InventorySchema = new Schema<IInventoryModel>({
    productId: {
        type: Schema.Types.ObjectId, ref: 'Product', required: [true, 'ProductId must provided'], unique: true
    },
    availableQuantity: {
        type: Number, default: 0
    }
}, { timestamps: true });

const Inventory : Model<IInventoryModel> = model('Inventory', InventorySchema);

export default Inventory;