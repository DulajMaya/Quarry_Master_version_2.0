const testBlastValidation = {
    test_blast_details_id: { type: 'number', required: true },
    gsmb_officer_id: { type: 'number', required: true },
    kadawala_gps_north: { type: 'number', required: true },
    kadawala_gps_east: { type: 'number', required: true },
    time_fired: { type: 'string', required: true, pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/ },
    number_of_holes: { type: 'number', required: true, min: 1 },
    number_of_rows: { type: 'number', required: true, min: 1 }
};

module.exports = testBlastValidation ;