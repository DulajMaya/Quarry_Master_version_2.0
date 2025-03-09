// issuance.controller.js

const issuanceService = require('../services/issuance.service');

exports.createIssuance = async (req, res) => {
   try {
       // Validate input data
       await issuanceService.validateIssuance(
           req.body.storeId,
           req.body.items
       );

       const issuance = await issuanceService.createIssuance(
           {
               storeId: req.body.storeId,
               purpose: req.body.purpose,
               items: req.body.items
           },
           req.userId
       );

       res.status(201).json({
           status: 'success',
           message: 'Explosives issued successfully',
           data: issuance
       });
   } catch (error) {
       res.status(error.status || 500).json({
           status: 'error',
           message: error.message || 'Error issuing explosives'
       });
   }
};

exports.recordReturn = async (req, res) => {
   try {
       const issuance = await issuanceService.recordReturn(
           req.params.issuanceId,
           {
               items: req.body.items,
               remarks: req.body.remarks
           },
           req.userId
       );

       res.json({
           status: 'success',
           message: 'Return recorded successfully',
           data: issuance
       });
   } catch (error) {
       res.status(error.status || 500).json({
           status: 'error',
           message: error.message || 'Error recording return'
       });
   }
};

exports.getIssuanceDetails = async (req, res) => {
   try {
       const issuance = await issuanceService.getIssuanceDetails(
           req.params.issuanceId
       );

       if (!issuance) {
           return res.status(404).json({
               status: 'error',
               message: 'Issuance not found'
           });
       }

       res.json({
           status: 'success',
           data: issuance
       });
   } catch (error) {
       res.status(error.status || 500).json({
           status: 'error',
           message: error.message || 'Error retrieving issuance details'
       });
   }
};

exports.getStoreIssuances = async (req, res) => {
   try {
       const filters = {
           status: req.query.status,
           startDate: req.query.startDate,
           endDate: req.query.endDate
       };

       const issuances = await issuanceService.getStoreIssuances(
           req.params.storeId,
           filters
       );

       res.json({
           status: 'success',
           data: issuances
       });
   } catch (error) {
       res.status(error.status || 500).json({
           status: 'error',
           message: error.message || 'Error retrieving issuances'
       });
   }
};