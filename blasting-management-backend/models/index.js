const sequelize = require('../config/db.config');
const User = require('./user.model');
const Role = require('./role.model');
const TestBlastDetails = require('./test-blast-details.model');
const TestBlast = require('./test-blast.model');
const TestBlastHole = require('./test-blast-hole.model');
const MonitoringLocation = require('./monitoring-location.model');
const TestBlastMonitoring = require('./test-blast-monitoring.model');
const GSMBOfficer = require('./gsmb-officer.model');
const MiningSite = require('./mining-site.model');
const License = require('./mining-license.model')
const SiteEngineer = require('./site_engineer.model');
const ExplosiveController = require('./explosive_controller.model');
const ExplosiveDealer = require('./explosive_dealer.model');
const ExplosiveType = require('./explosive-type.model');
const ExplosiveStore = require('./explosive-store.model');
const { StoreInventory, InventoryMovement } = require('./store-inventory.model');
const {ExplosiveIssuance, ExplosiveIssuanceItem}= require('./explosive-issuance.model');
const { ExplosivePermit, PermitAllowedExplosive, PermitHistory, PermitUsage } = require('./explosive-permit.model');
const IssuanceItems = require('./issuance-items.model');
const {WeeklyQuota, QuotaItems, QuotaHistory, QuotaUsage} = require('./weekly-quota.model');
const { Purchase, PurchaseItems, PurchaseHistory, PurchaseDocument } = require('./purchase.model');
const Notification = require('./notification.model');
const NotificationTemplate = require('./notification-template.model');
const NotificationLog = require('./notification-log.model');
const UserSession = require('./user-session.model');
const MinableBoundary = require('./minable-boundary.model');
const DrillingSite = require('./drilling-site.model');
const DrillingPattern = require('./drilling-pattern.model');
const DrillHole = require('./drill-hole.model');
const DailyBlastOperation = require('./daily-blast-operation.model');
const DailyBlastExplosive = require('./daily-blast-explosive.model');
const BlastResult = require('./blast-results.model');
const BlastHole = require('./blast-hole.model');
const BlastHoleExplosive = require('./blast-hole-explosive.model');
const BlastEvent = require('./blast-event.model');
const BlastEventExplosive = require('./blast-event-explosive.model');

const ExplosiveAllocation = require('./explosive-allocation.model');
const ExplosiveAllocationItem = require('./explosive-allocation.model');






// Define relationships if needed
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

User.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

// Role-specific relationships
User.hasOne(SiteEngineer, {
  foreignKey: 'EngineerID',
  sourceKey: 'reference_id',
  constraints: false,
  //scope: {
   // reference_type: 'SITE_ENGINEER'
  //}
});

SiteEngineer.belongsTo(User, {
  foreignKey: 'EngineerID',
  targetKey: 'reference_id',
  constraints: false
});

// Controller relationships
User.hasOne(ExplosiveController, {
  foreignKey: 'ControllerID',
  sourceKey: 'reference_id',
  constraints: false,
  //scope: {
    //  reference_type: 'EXPLOSIVE_CONTROLLER'
  //}
});

ExplosiveController.belongsTo(User, {
  foreignKey: 'ControllerID',
  targetKey: 'reference_id',
  constraints: false
});

// Dealer relationships
User.hasOne(ExplosiveDealer, {
  foreignKey: 'DealerID',
  sourceKey: 'reference_id',
  constraints: false,
  //scope: {
     // reference_type: 'EXPLOSIVE_DEALER'
  //}
});

ExplosiveDealer.belongsTo(User, {
  foreignKey: 'DealerID',
  targetKey: 'reference_id',
  constraints: false
});

/*SiteEngineer.belongsTo(MiningSite, {
  foreignKey: 'MiningSiteID',
  as: 'miningSites'
});*/

MiningSite.hasOne(SiteEngineer, { foreignKey: 'MiningSiteID' });
SiteEngineer.belongsTo(MiningSite, { foreignKey: 'MiningSiteID' });
/*MiningSite.hasMany(SiteEngineer,{
  foreignKey: 'MiningSiteID',
  as: 'miningSites'
})*/

TestBlastDetails.hasMany(TestBlast, {
  foreignKey: 'test_blast_details_id'
});
TestBlast.belongsTo(TestBlastDetails, {
  foreignKey: 'test_blast_details_id'
});

