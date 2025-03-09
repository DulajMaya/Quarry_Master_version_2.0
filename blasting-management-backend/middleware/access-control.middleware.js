// access-control.middleware.js

const { User, Role, ExplosiveStore, ExplosivePermit, WeeklyQuota ,SiteEngineer, StoreInventory,Purchase, DrillingSite, DrillingPattern} = require('../models');
const { ROLES } = require('./role.middleware');

// Verify Store Access
/*const verifyStoreAccess = async (req, res, next) => {
   try {
       const storeId = req.params.storeId || req.body.storeId;
       
       if (!storeId) {
           return res.status(400).json({
               status: 'error',
               message: 'Store ID is required'
           });
       }

       const user = await User.findOne({
           where: { id: req.userId },
           include: [{ model: Role }]
       });

       // Admin has access to all stores
       if (user.Role.name === ROLES.ADMIN) {
           next();
           return;
       }

       // For Site Engineer, verify store belongs to their site
       if (user.Role.name === ROLES.SITE_ENGINEER) {
           const store = await ExplosiveStore.findOne({
               where: { 
                   StoreID: storeId,
                   MiningSiteID: user.reference_id 
               }
           });

           

           if (!store) {
               return res.status(403).json({
                   status: 'error',
                   message: 'Access denied to this store'
               });
           }
       }

       next();
   } catch (error) {
       console.error('Store access verification error:', error);
       return res.status(500).json({
           status: 'error',
           message: 'Internal server error verifying store access'
       });
   }
};*/


const verifyStoreAccess = async (req, res, next) => {
    try {
        const storeId = req.params.storeId || req.body.storeId;
        
        if (!storeId) {
            return res.status(400).json({
                status: 'error',
                message: 'Store ID is required'
            });
        }
 
        const user = await User.findOne({
            where: { id: req.userId },
            include: [
                { model: Role },
                { 
                    model: SiteEngineer,
                    attributes: ['MiningSiteID']
                }
            ]
        });
 
        // Admin has access to all stores
        if (user.Role.name === ROLES.ADMIN) {
            next();
            return;
        }


        if (user.Role.name === ROLES.EXPLOSIVE_CONTROLLER) {
            next();
            return;
        }



 
        // For Site Engineer, verify store belongs to their site
        if (user.Role.name === ROLES.SITE_ENGINEER) {
            if (!user.SiteEngineer) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Site Engineer not properly mapped to a mining site'
                });
            }
 
            const store = await ExplosiveStore.findOne({
                where: { 
                    StoreID: storeId,
                    MiningSiteID: user.SiteEngineer.MiningSiteID  // Use the actual MiningSiteID instead of reference_id
                }
            });
 
            if (!store) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied to this store'
                });
            }
        }
 
        next();
    } catch (error) {
        console.error('Store access verification error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error verifying store access'
        });
    }
 };



 const verifyInventoryAccess = async (req, res, next) => {
    try {
        const inventoryId = req.params.inventoryId;
        
        if (!inventoryId) {
            return res.status(400).json({
                status: 'error',
                message: 'Inventory ID is required'
            });
        }

        // First get the inventory details to get the store ID
        const inventory = await StoreInventory.findOne({
            where: { InventoryID: inventoryId }
        });

        if (!inventory) {
            return res.status(404).json({
                status: 'error',
                message: 'Inventory not found'
            });
        }

        const user = await User.findOne({
            where: { id: req.userId },
            include: [
                { model: Role },
                { 
                    model: SiteEngineer,
                    attributes: ['MiningSiteID']
                }
            ]
        });

        // Admin has access to all inventories
        if (user.Role.name === ROLES.ADMIN) {
            next();
            return;
        }

        // Explosive Controller has access to all inventories
        if (user.Role.name === ROLES.EXPLOSIVE_CONTROLLER) {
            next();
            return;
        }

        // For Site Engineer, verify store belongs to their site
        if (user.Role.name === ROLES.SITE_ENGINEER) {
            if (!user.SiteEngineer) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Site Engineer not properly mapped to a mining site'
                });
            }

            const store = await ExplosiveStore.findOne({
                where: { 
                    StoreID: inventory.StoreID,
                    MiningSiteID: user.SiteEngineer.MiningSiteID
                }
            });

            if (!store) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied to this inventory'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Inventory access verification error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error verifying inventory access'
        });
    }
};





const verifyDealerAccess = async (req, res, next) => {
    try {
        const purchaseId = req.params.purchaseId || req.body.purchaseId;

        if (!purchaseId) {
            return res.status(400).json({
                status: 'error',
                message: 'Purchase ID is required',
            });
        }

        const user = await User.findOne({
            where: { id: req.userId },
            include: [{ model: Role }],
        });

        // Admin has access to all purchases
        if (user.Role.name === ROLES.ADMIN) {
            next();
            return;
        }

        // Explosive Dealer can only access their related purchases
        if (user.Role.name === ROLES.EXPLOSIVE_DEALER) {
            const purchase = await Purchase.findOne({
                where: { PurchaseID: purchaseId, DealerID: user.reference_id },
            });

            if (!purchase) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied to this purchase',
                });
            }
        }

        // Site Engineer may have a specific use case for access
        if (user.Role.name === ROLES.SITE_ENGINEER) {
            const purchase = await Purchase.findOne({
                where: { id: purchaseId, SiteID: user.reference_id },
            });

            if (!purchase) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied to this purchase',
                });
            }
        }

        next();
    } catch (error) {
        console.error('Dealer access verification error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error verifying dealer access',
        });
    }
};



