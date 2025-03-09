// notifications/services/recipient.service.js
/*
const { ExplosiveStore, MiningSite, SiteEngineer, ExplosiveController, 
    ExplosiveDealer, User, ExplosivePermit, Purchase } = require('../../models');

class RecipientService {
// Get Store Recipients (Site Engineer)
async getStoreRecipients(storeId) {
    try {
        const store = await ExplosiveStore.findByPk(storeId, {
            include: [{
                model: MiningSite,
                include: [{
                    model: SiteEngineer,
                    include: [{ model: User }]
                }]
            }]
        });

        if (!store || !store.MiningSite?.SiteEngineer?.User) {
            throw new Error('Site Engineer not found for store');
        }

        return [{
            id: store.MiningSite.SiteEngineer.User.id,
            email: store.MiningSite.SiteEngineer.User.email,
            name: store.MiningSite.SiteEngineer.User.name
        }];
    } catch (error) {
        console.error('Error getting store recipients:', error);
        throw error;
    }
}

// Get Permit Recipients (Site Engineer and Controller)
async getPermitRecipients(permitId) {
    try {
        const permit = await ExplosivePermit.findByPk(permitId, {
            include: [
                {
                    model: MiningSite,
                    as : 'miningSites',
                    include: [{
                        model: SiteEngineer,
                        
                        include: [{ model: User }]
                    }]
                },
                {
                    model: ExplosiveController,
                    include: [{ model: User }]
                }
            ]
        });

        const recipients = [];

        // Add Site Engineer
        if (permit.MiningSite?.SiteEngineer?.User) {
            recipients.push({
                id: permit.MiningSite.SiteEngineer.User.id,
                email: permit.MiningSite.SiteEngineer.User.email,
                name: permit.MiningSite.SiteEngineer.User.username
            });
        }

        // Add Controller
        if (permit.ExplosiveController?.User) {
            recipients.push({
                id: permit.ExplosiveController.User.id,
                email: permit.ExplosiveController.User.email,
                name: permit.ExplosiveController.User.username
            });
        }

        return recipients;
    } catch (error) {
        console.error('Error getting permit recipients:', error);
        throw error;
    }
}

// Get Purchase Recipients (Site Engineer and Dealer)
async getPurchaseRecipients(purchaseId) {
    try {
        const purchase = await Purchase.findByPk(purchaseId, {
            include: [
                {
                    model: ExplosiveStore,
                    include: [{
                        model: MiningSite,
                        include: [{
                            model: SiteEngineer,
                            include: [{ model: User }]
                        }]
                    }]
                },
                {
                    model: ExplosiveDealer,
                    include: [{ model: User }]
                }
            ]
        });

        const recipients = [];

        // Add Site Engineer
        if (purchase.ExplosiveStore?.MiningSite?.SiteEngineer?.User) {
            recipients.push({
                id: purchase.ExplosiveStore.MiningSite.SiteEngineer.User.id,
                email: purchase.ExplosiveStore.MiningSite.SiteEngineer.User.email,
                name: purchase.ExplosiveStore.MiningSite.SiteEngineer.User.name
            });
        }

        // Add Dealer
        if (purchase.ExplosiveDealer?.User) {
            recipients.push({
                id: purchase.ExplosiveDealer.User.id,
                email: purchase.ExplosiveDealer.User.email,
                name: purchase.ExplosiveDealer.User.name
            });
        }

        return recipients;
    } catch (error) {
        console.error('Error getting purchase recipients:', error);
        throw error;
    }
}

// Quota uses the same recipients as Permit
async getQuotaRecipients(quotaId) {
    try {
        const quota = await WeeklyQuota.findByPk(quotaId, {
            include: [{ model: ExplosivePermit }]
        });
        return await this.getPermitRecipients(quota.PermitID);
    } catch (error) {
        console.error('Error getting quota recipients:', error);
        throw error;
    }
}
}

module.exports = new RecipientService();*/

// notifications/services/recipient.service.js
const { ExplosiveStore, MiningSite, SiteEngineer, ExplosiveController, 
    ExplosiveDealer, User, ExplosivePermit, Purchase, WeeklyQuota } = require('../../models');