TestBlast.hasMany(TestBlastHole, {
  foreignKey: 'test_blast_id'
});
TestBlastHole.belongsTo(TestBlast, {
  foreignKey: 'test_blast_id'
});

TestBlast.hasMany(TestBlastMonitoring, {
  foreignKey: 'test_blast_id'
});
TestBlastMonitoring.belongsTo(TestBlast, {
  foreignKey: 'test_blast_id'
});

MonitoringLocation.hasMany(TestBlastMonitoring, {
  foreignKey: 'monitoring_location_id'
});
TestBlastMonitoring.belongsTo(MonitoringLocation, {
  foreignKey: 'monitoring_location_id'
});

GSMBOfficer.hasMany(TestBlast, {
  foreignKey: 'gsmb_officer_id'
});
TestBlast.belongsTo(GSMBOfficer, {
  foreignKey: 'gsmb_officer_id'
});
MiningSite.belongsTo(License, {
  foreignKey: 'license_id',
  as: 'license'
});

MiningSite.hasMany(TestBlastDetails, {
  foreignKey: 'site_id',
  as: 'testBlastDetails'
});

MiningSite.hasMany(MonitoringLocation, {
  foreignKey: 'site_id',
  as: 'monitoringLocations'
});

// Update TestBlastDetails relation
TestBlastDetails.belongsTo(MiningSite, {
  foreignKey: 'site_id',
  as: 'miningSite'
});

// Update MonitoringLocation relation
MonitoringLocation.belongsTo(MiningSite, {
  foreignKey: 'site_id',
  as: 'miningSite'
});
License.hasMany(MiningSite, {
  foreignKey: 'license_id',
  as: 'miningSites'    // Define the reverse alias
});


ExplosiveType.hasMany(PermitAllowedExplosive, {
  foreignKey: 'ExplosiveTypeID',
  onDelete: 'RESTRICT' // Prevent deletion if referenced
});
PermitAllowedExplosive.belongsTo(ExplosiveType, {
  foreignKey: 'ExplosiveTypeID'
});

// With QuotaItems
ExplosiveType.hasMany(QuotaItems, {
  foreignKey: 'ExplosiveTypeID',
  onDelete: 'RESTRICT'
});
QuotaItems.belongsTo(ExplosiveType, {
  foreignKey: 'ExplosiveTypeID'
});

// With PurchaseItems
ExplosiveType.hasMany(PurchaseItems, {
  foreignKey: 'ExplosiveTypeID',
  onDelete: 'RESTRICT'
});
PurchaseItems.belongsTo(ExplosiveType, {
  foreignKey: 'ExplosiveTypeID'
});

// With StoreInventory
ExplosiveType.hasMany(StoreInventory, {
  foreignKey: 'ExplosiveTypeID',
  onDelete: 'RESTRICT'
});
StoreInventory.belongsTo(ExplosiveType, {
  foreignKey: 'ExplosiveTypeID'
});

// With IssuanceItems
ExplosiveType.hasMany(IssuanceItems, {
  foreignKey: 'ExplosiveTypeID',
  onDelete: 'RESTRICT'
});
IssuanceItems.belongsTo(ExplosiveType, {
  foreignKey: 'ExplosiveTypeID'
});

// Add to existing relationships
ExplosiveStore.belongsTo(MiningSite, {
  foreignKey: 'MiningSiteID'
});

ExplosiveStore.hasMany(StoreInventory, {
  foreignKey: 'StoreID'
});

MiningSite.hasOne(ExplosiveStore, {
  foreignKey: 'MiningSiteID'
});

// StoreInventory relationships
StoreInventory.belongsTo(ExplosiveStore, {
  foreignKey: 'StoreID'
});

StoreInventory.belongsTo(ExplosiveType, {
  foreignKey: 'ExplosiveTypeID'
});

StoreInventory.hasMany(InventoryMovement, {
  foreignKey: 'InventoryID'
});

InventoryMovement.belongsTo(StoreInventory, {
  foreignKey: 'InventoryID'
});

// Add User relationship for movement tracking
InventoryMovement.belongsTo(User, {
  foreignKey: 'CreatedBy',
  as: 'Creator'
});

// Relationships for Explosive Issuance
ExplosiveIssuance.belongsTo(ExplosiveStore, {
  foreignKey: 'store_id'
});
ExplosiveStore.hasMany(ExplosiveIssuance, {
  foreignKey: 'store_id'
});