const verifyMiningSiteAccess = async (req, res, next) => {
    try {
        const miningSiteId = req.params.miningSiteId || req.body.miningSiteId;

        const requestedSiteId = parseInt(miningSiteId, 10);

        console.log(miningSiteId)

        console.log(req.userId);

        if (!miningSiteId) {
            return res.status(400).json({
                status: 'error',
                message: 'Mining Site ID is required',
            });
        }

        const user = await User.findOne({
            where: { id: req.userId },
            include: [{ model: Role },
                { model: SiteEngineer }

            ],
        });
        console.log(user.reference_id);

        

        // Admin has access to all mining sites
        if (user.Role.name === ROLES.ADMIN) {
            next();
            return;
        }

        // Explosive Controller has access to all sites
        if (user.Role.name === ROLES.EXPLOSIVE_CONTROLLER) {
            next();
            return;
        }

        console.log(user.SiteEngineer.MiningSiteID);

        // Site Engineer can access their specific site
        if (user.Role.name === ROLES.SITE_ENGINEER) {
            const engineerSiteId = parseInt(user.SiteEngineer.MiningSiteID, 10);
            if (requestedSiteId !== engineerSiteId) {

                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied to this mining site',
                });
            }
        }
         /*
        // License Holder can access sites they are linked to
        if (user.Role.name === ROLES.LICENSE_HOLDER) {
            const miningSite = await MiningSite.findOne({
                where: { id: miningSiteId, LicenseHolderID: user.reference_id },
            });

            if (!miningSite) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied to this mining site',
                });
            }
        }

        // Third-Party Monitoring Team has restricted access to sites
        if (user.Role.name === ROLES.MONITORING_TEAM) {
            const monitoringAccess = await MonitoringContract.findOne({
                where: { 
                    MiningSiteID: miningSiteId,
                    MonitoringTeamID: user.reference_id,
                },
            });

            if (!monitoringAccess) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied to this mining site',
                });
            }
        }
            */

        next();
    } catch (error) {
        console.error('Mining site access verification error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error verifying mining site access',
        });
    }
};


// Verify Permit Access
const verifyPermitAccess = async (req, res, next) => {
   try {
       const permitId = req.params.permitId || req.body.permitId;

       if (!permitId) {
           return res.status(400).json({
               status: 'error',
               message: 'Permit ID is required'
           });
       }

       /*const user = await User.findOne({
           where: { id: req.userId },
           include: [{ model: Role }]
       });*/

       const user = await User.findOne({
        where: { id: req.userId },
        include: [{ model: Role },
            { model: SiteEngineer }

        ],
    });
    console.log(user.reference_id);

    const engineerSiteId = parseInt(user.SiteEngineer.MiningSiteID, 10);

       // Admin has access to all permits
       if (user.Role.name === ROLES.ADMIN) {
           next();
           return;
       }

       const permit = await ExplosivePermit.findByPk(permitId);

       if (!permit) {
           return res.status(404).json({
               status: 'error',
               message: 'Permit not found'
           });
       }

       switch (user.Role.name) {
           case ROLES.SITE_ENGINEER:
               // Site engineer can only access their site's permits
               if (permit.MiningSiteID !== engineerSiteId) {
                   return res.status(403).json({
                       status: 'error',
                       message: 'Access denied to this permit'
                   });
               }
               break;

           case ROLES.EXPLOSIVE_CONTROLLER:
               // Controller can only access permits they issued
               if (permit.ControllerID !== user.reference_id) {
                   return res.status(403).json({
                       status: 'error',
                       message: 'Access denied to this permit'
                   });
               }
               break;
       }

       next();
   } catch (error) {
       console.error('Permit access verification error:', error);
       return res.status(500).json({
           status: 'error',
           message: 'Internal server error verifying permit access'
       });
   }
};

