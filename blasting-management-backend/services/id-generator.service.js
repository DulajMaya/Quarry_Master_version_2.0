/*const { SiteEngineer, ExplosiveController, ExplosiveDealer } = require('../models');
const { StoreInventory, InventoryMovement } = require('../models');
const { Op } = require('sequelize');

exports.generateEngineerId = async () => {
    const lastEngineer = await SiteEngineer.findOne({
        order: [['EngineerID', 'DESC']]
    });

    const nextNumber = lastEngineer 
        ? parseInt(lastEngineer.EngineerID.slice(3)) + 1 
        : 1;
    
    return `ENG${nextNumber.toString().padStart(3, '0')}`;
};

exports.generateControllerId = async () => {
    const lastController = await ExplosiveController.findOne({
        order: [['ControllerID', 'DESC']]
    });

    const nextNumber = lastController 
        ? parseInt(lastController.ControllerID.slice(4)) + 1 
        : 1;
    
    return `CTRL${nextNumber.toString().padStart(3, '0')}`;
};

exports.generateDealerId = async () => {
    const lastDealer = await ExplosiveDealer.findOne({
        order: [['DealerID', 'DESC']]
    });

    const nextNumber = lastDealer 
        ? parseInt(lastDealer.DealerID.slice(4)) + 1 
        : 1;
    
    return `DEAL${nextNumber.toString().padStart(3, '0')}`;
};

exports.generateExplosiveTypeId = async () => {
    const lastType = await ExplosiveType.findOne({
        order: [['ExplosiveTypeID', 'DESC']]
    });

    const nextNumber = lastType 
        ? parseInt(lastType.ExplosiveTypeID.slice(3)) + 1 
        : 1;
    
    return `EXP${nextNumber.toString().padStart(3, '0')}`;
};

/**
 * Generate Inventory ID with format: INV00001, INV00002, etc.
 
exports.generateInventoryId = async () => {
    try {
        const lastInventory = await StoreInventory.findOne({
            where: {
                InventoryID: {
                    [Op.like]: 'INV%'
                }
            },
            order: [['InventoryID', 'DESC']]
        });

        if (!lastInventory) {
            return 'INV00001';
        }

        // Extract number from last ID (e.g., "INV00001" -> 1)
        const lastNumber = parseInt(lastInventory.InventoryID.slice(3));
        // Generate next number and pad with zeros
        const nextNumber = (lastNumber + 1).toString().padStart(5, '0');
        return `INV${nextNumber}`;
    } catch (error) {
        console.error('Error generating inventory ID:', error);
        throw error;
    }
};

/**
 * Generate Movement ID with format: MOV00001, MOV00002, etc.
 
exports.generateMovementId = async () => {
    try {
        const lastMovement = await InventoryMovement.findOne({
            where: {
                MovementID: {
                    [Op.like]: 'MOV%'
                }
            },
            order: [['MovementID', 'DESC']]
        });

        if (!lastMovement) {
            return 'MOV00001';
        }

        // Extract number from last ID
        const lastNumber = parseInt(lastMovement.MovementID.slice(3));
        // Generate next number and pad with zeros
        const nextNumber = (lastNumber + 1).toString().padStart(5, '0');
        return `MOV${nextNumber}`;
    } catch (error) {
        console.error('Error generating movement ID:', error);
        throw error;
    }
};

/**
 * Alternative batch ID generator for inventory movements
 * Format: YYYYMMDD-XXX (e.g., 20240120-001)
 
exports.generateBatchMovementId = async () => {
    try {
        const today = new Date();
        const datePrefix = today.toISOString().slice(0,10).replace(/-/g, '');
        
        const lastMovement = await InventoryMovement.findOne({
            where: {
                MovementID: {
                    [Op.like]: `${datePrefix}-%`
                }
            },
            order: [['MovementID', 'DESC']]
        });

        if (!lastMovement) {
            return `${datePrefix}-001`;
        }

        // Extract number from last ID
        const lastNumber = parseInt(lastMovement.MovementID.split('-')[1]);
        // Generate next number and pad with zeros
        const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
        return `${datePrefix}-${nextNumber}`;
    } catch (error) {
        console.error('Error generating batch movement ID:', error);
        throw error;
    }
};

/**
 * Utility function to validate ID formats
 
exports.validateIdFormat = {
    inventoryId: (id) => /^INV\d{5}$/.test(id),
    movementId: (id) => /^MOV\d{5}$/.test(id),
    batchMovementId: (id) => /^\d{8}-\d{3}$/.test(id)
}; */

