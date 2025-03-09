// issuance.service.js

const { ExplosiveIssuance, IssuanceItems, StoreInventory, ExplosiveType } = require('../models');
const storeInventoryService = require('./store-inventory.service');
const { generateIssuanceId, generateIssuanceItemId } = require('./id-generator.service');
const sequelize = require('../config/db.config');

exports.createIssuance = async (data, userId) => {
   const transaction = await sequelize.transaction();
   try {
       // Generate ID
       const issuanceId = await generateIssuanceId();

       // Create issuance record
       const issuance = await ExplosiveIssuance.create({
           IssuanceID: issuanceId,
           StoreID: data.storeId,
           Purpose: data.purpose,
           IssuanceDate: new Date(),
           Status: 'Issued',
           IssuedBy: userId
       }, { transaction });

       // Process each item
       for (const item of data.items) {
           const itemId = await generateIssuanceItemId();

           // Create issuance item
           await IssuanceItems.create({
               IssuanceItemID: itemId,
               IssuanceID: issuanceId,
               ExplosiveTypeID: item.explosiveTypeId,
               IssuedQuantity: item.quantity,
               UsedQuantity: 0,
               ReturnedQuantity: 0
           }, { transaction });

           // Update inventory (OUT)
           await storeInventoryService.updateInventory(
               item.inventoryId,
               item.quantity,
               'OUT',
               {
                   type: 'Issuance',
                   id: issuanceId,
                   remarks: `Issued for ${data.purpose}`
               },
               userId,
               transaction
           );
       }

       await transaction.commit();
       return await this.getIssuanceDetails(issuanceId);

   } catch (error) {
       await transaction.rollback();
       throw error;
   }
};

exports.recordReturn = async (issuanceId, returnData, userId) => {
   const transaction = await sequelize.transaction();
   try {
       const issuance = await ExplosiveIssuance.findByPk(issuanceId, {
           include: [{ model: IssuanceItems }]
       });

       if (!issuance) {
           throw { status: 404, message: 'Issuance not found' };
       }

       if (issuance.Status === 'Completed') {
           throw { status: 400, message: 'Issuance already completed' };
       }

       // Process each returned item
       for (const item of returnData.items) {
           const issuanceItem = issuance.IssuanceItems.find(
               i => i.ExplosiveTypeID === item.explosiveTypeId
           );

           if (!issuanceItem) {
               throw { status: 400, message: 'Invalid explosive type in return' };
           }

           const totalAccountedFor = Number(issuanceItem.UsedQuantity) + 
                                  Number(issuanceItem.ReturnedQuantity) + 
                                  Number(item.returnedQuantity);

           if (totalAccountedFor > issuanceItem.IssuedQuantity) {
               throw { 
                   status: 400, 
                   message: 'Return quantity exceeds issued quantity' 
               };
           }

           // Update issuance item
           await issuanceItem.update({
               ReturnedQuantity: Number(issuanceItem.ReturnedQuantity) + Number(item.returnedQuantity),
               UsedQuantity: Number(item.usedQuantity)
           }, { transaction });

           // Update inventory (IN)
           await storeInventoryService.updateInventory(
               item.inventoryId,
               item.returnedQuantity,
               'IN',
               {
                   type: 'Return',
                   id: issuanceId,
                   remarks: returnData.remarks
               },
               userId,
               transaction
           );
       }

       // Update issuance status
       const allItems = await IssuanceItems.findAll({
           where: { IssuanceID: issuanceId }
       });

       const isComplete = allItems.every(item => 
           (Number(item.UsedQuantity) + Number(item.ReturnedQuantity)) === Number(item.IssuedQuantity)
       );

       await issuance.update({
           Status: isComplete ? 'Completed' : 'PartiallyReturned',
           ReturnDate: new Date()
       }, { transaction });

       await transaction.commit();
       return await this.getIssuanceDetails(issuanceId);

   } catch (error) {
       await transaction.rollback();
       throw error;
   }
};

exports.getIssuanceDetails = async (issuanceId) => {
   return await ExplosiveIssuance.findOne({
       where: { IssuanceID: issuanceId },
       include: [{
           model: IssuanceItems,
           include: [{ model: ExplosiveType }]
       }]
   });
};

exports.getStoreIssuances = async (storeId, filters = {}) => {
   const whereClause = { StoreID: storeId };
   
   if (filters.status) {
       whereClause.Status = filters.status;
   }

   if (filters.startDate && filters.endDate) {
       whereClause.IssuanceDate = {
           [Op.between]: [filters.startDate, filters.endDate]
       };
   }

   return await ExplosiveIssuance.findAll({
       where: whereClause,
       include: [{
           model: IssuanceItems,
           include: [{ model: ExplosiveType }]
       }],
       order: [['IssuanceDate', 'DESC']]
   });
};

exports.validateIssuance = async (storeId, items) => {
   for (const item of items) {
       const inventory = await StoreInventory.findOne({
           where: {
               StoreID: storeId,
               ExplosiveTypeID: item.explosiveTypeId
           }
       });

       if (!inventory) {
           throw { 
               status: 400, 
               message: `Explosive type not found in store inventory` 
           };
       }

       if (item.quantity > inventory.CurrentQuantity) {
           throw { 
               status: 400, 
               message: `Insufficient quantity for ${inventory.ExplosiveType.TypeName}`,
               available: inventory.CurrentQuantity
           };
       }
   }

   return true;
};