// Verify Quota Access
const verifyQuotaAccess = async (req, res, next) => {
   try {
       const quotaId = req.params.quotaId || req.body.quotaId;

       if (!quotaId) {
           return res.status(400).json({
               status: 'error',
               message: 'Quota ID is required'
           });
       }

       const user = await User.findOne({
           where: { id: req.userId },
           include: [{ model: Role }]
       });

       // Admin has access to all quotas
       if (user.Role.name === ROLES.ADMIN) {
           next();
           return;
       }

       const quota = await WeeklyQuota.findOne({
           where: { QuotaID: quotaId },
           include: [{ model: ExplosivePermit }]
       });

       if (!quota) {
           return res.status(404).json({
               status: 'error',
               message: 'Quota not found'
           });
       }

       switch (user.Role.name) {
           case ROLES.SITE_ENGINEER:
               // Engineer can only access their site's quotas
               if (quota.ExplosivePermit.MiningSiteID !== user.reference_id) {
                   return res.status(403).json({
                       status: 'error',
                       message: 'Access denied to this quota'
                   });
               }
               break;

           case ROLES.EXPLOSIVE_CONTROLLER:
               // Controller can only access quotas for permits they issued
               if (quota.ExplosivePermit.ControllerID !== user.reference_id) {
                   return res.status(403).json({
                       status: 'error',
                       message: 'Access denied to this quota'
                   });
               }
               break;

           case ROLES.EXPLOSIVE_DEALER:
               // Dealer can only view approved quotas
               if (quota.Status !== 'Approved') {
                   return res.status(403).json({
                       status: 'error',
                       message: 'Access denied to this quota'
                   });
               }
               break;
       }

       next();
   } catch (error) {
       console.error('Quota access verification error:', error);
       return res.status(500).json({
           status: 'error',
           message: 'Internal server error verifying quota access'
       });
   }
};

// Verify Purchase Access
const verifyPurchaseAccess = async (req, res, next) => {
   try {
       const purchaseId = req.params.purchaseId || req.body.purchaseId;

       if (!purchaseId) {
           return res.status(400).json({
               status: 'error',
               message: 'Purchase ID is required'
           });
       }

       const user = await User.findOne({
           where: { id: req.userId },
           include: [{ model: Role }]
       });

       // Admin has access to all purchases
       if (user.Role.name === ROLES.ADMIN) {
           next();
           return;
       }

       const purchase = await Purchase.findByPk(purchaseId);

       if (!purchase) {
           return res.status(404).json({
               status: 'error',
               message: 'Purchase not found'
           });
       }

       switch (user.Role.name) {
           case ROLES.SITE_ENGINEER:
               // Engineer can only access their site's purchases
               if (purchase.StoreID !== user.reference_id) {
                   return res.status(403).json({
                       status: 'error',
                       message: 'Access denied to this purchase'
                   });
               }
               break;

           case ROLES.EXPLOSIVE_DEALER:
               // Dealer can only access their own sales
               if (purchase.DealerID !== user.reference_id) {
                   return res.status(403).json({
                       status: 'error',
                       message: 'Access denied to this purchase'
                   });
               }
               break;
       }

       next();
   } catch (error) {
       console.error('Purchase access verification error:', error);
       return res.status(500).json({
           status: 'error',
           message: 'Internal server error verifying purchase access'
       });
   }
};

const verifyDrillingSiteAccess = async (req, res, next) => {
    try {
        const drillingSiteId = req.params.drilling_site_id || req.body.drilling_site_id;

        if (!drillingSiteId) {
            return res.status(400).json({
                status: 'error',
                message: 'Drilling Site ID is required'
            });
        }

        const user = await User.findOne({
            where: { id: req.userId },
            include: [
                { model: Role },
                { model: SiteEngineer }
            ]
        });

        if (user.Role.name === ROLES.ADMIN || user.Role.name === ROLES.EXPLOSIVE_CONTROLLER) {
            return next();
        }

        const drillingSite = await DrillingSite.findOne({
            where: { drilling_site_id: drillingSiteId }
        });

        if (!drillingSite) {
            return res.status(404).json({
                status: 'error',
                message: 'Drilling site not found'
            });
        }

        if (user.Role.name === ROLES.SITE_ENGINEER) {
            if (drillingSite.miningSiteId !== user.SiteEngineer.MiningSiteID) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied to this drilling site'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Drilling site access verification error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error verifying drilling site access'
        });
    }
};

const verifyPatternAccess = async (req, res, next) => {
    try {
        const patternId = req.params.pattern_id || req.body.pattern_id;
        
        if (!patternId) {
            return res.status(400).json({
                status: 'error',
                message: 'Pattern ID is required'
            });
        }

        const user = await User.findOne({
            where: { id: req.userId },
            include: [{ model: Role }, { model: SiteEngineer }]
        });

        if (user.Role.name === ROLES.ADMIN || user.Role.name === ROLES.EXPLOSIVE_CONTROLLER) {
            return next();
        }

        const pattern = await DrillingPattern.findOne({
            where: { pattern_id: patternId },
            include: [{
                model: DrillingSite,
                as: 'drillingSite'
            }]
        });

        if (!pattern) {
            return res.status(404).json({
                status: 'error',
                message: 'Pattern not found'
            });
        }

        if (user.Role.name === ROLES.SITE_ENGINEER && 
            pattern.drillingSite.miningSiteId !== user.SiteEngineer.MiningSiteID) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied to this pattern'
            });
        }

        next();
    } catch (error) {
        console.error('Pattern access verification error:', error);
        return res.status(500).json({
            status: 'error', 
            message: 'Internal server error verifying pattern access'
        });
    }
};

module.exports = {
   verifyStoreAccess,
   verifyPermitAccess,
   verifyQuotaAccess,
   verifyPurchaseAccess,
   verifyMiningSiteAccess,
   verifyDealerAccess,
   verifyInventoryAccess,
   verifyDrillingSiteAccess,
   verifyPatternAccess
};