ExplosiveIssuance.hasMany(ExplosiveIssuanceItem, {
  foreignKey: 'issuance_id'
});
ExplosiveIssuanceItem.belongsTo(ExplosiveIssuance, {
  foreignKey: 'issuance_id'
});

ExplosiveIssuanceItem.belongsTo(ExplosiveType, {
  foreignKey: 'explosive_type_id'
});
// Define relationships
//Relationships for Purchases

Purchase.hasMany(PurchaseItems, {
  foreignKey: 'PurchaseID',
  onDelete: 'CASCADE'
});

PurchaseItems.belongsTo(Purchase, {
  foreignKey: 'PurchaseID'
});

Purchase.hasMany(PurchaseHistory, {
  foreignKey: 'PurchaseID',
  onDelete: 'CASCADE'
});

PurchaseHistory.belongsTo(Purchase, {
  foreignKey: 'PurchaseID'
});

Purchase.hasMany(PurchaseDocument, {
  foreignKey: 'PurchaseID',
  onDelete: 'CASCADE'
});

PurchaseDocument.belongsTo(Purchase, {
  foreignKey: 'PurchaseID'
});

Purchase.belongsTo(WeeklyQuota, {
  foreignKey: 'QuotaID'
});

WeeklyQuota.hasOne(Purchase,{
  foreignKey: 'QuotaID'
});

Purchase.belongsTo(ExplosiveDealer, {
  foreignKey: 'DealerID'
});

Purchase.belongsTo(ExplosiveStore, {
  foreignKey: 'StoreID'
});

PurchaseItems.belongsTo(ExplosiveType, {
  foreignKey: 'ExplosiveTypeID'
});

// Define model relationships
// Relationships for Explosive Permits

ExplosivePermit.belongsTo(License, {
  foreignKey: 'LicenseID',
  as: 'license'
});

License.hasOne(ExplosivePermit,{
  foreignKey: 'LicenseID',
  as: 'license'
});

ExplosivePermit.belongsTo(MiningSite, {
  foreignKey: 'MiningSiteID',
  as: 'miningSites'
});

/*MiningSite.hasOne(ExplosivePermit,{
  foreignKey: 'MiningSiteID',
  as: 'miningSites'
});*/

ExplosivePermit.hasMany(PermitAllowedExplosive, {
  foreignKey: 'PermitID',
  onDelete: 'CASCADE'
});

PermitAllowedExplosive.belongsTo(ExplosivePermit, {
  foreignKey: 'PermitID'
});

ExplosivePermit.hasMany(PermitHistory, {
  foreignKey: 'PermitID',
  onDelete: 'CASCADE'
});

PermitHistory.belongsTo(ExplosivePermit, {
  foreignKey: 'PermitID'
});

ExplosivePermit.hasMany(PermitUsage, {
  foreignKey: 'PermitID',
  onDelete: 'CASCADE'
});

// Define the associations of permits and controller
ExplosivePermit.belongsTo(ExplosiveController, {
  foreignKey: 'ControllerID'
});

ExplosiveController.hasMany(ExplosivePermit, {
  foreignKey: 'ControllerID'
});

PermitUsage.belongsTo(ExplosivePermit, {
  foreignKey: 'PermitID'
});

// Add to explosive type relationships
PermitAllowedExplosive.belongsTo(ExplosiveType, {
  foreignKey: 'ExplosiveTypeID'
});

PermitUsage.belongsTo(ExplosiveType, {
  foreignKey: 'ExplosiveTypeID'
});

// Define relationships
WeeklyQuota.hasMany(QuotaItems, {
  foreignKey: 'QuotaID',
  onDelete: 'CASCADE'
});

QuotaItems.belongsTo(WeeklyQuota, {
  foreignKey: 'QuotaID'
});

WeeklyQuota.hasMany(QuotaHistory, {
  foreignKey: 'QuotaID',
  onDelete: 'CASCADE'
});

QuotaHistory.belongsTo(WeeklyQuota, {
  foreignKey: 'QuotaID'
});

WeeklyQuota.hasMany(QuotaUsage, {
  foreignKey: 'QuotaID',
  onDelete: 'CASCADE'
});

QuotaUsage.belongsTo(WeeklyQuota, {
  foreignKey: 'QuotaID'
});

WeeklyQuota.belongsTo(ExplosivePermit, {
  foreignKey: 'PermitID'
});

WeeklyQuota.belongsTo(ExplosiveController, {
  foreignKey: 'ApprovedBy',
  targetKey: 'ControllerID'
});