// id-generator.service.js

const { 
    User, 
    SiteEngineer, 
    ExplosiveController, 
    ExplosiveDealer,
    ExplosiveType,
    ExplosiveStore,
    StoreInventory,
    StoreThreshold,
    ExplosivePermit,
    PermitAllowedExplosive,
    WeeklyQuota,
    QuotaItems,
    Purchase,
    PurchaseItems,
    PermitHistory,
    QuotaHistory,
    PurchaseHistory,
    InventoryMovement,
    PurchaseDocument,
    PermitUsage
} = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');

class IdGeneratorService {
    /**
     * Generate Site Engineer ID (Format: ENG00001)
     */
    async generateEngineerId() {
        try {
            const lastEngineer = await SiteEngineer.findOne({
                order: [['EngineerID', 'DESC']]
            });

            const nextNumber = lastEngineer 
                ? parseInt(lastEngineer.EngineerID.slice(3)) + 1 
                : 1;
            
            return `ENG${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Engineer ID:', error);
            throw error;
        }
    }

    /**
     * Generate Explosive Controller ID (Format: CTRL00001)
     */
    async generateControllerId() {
        try {
            const lastController = await ExplosiveController.findOne({
                order: [['ControllerID', 'DESC']]
            });

            const nextNumber = lastController 
                ? parseInt(lastController.ControllerID.slice(4)) + 1 
                : 1;
            
            return `CTRL${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Controller ID:', error);
            throw error;
        }
    }

    /**
     * Generate Explosive Dealer ID (Format: DEAL00001)
     */
    async generateDealerId() {
        try {
            const lastDealer = await ExplosiveDealer.findOne({
                order: [['DealerID', 'DESC']]
            });

            const nextNumber = lastDealer 
                ? parseInt(lastDealer.DealerID.slice(4)) + 1 
                : 1;
            
            return `DEAL${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Dealer ID:', error);
            throw error;
        }
    }

    /**
     * Generate Explosive Type ID (Format: EXP00001)
     */
    async generateExplosiveTypeId() {
        try {
            const lastType = await ExplosiveType.findOne({
                order: [['ExplosiveTypeID', 'DESC']]
            });

            const nextNumber = lastType 
                ? parseInt(lastType.ExplosiveTypeID.slice(3)) + 1 
                : 1;
            
            return `EXP${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Explosive Type ID:', error);
            throw error;
        }
    }

    /**
     * Generate Store ID (Format: STR00001)
     */
    async generateStoreId() {
        try {
            const lastStore = await ExplosiveStore.findOne({
                order: [['StoreID', 'DESC']]
            });

            const nextNumber = lastStore 
                ? parseInt(lastStore.StoreID.slice(3)) + 1 
                : 1;
            
            return `STR${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Store ID:', error);
            throw error;
        }
    }

    /**
     * Generate Inventory ID (Format: INV00001)
     */
    async generateInventoryId() {
        try {
            const lastInventory = await StoreInventory.findOne({
                order: [['InventoryID', 'DESC']]
            });

            const nextNumber = lastInventory 
                ? parseInt(lastInventory.InventoryID.slice(3)) + 1 
                : 1;
            
            return `INV${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Inventory ID:', error);
            throw error;
        }
    }


  /*  async generateMovementId() {
        try {
            const lastMovement = await InventoryMovement.findOne({
                order: [['MovementID', 'DESC']]
            });
     
            const nextNumber = lastMovement 
                ? parseInt(lastMovement.MovementID.slice(3)) + 1 
                : 1;
            
            return `MOV${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Movement ID:', error);
            throw error;
        }
     }*/


        async  generateMovementId(transaction) {
            try {
                // Get last movement with row lock to prevent concurrent access
                const lastMovement = await InventoryMovement.findOne({
                    order: [['MovementID', 'DESC']],
                    lock: true,  // Add FOR UPDATE lock
                    transaction // Use the same transaction
                });
             
                const nextNumber = lastMovement 
                    ? parseInt(lastMovement.MovementID.slice(3)) + 1 
                    : 1;
                
                const newId = `MOV${nextNumber.toString().padStart(5, '0')}`;
        
                // Verify ID doesn't exist (double-check)
                const exists = await InventoryMovement.findOne({
                    where: { MovementID: newId },
                    transaction
                });
        
                if (exists) {
                    throw new Error('Movement ID already exists');
                }
                    
                return newId;
            } catch (error) {
                throw error;
            }
        }



     async  generateBulkMovementIds(count) {
        try {
            // Get the last movement in a separate transaction to ensure consistency
            const lastMovement = await InventoryMovement.findOne({
                order: [['MovementID', 'DESC']],
                attributes: ['MovementID'],
                lock: true // Add a lock to prevent race conditions
            });
    
            const baseNumber = lastMovement 
                ? parseInt(lastMovement.MovementID.slice(3)) + 1 
                : 1;
    
            // Generate array of sequential IDs
            const movementIds = Array.from({ length: count }, (_, index) => {
                const nextNum = baseNumber + index;
                return `MOV${nextNum.toString().padStart(5, '0')}`;
            });
    
            return movementIds;
        } catch (error) {
            console.error('Error generating bulk Movement IDs:', error);
            throw error;
        }
    }




    /**
     * Generate Threshold ID (Format: THR00001)
     */
    async generateThresholdId() {
        try {
            const lastThreshold = await StoreThreshold.findOne({
                order: [['ThresholdID', 'DESC']]
            });

            const nextNumber = lastThreshold 
                ? parseInt(lastThreshold.ThresholdID.slice(3)) + 1 
                : 1;
            
            return `THR${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Threshold ID:', error);
            throw error;
        }
    }

    /**
     * Generate Permit ID (Format: PER00001)
     */
    async generatePermitId() {
        try {
            const lastPermit = await ExplosivePermit.findOne({
                order: [['PermitID', 'DESC']]
            });

            const nextNumber = lastPermit 
                ? parseInt(lastPermit.PermitID.slice(3)) + 1 
                : 1;
            
            return `PER${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Permit ID:', error);
            throw error;
        }
    }

    async  generateDocumentId() {
        try {
            const lastDoc = await PurchaseDocument.findOne({
                order: [['DocumentID', 'DESC']]
            });
         
            const nextNumber = lastDoc 
                ? parseInt(lastDoc.DocumentID.slice(3)) + 1 
                : 1;
         
            return `PDC${nextNumber.toString().padStart(5, '0')}`;
         
        } catch (error) {
            console.error('Error generating Document ID:', error);
            throw error;
        }
    }

    async  generateUsageId() {
        try {
            // Find the last permit usage record, ordered by UsageID in descending order
            const lastUsage = await PermitUsage.findOne({
                order: [['UsageID', 'DESC']]
            });
    
            // Extract the numeric part and increment, or start from 1 if no records exist
            const nextNumber = lastUsage 
                ? parseInt(lastUsage.UsageID.slice(3)) + 1 
                : 1;
    
            // Validate the next number to prevent overflow
            if (nextNumber > 99999) {
                throw new Error('UsageID sequence has reached its maximum value');
            }
    
            // Generate the new ID with PUS prefix and padded numbers
            return `PUS${nextNumber.toString().padStart(5, '0')}`;
    
        } catch (error) {
            console.error('Error generating Usage ID:', error);
            throw error;
        }
    }
       


    async  generateHistoryId() {
        try {
            const lastHistory = await PermitHistory.findOne({
                order: [['HistoryID', 'DESC']]
            });
    
            const nextNumber = lastHistory 
                ? parseInt(lastHistory.HistoryID.slice(3)) + 1 
                : 1;
            
            return `PHT${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating History ID:', error);
            throw error;
        }
    }

    async generateQuotaHistoryId() {
        try {
            const lastHistory = await QuotaHistory.findOne({
                order: [['HistoryID', 'DESC']]
            });
    
            const nextNumber = lastHistory 
                ? parseInt(lastHistory.HistoryID.slice(3)) + 1 
                : 1;
            
            return `QHT${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Quota History ID:', error);
            throw error;
        }
    }


    async  generateItemId(transaction) {
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                const lastItem = await QuotaItems.findOne({
                    order: [['QuotaItemID', 'DESC']],
                    lock: true,  // Add row-level locking
                    transaction: transaction  // Use the existing transaction
                });
    
                const nextNumber = lastItem 
                    ? parseInt(lastItem.QuotaItemID.slice(3)) + 1 
                    : 1;
                
                const newItemId = `QIT${nextNumber.toString().padStart(5, '0')}`;
    
                // Verify the ID doesn't exist (double-check)
                const existingItem = await QuotaItems.findOne({
                    where: { QuotaItemID: newItemId },
                    transaction: transaction
                });
    
                if (!existingItem) {
                    return newItemId;
                }
    
                attempts++;
            } catch (error) {
                attempts++;
                if (attempts === maxAttempts) {
                    throw new Error('Failed to generate unique Item ID after multiple attempts');
                }
            }
        }
    
        throw new Error('Failed to generate unique Item ID');
    }

    async generatePurchaseItemIds(count) {
        try {
            const lastItem = await PurchaseItems.findOne({
                order: [['PurchaseItemID', 'DESC']]
            });
    
            const startNumber = lastItem 
                ? parseInt(lastItem.PurchaseItemID.slice(3)) + 1 
                : 1;
            
            // Generate array of sequential IDs
            const ids = Array.from({length: count}, (_, index) => {
                const nextNum = startNumber + index;
                return `PIT${nextNum.toString().padStart(5, '0')}`;
            });
            
            return ids;
        } catch (error) {
            console.error('Error generating Purchase Item IDs:', error);
            throw error;
        }
    }

    async generatePurchaseHistoryId() {
        try {
            const lastHistory = await PurchaseHistory.findOne({
                order: [['HistoryID', 'DESC']]
            });
    
            const nextNumber = lastHistory 
                ? parseInt(lastHistory.HistoryID.slice(3)) + 1 
                : 1;
            
            return `PHO${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Purchase History ID:', error);
            throw error;
        }
    }


    
    async  generateBulkPurchaseHistoryIds(count) {
        try {
            // Use a single transaction to get and reserve multiple IDs
            const result = await sequelize.transaction(async (t) => {
                const lastHistory = await PurchaseHistory.findOne({
                    order: [['HistoryID', 'DESC']],
                    lock: true,
                    transaction: t
                });
    
                const startNumber = lastHistory 
                    ? parseInt(lastHistory.HistoryID.slice(3)) + 1 
                    : 1;
    
                // Generate array of sequential IDs
                const historyIds = [];
                for (let i = 0; i < count; i++) {
                    const newHistoryId = `PHO${(startNumber + i).toString().padStart(5, '0')}`;
                    historyIds.push(newHistoryId);
                }
    
                // Verify none of these IDs exist
                const existingIds = await PurchaseHistory.findAll({
                    where: { 
                        HistoryID: historyIds 
                    },
                    transaction: t
                });
    
                if (existingIds.length > 0) {
                    throw new Error('Some IDs already exist');
                }
    
                return historyIds;
            });
    
            return result;
    
        } catch (error) {
            console.error('Error generating bulk history IDs:', error);
            throw error;
        }
    }








   async generateAllowedId ()  {
        try {
            // Find the last record by sorting PermitAllowedID in descending order
            const lastAllowed = await PermitAllowedExplosive.findOne({
                order: [['AllowedID', 'DESC']]
            });
    
            // If there's a last record, extract the number and increment
            // If no records exist, start with 1
            const nextNumber = lastAllowed 
                ? parseInt(lastAllowed.AllowedID.slice(3)) + 1 
                : 1;
            
            // Generate new ID with 'PAE' prefix and padded number
            // PAE stands for Permit Allowed Explosive
            return `PAE${nextNumber.toString().padStart(5, '0')}`;
            
        } catch (error) {
            console.error('Error generating Permit Allowed ID:', error);
            throw error;
        }
    };





    /**
     * Generate Permit Allowed Explosive ID (Format: PAE00001)
     */
    async generatePermitAllowedId() {
        try {
            const lastAllowed = await PermitAllowedExplosive.findOne({
                order: [['AllowedID', 'DESC']]
            });

            const nextNumber = lastAllowed 
                ? parseInt(lastAllowed.AllowedID.slice(3)) + 1 
                : 1;
            
            return `PAE${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Permit Allowed ID:', error);
            throw error;
        }
    }

    /**
     * Generate Weekly Quota ID (Format: QTA00001)
     */
    async generateQuotaId() {
        try {
            const lastQuota = await WeeklyQuota.findOne({
                order: [['QuotaID', 'DESC']]
            });

            const nextNumber = lastQuota 
                ? parseInt(lastQuota.QuotaID.slice(3)) + 1 
                : 1;
            
            return `QTA${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Quota ID:', error);
            throw error;
        }
    }

    /**
     * Generate Quota Item ID (Format: QTI00001)
     */
    async generateQuotaItemId() {
        try {
            const lastItem = await QuotaItems.findOne({
                order: [['QuotaItemID', 'DESC']]
            });

            const nextNumber = lastItem 
                ? parseInt(lastItem.QuotaItemID.slice(3)) + 1 
                : 1;
            
            return `QTI${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Quota Item ID:', error);
            throw error;
        }
    }

    /**
     * Generate Purchase ID (Format: PUR00001)
     */
    async generatePurchaseId() {
        try {
            const lastPurchase = await Purchase.findOne({
                order: [['PurchaseID', 'DESC']]
            });

            const nextNumber = lastPurchase 
                ? parseInt(lastPurchase.PurchaseID.slice(3)) + 1 
                : 1;
            
            return `PUR${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Purchase ID:', error);
            throw error;
        }
    }

    /**
     * Generate Purchase Item ID (Format: PUI00001)
     */
    async generatePurchaseItemId() {
        try {
            const lastItem = await PurchaseItems.findOne({
                order: [['PurchaseItemID', 'DESC']]
            });

            const nextNumber = lastItem 
                ? parseInt(lastItem.PurchaseItemID.slice(3)) + 1 
                : 1;
            
            return `PUI${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating Purchase Item ID:', error);
            throw error;
        }
    }

    /**
     * Validate ID Format
     */
    validateIdFormat(id, type) {
        const formats = {
            engineer: /^ENG\d{5}$/,
            controller: /^CTRL\d{5}$/,
            dealer: /^DEAL\d{5}$/,
            explosive: /^EXP\d{5}$/,
            store: /^STR\d{5}$/,
            inventory: /^INV\d{5}$/,
            threshold: /^THR\d{5}$/,
            permit: /^PER\d{5}$/,
            allowedExplosive: /^PAE\d{5}$/,
            quota: /^QTA\d{5}$/,
            quotaItem: /^QTI\d{5}$/,
            purchase: /^PUR\d{5}$/,
            purchaseItem: /^PUI\d{5}$/
        };

        return formats[type]?.test(id) || false;
    }

    /**
     * Generate Date-based ID (Format: TYPE-YYYYMMDD-001)
     */
    async generateDateBasedId(prefix, model, idField) {
        try {
            const today = new Date();
            const dateStr = today.toISOString().slice(0,10).replace(/-/g, '');
            
            const lastRecord = await model.findOne({
                where: {
                    [idField]: {
                        [Op.like]: `${prefix}-${dateStr}-%`
                    }
                },
                order: [[idField, 'DESC']]
            });

            const nextNumber = lastRecord
                ? parseInt(lastRecord[idField].split('-')[2]) + 1
                : 1;

            return `${prefix}-${dateStr}-${nextNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error('Error generating date-based ID:', error);
            throw error;
        }
    }
}

module.exports = new IdGeneratorService();