class RecipientService {
    // Helper method to format user as recipient
    formatRecipient(user) {
        if (!user) return null;
        return {
            id: user.id,
            email: user.email,
            name: user.username
        };
    }

    // Base methods for getting different types of recipients
    async getControllerRecipient(controllerId) {
        try {
            const controller = await User.findOne({
                where: { reference_id: controllerId }
            });
            return this.formatRecipient(controller);
        } catch (error) {
            console.error('Error getting controller:', error);
            return null;
        }
    }

    async getSiteEngineerRecipient(miningSiteId) {
        try {
            const siteEngineer = await SiteEngineer.findOne({
                where: { MiningSiteID: miningSiteId },
                include: [{ model: User }]
            });
            return this.formatRecipient(siteEngineer?.User);
        } catch (error) {
            console.error('Error getting site engineer:', error);
            return null;
        }
    }

    async getDealerRecipient(dealerId) {
        try {
            const dealer = await User.findOne({
                where: { reference_id: dealerId }
            });
            return this.formatRecipient(dealer);
        } catch (error) {
            console.error('Error getting dealer:', error);
            return null;
        }
    }

    // Main recipient getting methods
    async getStoreRecipients(storeId) {
        try {
            const store = await ExplosiveStore.findByPk(storeId, {
                include: [{ model: MiningSite }]
            });
            if (!store?.MiningSite?.id) return [];

            const siteEngineer = await this.getSiteEngineerRecipient(store.MiningSite.id);
            return siteEngineer ? [siteEngineer] : [];
        } catch (error) {
            console.error('Error getting store recipients:', error);
            return [];
        }
    }

    async getPermitRecipients(permitId = null, { controllerId = null, miningSiteId = null } = {}) {
        try {
            const recipients = [];

            // For new permit creation
            if (!permitId && (controllerId || miningSiteId)) {
                if (controllerId) {
                    const controller = await this.getControllerRecipient(controllerId);
                    if (controller) recipients.push(controller);
                }
                if (miningSiteId) {
                    const siteEngineer = await this.getSiteEngineerRecipient(miningSiteId);
                    if (siteEngineer) recipients.push(siteEngineer);
                }
                return recipients;
            }

            // For existing permit
            const permit = await ExplosivePermit.findByPk(permitId);
            if (!permit) return [];

            const [controller, siteEngineer] = await Promise.all([
                this.getControllerRecipient(permit.ControllerID),
                this.getSiteEngineerRecipient(permit.MiningSiteID)
            ]);

            if (controller) recipients.push(controller);
            if (siteEngineer) recipients.push(siteEngineer);

            return recipients;
        } catch (error) {
            console.error('Error getting permit recipients:', error);
            return [];
        }
    }

    async getPurchaseRecipients(purchaseId = null, { dealerId = null, storeId = null } = {}) {
        try {
            const recipients = [];

            // For new purchase
            if (!purchaseId && (dealerId || storeId)) {
                if (dealerId) {
                    const dealer = await this.getDealerRecipient(dealerId);
                    if (dealer) recipients.push(dealer);
                }
                if (storeId) {
                    const storeRecipients = await this.getStoreRecipients(storeId);
                    recipients.push(...storeRecipients);
                }
                return recipients;
            }

            // For existing purchase
            const purchase = await Purchase.findByPk(purchaseId, {
                include: [
                    { model: ExplosiveStore },
                    { model: ExplosiveDealer }
                ]
            });
            if (!purchase) return [];

            const [dealer, storeRecipients] = await Promise.all([
                this.getDealerRecipient(purchase.DealerID),
                this.getStoreRecipients(purchase.StoreID)
            ]);

            if (dealer) recipients.push(dealer);
            recipients.push(...storeRecipients);

            return recipients;
        } catch (error) {
            console.error('Error getting purchase recipients:', error);
            return [];
        }
    }

    async getQuotaRecipients(quotaId = null, permitId = null) {
        try {
            if (quotaId) {
                const quota = await WeeklyQuota.findByPk(quotaId);
                return this.getPermitRecipients(quota.PermitID);
            }
            return this.getPermitRecipients(permitId);
        } catch (error) {
            console.error('Error getting quota recipients:', error);
            return [];
        }
    }
}

module.exports = new RecipientService();