ExplosiveController.hasMany(WeeklyQuota, {
  foreignKey: 'ApprovedBy',
  sourceKey: 'ControllerID'
});


QuotaItems.belongsTo(ExplosiveType, { 
  foreignKey: 'ExplosiveTypeID'
});

// Notification relationships
Notification.belongsTo(User, {
  foreignKey: 'UserID'
});

User.hasMany(Notification, {
  foreignKey: 'UserID'
});

// Template relationships
NotificationTemplate.hasMany(NotificationLog, {
  foreignKey: 'TemplateID'
});

NotificationLog.belongsTo(NotificationTemplate, {
  foreignKey: 'TemplateID'
});

// Log relationships
Notification.hasMany(NotificationLog, {
  foreignKey: 'NotificationID'
});

NotificationLog.belongsTo(Notification, {
  foreignKey: 'NotificationID'
});

// User session relationships
User.hasMany(UserSession, {
  foreignKey: 'userId',
  onDelete: 'CASCADE'
});

UserSession.belongsTo(User, {
  foreignKey: 'userId'
});
// MinableBoundary relationships with MiningSite
MinableBoundary.belongsTo(MiningSite, {
  foreignKey: 'mining_site_id',
  as: 'miningSite'
});

MiningSite.hasMany(MinableBoundary, {
  foreignKey: 'mining_site_id',
  as: 'boundaryPoints'
});

// MinableBoundary relationships with License
MinableBoundary.belongsTo(License, {
  foreignKey: 'license_id',
  as: 'license'
});

License.hasMany(MinableBoundary, {
  foreignKey: 'license_id',
  as: 'boundaryPoints'
});

// MinableBoundary relationship with User (for created_by)
MinableBoundary.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// Drilling Site Relationships
DrillingSite.belongsTo(MiningSite, {
  foreignKey: 'miningSiteId',
  as: 'miningSite'
});
MiningSite.hasMany(DrillingSite, {
  foreignKey: 'miningSiteId',
  as: 'drillingSites'
});

// Drilling Pattern Relationships
DrillingPattern.belongsTo(DrillingSite, {
  foreignKey: 'drilling_site_id',
  as: 'drillingSite'
});
DrillingSite.hasMany(DrillingPattern, {
  foreignKey: 'drilling_site_id',
  as: 'drillingPatterns'
});

// Drill Hole Relationships
DrillHole.belongsTo(DrillingPattern, {
  foreignKey: 'pattern_id',
  as: 'drillingPattern'
});
DrillHole.belongsTo(DrillingSite, {
  foreignKey: 'drilling_site_id',
  as: 'drillingSite'
});
DrillingPattern.hasMany(DrillHole, {
  foreignKey: 'pattern_id',
  as: 'drillHoles'
});
DrillingSite.hasMany(DrillHole, {
  foreignKey: 'drilling_site_id',
  as: 'drillHoles'
});

// Daily Blast Operation Relationships
DailyBlastOperation.belongsTo(MiningSite, {
  foreignKey: 'miningSiteId',
  as: 'miningSite'
});
MiningSite.hasMany(DailyBlastOperation, {
  foreignKey: 'miningSiteId',
  as: 'dailyBlastOperations'
});

// Daily Blast Explosive Relationships
DailyBlastExplosive.belongsTo(DailyBlastOperation, {
  foreignKey: 'daily_blast_id',
  as: 'dailyBlastOperation'
});
DailyBlastExplosive.belongsTo(ExplosiveType, {
  foreignKey: 'explosive_type_id',
  as: 'explosiveType'
});

DailyBlastOperation.hasMany(DailyBlastExplosive, {
  foreignKey: 'daily_blast_id',
  as: 'dailyBlastExplosives'
});

// Blast Event Relationships
BlastEvent.belongsTo(DailyBlastOperation, {
  foreignKey: 'daily_blast_id',
  as: 'dailyBlastOperation'
});
BlastEvent.belongsTo(DrillingSite, {
  foreignKey: 'drilling_site_id',
  as: 'drillingSite'
});

// Blast Event Explosive Relationships
BlastEventExplosive.belongsTo(BlastEvent, {
  foreignKey: 'blast_id',
  as: 'blastEvent'
});
BlastEventExplosive.belongsTo(ExplosiveType, {
  foreignKey: 'explosive_type_id',
  as: 'explosiveType'
});
BlastEvent.hasMany(BlastEventExplosive, {
  foreignKey: 'blast_id',
  as: 'blastEventExplosives'
});

