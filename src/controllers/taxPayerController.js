
import { CRUD, TaxUtils } from "../models/crud.js";

// Initialize CRUD instances for each table
const taxPayersCrud = new CRUD("taxpayers", "taxpayer_id");
const additionalPersonsCrud = new CRUD("additional_persons", "taxpayer_id"); 
const propertyInfoCrud = new CRUD("properties", "taxpayer_id"); // WE USED THIS FOR READ ONLY 
const propertyCrud = new CRUD('properties' , 'property_id');  // CRUD using property_id
const fileCrud = new CRUD("files", "taxpayer_id");
const deleteFileCrud = new CRUD('files', 'id');
// Async function to create a taxpayer
async function createTaxPayer(req, res) {
  try {
    // Destructure tax payer data from request body
    const {
      firstname,
      middlename,
      lastname,
      date_of_birth,
      email,
      phone,
      place_of_birth,
      complete_address,
      status,
      gender,
      additionalFirstname,
      additionalMiddlename,
      additionalLastname,
      additionalEmail,
      additionalPhone,
      relationship,
      additionalCompleteAddress,
      propertyType,
      marketValue,
      areaSize,
      taxRate,
      ownershipType,
      propertyUse,
      classification,
      occupancyStatus,
      nextAssessmentDate,
      lastAssessmentDate,
      property_location,
    } = req.body;

    const formattedDate_date_of_birth = new Date(date_of_birth)
      .toISOString()
      .split("T")[0]; // YYYY-MM-DD
    const formattedDate_nextAssessmentDate = new Date(nextAssessmentDate)
      .toISOString()
      .split("T")[0]; // YYYY-MM-DD
    const formattedDate_lastAssessmentDate = new Date(lastAssessmentDate)
      .toISOString()
      .split("T")[0]; // YYYY-MM-DD

    // Insert tax payer record
    const newTaxPayer = await taxPayersCrud.create({
      firstname,
      middlename,
      lastname,
      date_of_birth: formattedDate_date_of_birth,
      email,
      phone,
      place_of_birth,
      complete_address,
      status,
      gender,
    });

    // Insert additional person if provided

    await additionalPersonsCrud.create({
      taxpayer_id: newTaxPayer.taxpayer_id, // Foreign key reference
      firstname: additionalFirstname,
      middlename: additionalMiddlename,
      lastname: additionalLastname,
      email: additionalEmail,
      phone: additionalPhone,
      relationship: relationship,
      complete_address: additionalCompleteAddress,
    });

    // Insert property info if provided



    // insert property info
    await propertyInfoCrud.create({
      taxpayer_id: newTaxPayer.taxpayer_id,
      property_type: propertyType,
      market_value: marketValue,
      area_size: areaSize,
      tax_rate: taxRate,
      ownership_type: ownershipType,
      property_use: propertyUse,
      classification,
      occupancy_status: occupancyStatus,
      last_assessment_date: formattedDate_nextAssessmentDate,
      next_assessment_date: formattedDate_lastAssessmentDate,
      property_location,
  });


    res.redirect('/taxPayer');
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


//create files
async function createFiles(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const taxpayer_id = req.body.taxpayer_id;
    if (!taxpayer_id) {
      return res.status(400).json({
        success: false,
        message: 'Taxpayer ID is required'
      });
    }

    const {
      originalname,
      buffer,
      mimetype
    } = req.file;

    // Create file record
    await fileCrud.create({
      taxpayer_id,
      filename: originalname,
      data: buffer,
      mimetype
    });

    return res.json({
      success: true,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
}



//Read all tax payers (from tax payers table only)
async function readTaxPayers(req, res) {
  try {

    const session = req.user;

    const taxPayers = await taxPayersCrud.readAll();

    res.render("admin/userManagement", { taxPayers, session });
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


function getFileIcon(mimetype) {
  if (mimetype.startsWith('image/')) {
      return 'fa-regular fa-image fa-lg text-primary';
  } else if (mimetype === 'application/pdf') {
      return 'fa-regular fa-file-pdf fa-lg text-danger';
  } else if (mimetype.startsWith('text/')) {
      return 'fa-solid fa-comment-dots fa-lg text-info';
  } else  if (mimetype.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      return 'fa-regular fa-file-excel fa-lg text-success';
  }
}

//Read all tax payer information by id (from taxpayers, additional person, and properties table)
async function readTaxPayerProfile(req, res) {
  try {

    const session = req.user;

    const id = parseInt(req.body.taxpayer_id, 10);
    const taxPayer = await taxPayersCrud.readById(id);
    const properties = await propertyInfoCrud.readByIdWithMultipleRow(id);
    const additionalPerson = await additionalPersonsCrud.readById(id);
    const files = await fileCrud.readFiles(id);
    console.log(properties)
    res.render("admin/taxPayerProfile", {
      taxPayer,
      properties,
      additionalPerson,
      session,
      files,
      getFileIcon
    });
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}

//Read all information of tax payer by id then UPDATE (from taxpayers, additional person, and properties table)
async function editTaxPayerProfile(req, res) {
  try {

    const session = req.user;

    // Parse the taxpayer ID from the request
    const id = parseInt(req.body.taxpayer_id, 10);
    const taxPayer = await taxPayersCrud.readById(id);
    const properties = await propertyInfoCrud.readById(id);
    const additionalPerson = await additionalPersonsCrud.readById(id);
    
    // Render the edit page with updated information
    res.render("admin/taxPayerEdit", {
      taxPayer,
      properties,
      additionalPerson,
      session
    });
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}

//UPDATE all information of tax payer by id (from taxpayers, additional person, and properties table)
async function updateTaxPayerProfile(req, res) {
  try {

    const session = req.user;

    // Parse taxpayer ID from request
    const id = parseInt(req.body.taxpayer_id, 10);
    if (isNaN(id)) {
      throw new Error("Invalid taxpayer ID");
    }

    // Destructure taxpayer data from request body
    const {
      firstname,
      middlename,
      lastname,
      date_of_birth,
      email,
      phone,
      place_of_birth,
      complete_address,
      status,
      gender,
      additionalFirstname,
      additionalMiddlename,
      additionalLastname,
      additionalEmail,
      additionalPhone,
      relationship,
      additionalCompleteAddress,
   
    } = req.body;

    // Validate and format dates
    const formatDate = (date) => {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) return null;
      return parsedDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
  };

    const formattedDateOfBirth = formatDate(date_of_birth);
    // const formattedNextAssessmentDate = formatDate(nextAssessmentDate);
    // const formattedLastAssessmentDate = formatDate(lastAssessmentDate);

    if (!formattedDateOfBirth) {
      throw new Error("Invalid date of birth");
    }

    // Update taxpayer record
    const updatedTaxPayer = await taxPayersCrud.update(id, {
      firstname,
      middlename,
      lastname,
      date_of_birth: formattedDateOfBirth,
      email,
      phone,
      place_of_birth,
      complete_address,
      status,
      gender,
    
    });

    // Update additional person if provided
    await additionalPersonsCrud.update(id, {
      firstname: additionalFirstname,
      middlename: additionalMiddlename,
      lastname: additionalLastname,
      email: additionalEmail,
      phone: additionalPhone,
      relationship,
      complete_address: additionalCompleteAddress,
    });

   

    // Fetch updated records to pass to the view
    const updatedAdditionalPerson = await additionalPersonsCrud.readById(id);
    const updatedProperties = await propertyInfoCrud.readById(id);

    // Render the edit page with updated information
    res.render("admin/taxPayerEdit", {
      session,
      taxPayer: updatedTaxPayer,
      properties: updatedProperties,
      additionalPerson: updatedAdditionalPerson,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


async function addProperty(req, res) {

  try { 

    const {
      taxpayer_id,
      propertyType,
      assessedValue,
      areaSize,
      taxRate,
      ownershipType,
      propertyUse,
      classification,
      occupancyStatus,
      property_location,
      nextAssessmentDate,
      lastAssessmentDate
    } = req.body;


    const session = req.user;

        // Validate and format dates
        const formatDate = (date) => {
          const parsedDate = new Date(date);
          if (isNaN(parsedDate)) return null;
          return parsedDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
      };
    
       
        const formattedNextAssessmentDate = formatDate(nextAssessmentDate);
        const formattedLastAssessmentDate = formatDate(lastAssessmentDate);
    
    
        // insert property info
        await propertyInfoCrud.create({
          taxpayer_id,
          property_type: propertyType,
          assessed_value: assessedValue,
          area_size: areaSize,
          tax_rate: taxRate,
          ownership_type: ownershipType,
          property_use: propertyUse,
          classification,
          occupancy_status: occupancyStatus,
          last_assessment_date: formattedLastAssessmentDate,
          next_assessment_date: formattedNextAssessmentDate,
          property_location,
      });

      const id = parseInt(req.body.taxpayer_id, 10);
      const taxPayer = await taxPayersCrud.readById(id);
      const properties = await propertyInfoCrud.readByIdWithMultipleRow(id);
      const additionalPerson = await additionalPersonsCrud.readById(id);
      const files = await fileCrud.readFiles(id);

      res.render('admin/taxPayerProfile',{
        taxPayer,
        properties,
        additionalPerson,
        files,
        session,
        getFileIcon
      });
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


//Update tax payer by property_id
async function updateProperty(req, res) {

  try { 

    const {
      taxpayer_id,
      property_id,
      propertyType,
      assessedValue,
      areaSize,
      taxRate,
      ownershipType,
      propertyUse,
      classification,
      occupancyStatus,
      property_location,
      nextAssessmentDate,
      lastAssessmentDate
    } = req.body;


    const session = req.user;

        // Validate and format dates
        const formatDate = (date) => {
          const parsedDate = new Date(date);
          if (isNaN(parsedDate)) return null;
          return parsedDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
      };
    
       
        const formattedNextAssessmentDate = formatDate(nextAssessmentDate);
        const formattedLastAssessmentDate = formatDate(lastAssessmentDate);
    
    
        // insert property info
        await propertyCrud.update(
          property_id, {
          property_type: propertyType,
          assessed_value: assessedValue,
          area_size: areaSize,
          tax_rate: taxRate,
          ownership_type: ownershipType,
          property_use: propertyUse,
          classification,
          occupancy_status: occupancyStatus,
          last_assessment_date: formattedLastAssessmentDate,
          next_assessment_date: formattedNextAssessmentDate,
          property_location,
       });

      const id = parseInt(req.body.taxpayer_id, 10);
      const taxPayer = await taxPayersCrud.readById(id);
      const properties = await propertyInfoCrud.readByIdWithMultipleRow(id);
      const additionalPerson = await additionalPersonsCrud.readById(id);
      const files = await fileCrud.readFiles(id);

      res.render('admin/taxPayerProfile',{
        taxPayer,
        properties,
        additionalPerson,
        files,
        session,
        getFileIcon
      });
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


//delete taxpayers by id
async function deleteProperty(req, res) {
  try {

    const session = req.user;
    
    const property_id = parseInt(req.body.property_id);
    await propertyCrud.delete(property_id);

    // Parse the taxpayer ID from the request
    const id = parseInt(req.body.taxpayer_id, 10);
    const taxPayer = await taxPayersCrud.readById(id);
    const properties = await propertyInfoCrud.readByIdWithMultipleRow(id);
    const additionalPerson = await additionalPersonsCrud.readById(id);  
    const files = await fileCrud.readFiles(id);

    res.render("admin/taxPayerProfile", {
      taxPayer,
      properties,
      additionalPerson,
      session,
      files,
      getFileIcon
    });
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}

//delete taxpayers by id
async function deleteTaxPayer(req, res) {
  try {
    const taxPayerId = req.params.id;
    await taxPayersCrud.delete(taxPayerId);
    res.redirect("/taxPayer");
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


// Delete file by id
async function deleteFile(req, res) {

  try {
    
    const session = req.user;    

    const {fileId} = req.body;
    await deleteFileCrud.delete(fileId);
    const id = parseInt(req.body.taxpayer_id, 10);


    const taxPayer = await taxPayersCrud.readById(id);
    const properties = await propertyInfoCrud.readByIdWithMultipleRow(id);
    const additionalPerson = await additionalPersonsCrud.readById(id);
    const files = await fileCrud.readFiles(id);
 
    res.render("admin/taxPayerProfile", {
      taxPayer,
      properties,
      additionalPerson,
      session,
      files,
      getFileIcon
    });
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


// ************************************************** /FOR ASSESSOR ******************************************************






// ************************************************** FOR AUTHENTICATED TAXPAYERS ****************************************************
//for authenticated taxpayers
const invoiceCrudForAuthenticatedTaxpayers = new CRUD('invoice', 'taxpayer_id');
const taxPayersCrudForAuthenticatedTaxPayer = new CRUD("taxpayers", "email");
const additionalPersonsCrudForAuthenticatedTaxPayer = new CRUD("additional_persons", "taxpayer_id");
const propertyInfoCrudForAuthenticatedTaxPayer = new CRUD("properties", "taxpayer_id");
const paymentCrudForAuthenticatedTaxPayer =  new CRUD('payment_history', 'taxpayer_id');
const documentCrud = new CRUD('files', 'id')

      

async function readTaxPayerProfileByEmail(req,res) {

  try{

     // Verify email extraction
     const session = req.user;
    //  console.log('Extracted email:', email);

    const profile = await taxPayersCrudForAuthenticatedTaxPayer.readByEmail(session.email);
    const additionalPerson = await additionalPersonsCrudForAuthenticatedTaxPayer.readById(session.taxpayer_id);


    res.render('taxPayer/profile' , {
      profile,
      additionalPerson,
      session
    });

  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


async function readTaxPayerPropertyByEmail(req,res) {

  try{

    const session = req.user;
    

    const properties = await propertyInfoCrudForAuthenticatedTaxPayer.readByIdWithMultipleRow(session.taxpayer_id);

    res.render('taxPayer/property' , {
      session,
      properties,
    });

  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}

async function readTaxPayerDocumentsByEmail(req,res) {

  try{

    const session =  req.user;

    const files = await fileCrud.readFiles(session.taxpayer_id);
  
    res.render('taxPayer/documents' , {
      session,
      files,
      getFileIcon
    });

  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


// read statement  of account for authenticated taxpayer
async function readInvoiceForAuthenticatedTaxpayer(req, res) {

  try {

    const session = req.user;

    const invoice = await invoiceCrudForAuthenticatedTaxpayers.readByIdWithMultipleRow(session.taxpayer_id);
    console.log('invoice: ',invoice)
    res.render('taxPayer/dashboard', {session, invoice});
    
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


// Read all payment history
async function readPaymentHistoryById(req, res) {
  try {

    const session = req.user;
  
    const paymentHistory = await paymentCrudForAuthenticatedTaxPayer.readByIdWithMultipleRow(session.taxpayer_id);

    res.render('taxPayer/paymentHistoryForTaxPayer', { paymentHistory, session });
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


async function downloadFile(req, res) {
  try {

    const {id} = req.params;

    console.log(id);
    const file = await documentCrud.readById(id);
    console.log(file);
    // Set response headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.send(file.data);

  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}

// ***************************************************FOR AUTHENTICATED TAXPAYER*************************/

 

//*******************************************************FOR TREASURER *********************************/
//for authenticated treasurer
const taxPayersCrudForTreasurer = new CRUD(" taxpayers", 'taxpayer_id');
const taxPayer = new CRUD('taxpayers','taxpayer_id'); //for updating statement of account in the taxpayers table only
const additionalPersonsCrudForTreasurer = new CRUD("additional_persons", "taxpayer_id");
const propertyCrudForTreasurer = new CRUD("properties", "property_id");
const invoiceCrudForTreasurer = new CRUD('invoice', 'id');
const statementOfAccountCrud = new CRUD('statement_of_account', 'taxpayer_id');
const paymentCrud = new CRUD('payment_history', 'taxpayer_id');


async function treasurerDashboard(req, res) {
  try {
    
    const session = req.user;

    const taxReceivables = await TaxUtils.taxReceivables();
    const taxpayerCount = await TaxUtils.taxpayerCount();
    const uncollectedTax = await TaxUtils.uncollectedTax();
    const collectedTax = await TaxUtils.collectedTax();


    res.render('treasurer/dashboard', {
      taxReceivables,
      collectedTax,
      uncollectedTax,
      taxpayerCount,
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


async function insertInvoice(req, res) {
  try {

       const session = req.user;

    const {
      firstname,
      lastname,
      taxpayer_id,
      area_size,
      classification,
      property_use,
      property_type,
      assessment_level,
      market_value,
      tax_rate,
      assessed_value,
      total_tax_amount,
      invoice,
      property_id
    } = req.body;



    // Parse numeric values and handle empty strings
    const parsedAreaSize = parseFloat(area_size) || null;
    const parsedAssessmentLevel = parseFloat(assessment_level) || null;
    const parsedMarketValue = parseFloat(market_value) || null;
    const parsedTaxRate = parseFloat(tax_rate) || null;
    const parsedAssessedValue = parseFloat(assessed_value) || null;
    const parsedTotalTaxAmount = parseFloat(total_tax_amount.replace(/,/g, '')) || null;

    // Create a new invoice record
    await invoiceCrudForTreasurer.create({
      property_id,
      firstname,
      lastname,
      taxpayer_id,
      area_size: parsedAreaSize,
      classification,
      property_use,
      property_type,
      assessment_level: parsedAssessmentLevel,
      market_value: parsedMarketValue,
      tax_rate: parsedTaxRate,
      assessed_value: parsedAssessedValue,
      total_tax_amount: parsedTotalTaxAmount,
    });


    // Update the statement of account with the provided id
    await propertyCrudForTreasurer.update(property_id, { invoice });


    const taxPayer = await taxPayersCrud.readById(taxpayer_id);
    const properties = await propertyInfoCrud.readByIdWithMultipleRow(taxpayer_id);
    const additionalPerson = await additionalPersonsCrud.readById(taxpayer_id);
  
    res.render("treasurer/viewTaxPayerProfile", {
      taxPayer,
      properties,
      additionalPerson,
      session
    });
  } catch (error) {
    // Handle errors and send a response with the error message
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}



async function insertPayment(req,res) {

    try {


      const {
        firstname,
        lastname,
        taxpayer_id,
        tax_rate,
        property_type,
        due_date,
        assessment_level,
        assessed_value,
        classification,
        area_size,
        property_use,
        market_value,
        total_tax_amount,
        cash_tendered,
        change,
        status,
        id,           // invoice id
        property_id,  
        email_status
      } = req.body;
      

      const formattedDate_due_date = new Date(due_date)
      .toISOString()
      .split("T")[0]; // YYYY-MM-DD
      

      

      await paymentCrud.create({
        taxpayer_id,
        firstname,
        lastname,
        cash_tendered,
        change,
        total_tax_amount
      });

      await invoiceCrudForTreasurer.update(id, { status, email_notification_status:email_status });


      //after inserting payment history,  insert statement of account to track taxpayers account transactions
      await statementOfAccountCrud.create({
        id,
        taxpayer_id,
        firstname,
        lastname,
        area_size,
        classification,
        property_use,
        property_type,
        assessment_level,
        market_value,
        tax_rate,
        assessed_value,
        total_tax_amount,
        due_date: formattedDate_due_date,
        status,
        property_id  
      });


      res.redirect('/invoice');
    } catch (error) {
      res.status(500).json({
        message: `Error: ${error.message}`,
      });
    }
} 


// Read all payment history
async function readPaymentHistory(req, res) {
  try {

    const session = req.user;

    const paymentHistory = await paymentCrud.readAll();

    res.render('treasurer/paymentHistory', {paymentHistory, session});
    console.log(paymentHistory);
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


//Read all tax payers (from tax payers table only)
async function readTaxPayersForTreasurer(req, res) {
  try {

    const session = req.user;

    const taxPayers = await taxPayersCrudForTreasurer.readNumberOfPropertiesPerTaxpayers();
    console.log(taxPayers)
    res.render("treasurer/userManagement", { taxPayers, session });
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


//Read all tax payer information by id (from taxpayers, additional person, and properties table)
async function readTaxPayerProfileForTreasurer(req, res) {
  try {

    const session = req.user;

    const id = parseInt(req.body.taxpayer_id, 10);
    const taxPayer = await taxPayersCrud.readById(id);
    const properties = await propertyInfoCrud.readByIdWithMultipleRow(id);
    const additionalPerson = await additionalPersonsCrud.readById(id);


    const statementOfAccounts = await statementOfAccountCrud.readByIdWithMultipleRow(id);   //read statement of account of a single tax payer
    console.log(statementOfAccounts)
    res.render("treasurer/viewTaxPayerProfile", {
      taxPayer,
      properties,
      additionalPerson,
      statementOfAccounts,
      session
    });
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


async function readInvoice(req, res) {

  try {

    const session = req.user;

    const invoice = await invoiceCrudForTreasurer.readAll({status:'pending'});
  
    res.render('treasurer/invoice', {session, invoice});
    
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}





export {

  // for assessor
  createTaxPayer,
  readTaxPayers,
  readTaxPayerProfile,
  updateTaxPayerProfile,
  editTaxPayerProfile,
  deleteTaxPayer,
  createFiles,
  deleteFile,
  addProperty,
  deleteProperty,
  updateProperty,

 
// for authenticated Taxpayer

  readTaxPayerProfileByEmail,
  readTaxPayerPropertyByEmail,
  readTaxPayerDocumentsByEmail,
  readInvoiceForAuthenticatedTaxpayer,
  readPaymentHistoryById,
  downloadFile,


  //for treasurer
    treasurerDashboard,
    readTaxPayersForTreasurer,
    readTaxPayerProfileForTreasurer,
    insertInvoice,
    readInvoice,
    insertPayment,
    readPaymentHistory

};