// Blast Hole Relationships
BlastHole.belongsTo(BlastEvent, {
  foreignKey: 'blast_id',
  as: 'blastEvent'
});
BlastHole.belongsTo(DrillHole, {
  foreignKey: 'drill_hole_id',
  as: 'drillHole'
});
BlastEvent.hasMany(BlastHole, {
  foreignKey: 'blast_id',
  as: 'blastHoles'
});

// Blast Hole Explosive Relationships
BlastHoleExplosive.belongsTo(BlastHole, {
  foreignKey: 'blast_hole_id',
  as: 'blastHole'
});
BlastHoleExplosive.belongsTo(ExplosiveType, {
  foreignKey: 'explosive_type_id',
  as: 'explosiveType'
});
BlastHole.hasMany(BlastHoleExplosive, {
  foreignKey: 'blast_hole_id',
  as: 'blastHoleExplosives'
});

// Blast Result Relationships
BlastResult.belongsTo(BlastEvent, {
  foreignKey: 'blast_id',
  as: 'blastEvent'
});
BlastEvent.hasOne(BlastResult, {
  foreignKey: 'blast_id',
  as: 'blastResult'
});


// Daily Blast Operation Relationships newly changes, needed to refine


DailyBlastOperation.hasMany(BlastEvent, {
  foreignKey: 'daily_blast_id',
  as: 'blastEvents'
});

DailyBlastOperation.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// Daily Blast Explosive Relationships




DailyBlastExplosive.belongsTo(ExplosiveIssuance, {
  foreignKey: 'issuance_id',
  as: 'issuance'
});



// Blast Event Relationships


/*
// ExplosiveAllocation Relations
ExplosiveAllocation.belongsTo(DailyBlastOperation, {
  foreignKey: 'daily_blast_id',
  as: 'dailyOperation'
});

ExplosiveAllocation.belongsTo(ExplosiveStore, {
  foreignKey: 'store_id',
  as: 'store'
});



ExplosiveAllocation.hasMany(ExplosiveAllocationItem, {
  foreignKey: 'allocation_id',
  as: 'items'
});

ExplosiveAllocationItem.belongsTo(ExplosiveAllocation, {
  foreignKey: 'allocation_id'
});

ExplosiveAllocationItem.belongsTo(ExplosiveType, {
  foreignKey: 'explosive_type_id',
  as: 'explosiveType'
});

// Link with inventory movements
InventoryMovement.belongsTo(ExplosiveAllocation, {
  foreignKey: 'ReferenceID',
  constraints: false,
  scope: {
      ReferenceType: 'Allocation'
  }
});*/

ExplosiveIssuance.belongsTo(DailyBlastOperation, {
  foreignKey: 'daily_blast_id',
  as: 'dailyOperation'
});

DailyBlastOperation.hasMany(ExplosiveIssuance, {
  foreignKey: 'daily_blast_id',
  as: 'explosiveIssuances'
});

BlastEventExplosive.belongsTo(ExplosiveIssuance, {
  foreignKey: 'issuance_id',
  as: 'issuance'
});


module.exports = {
  sequelize,
  User,
  Role,
  TestBlastDetails,
  TestBlast,
  TestBlastHole,
  MonitoringLocation,
  TestBlastMonitoring,
  GSMBOfficer,
  MiningSite,
  SiteEngineer,
  License,
  ExplosiveController,
  ExplosiveDealer,
  ExplosiveType,
  PermitAllowedExplosive,
  QuotaItems,
  QuotaHistory,
  QuotaUsage,
  PurchaseItems,
  StoreInventory,
  IssuanceItems,
  ExplosiveStore,
  InventoryMovement,
  ExplosivePermit,
  PermitHistory,
  PermitUsage,
  WeeklyQuota,
  Purchase,
  PurchaseHistory,
  PurchaseDocument,
  ExplosiveIssuance,
  Notification,
  NotificationTemplate,
  NotificationLog,
  UserSession,
  MinableBoundary,
  DrillingSite,
  DrillingPattern,
  DrillHole,
  DailyBlastOperation,
  DailyBlastExplosive,
  BlastEvent,
  BlastEventExplosive,
  BlastHole,
  BlastHoleExplosive,
  BlastResult,
  ExplosiveIssuanceItem


};

