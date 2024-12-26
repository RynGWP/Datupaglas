
import { CRUD } from "../models/crud.js";

// Initialize CRUD instances for each table
const taxPayersCrud = new CRUD("taxpayers", "taxpayer_id");
const additionalPersonsCrud = new CRUD("additional_persons", "taxpayer_id");
const propertyInfoCrud = new CRUD("properties", "taxpayer_id");
const fileCrud = new CRUD("files", "id");

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
      assessedValue,
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

    await propertyInfoCrud.create({
      taxpayer_id: newTaxPayer.taxpayer_id, // Foreign key reference
      property_type: propertyType,
      assessed_value: assessedValue,
      area_size: areaSize,
      tax_rate: taxRate,
      ownership_type: ownershipType,
      property_use: propertyUse,
      classification,
      occupancy_status: occupancyStatus,
      last_assessment_date: formattedDate_lastAssessmentDate,
      next_assessment_date: formattedDate_nextAssessmentDate,
      property_location: property_location,
    });

    res.redirect("/taxPayer");
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


//create files
async function createFiles(req,res) {
  try {
    if(!req.file){
      return res.status(400).send('No file uploaded');
    }
    const taxpayer_id = req.body.taxpayer_id;
    const {
            originalname,
            buffer,
            mimetype
    } = req.file;

     await fileCrud.create({
      taxpayer_id,
      filename: originalname,
      data: buffer,
      mimetype: mimetype}
    );
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
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

//Read all tax payer information by id (from taxpayers, additional person, and properties table)
async function readTaxPayerProfile(req, res) {
  try {

    const session = req.user;

    const id = parseInt(req.body.taxpayer_id, 10);
    const taxPayer = await taxPayersCrud.readById(id);
    const properties = await propertyInfoCrud.readById(id);
    const additionalPerson = await additionalPersonsCrud.readById(id);

    res.render("admin/taxPayerProfile", {
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
      propertyType,
      assessedValue,
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

    // Validate and format dates
    const formatDate = (date) => {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) return null;
      return parsedDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
  };

    const formattedDateOfBirth = formatDate(date_of_birth);
    const formattedNextAssessmentDate = formatDate(nextAssessmentDate);
    const formattedLastAssessmentDate = formatDate(lastAssessmentDate);

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

    // Update property info
    await propertyInfoCrud.update(id, {
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


// ************************************************** /FOR ASSESSOR ******************************************************






// ************************************************** FOR AUTHENTICATED TAXPAYERS ****************************************************
//for authenticated taxpayers
const taxPayersCrudForAuthenticatedTaxPayer = new CRUD("taxpayers", "email");
const additionalPersonsCrudForAuthenticatedTaxPayer = new CRUD("additional_persons", "taxpayer_id");
const propertyInfoCrudForAuthenticatedTaxPayer = new CRUD("properties", "taxpayer_id");
const paymentCrudForAuthenticatedTaxPayer =  new CRUD('payment_history', 'taxpayer_id');

async function readTaxPayerDashboardByEmail(req, res) {
  try {

    // Check if user exists
    if (!req.user) {
      return res.status(401).json({ 
        message: 'User not authenticated' 
      });
    }

    const session = req.user;
   
    res.render('taxPayer/dashboard', {
     session
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


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
    

    const properties = await propertyInfoCrudForAuthenticatedTaxPayer.readById(session.taxpayer_id);
  
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

    const documents = await taxPayersCrudForAuthenticatedTaxPayer.readByEmail(session.email);
  
    res.render('taxPayer/documents' , {
      session,
      documents,
    });

  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}


// read statement  of account for authenticated taxpayer
async function readStatementOfAccountForAuthenticatedTaxpayer(req, res) {

  try {

    const session = req.user;
    
    const statementOfAccount = await statementOfAccountCrud.readById(session.taxpayer_id);

    res.render('taxPayer/dashboard', {session, statementOfAccount});
    
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
  
    const paymentHistory = await paymentCrudForAuthenticatedTaxPayer.readById(session.taxpayer_id);

    res.render('taxPayer/paymentHistoryForTaxPayer', { paymentHistory, session });
  } catch (error) {
    res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}

// ***************************************************FOR AUTHENTICATED TAXPAYER*************************/



//*******************************************************FOR TREASURER *********************************/
//for authenticated treasurer
const taxPayersCrudForTreasurer = new CRUD("taxpayers t JOIN properties p ON t.taxpayer_id = p.taxpayer_id", "email");
const additionalPersonsCrudForTreasurer = new CRUD("additional_persons", "taxpayer_id");
const propertyInfoCrudForTreasurer = new CRUD("properties", "taxpayer_id");
const statementOfAccountCrud = new CRUD('statement_of_account', 'taxpayer_id');
const paymentCrud = new CRUD('payment_history', 'taxpayer_id');

async function insertStatementOfAccount(req, res) {
  try {
    const session = req.user;

    await statementOfAccountCrud.create(req.body);

    res.redirect("/statementOfAccount");
  } catch (error) {
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
        total_tax_amount,
        cash_tendered,
        change,
        status
      } = req.body;
      

      await paymentCrud.create({
        taxpayer_id,
        firstname,
        lastname,
        cash_tendered,
        change,
        total_tax_amount
      });

      await statementOfAccountCrud.update(taxpayer_id, { status });
       
      res.redirect('/statementOfAccount');
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

    const taxPayers = await taxPayersCrudForTreasurer.readAll();
    
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
    const properties = await propertyInfoCrud.readById(id);
    const additionalPerson = await additionalPersonsCrud.readById(id);

    res.render("treasurer/viewTaxPayerProfile", {
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


async function readStatementOfAccount(req, res) {

  try {

    const session = req.user;

    const statementOfAccounts = await statementOfAccountCrud.readAll({status: 'pending'});

    res.render('treasurer/statementOfAccount', {session, statementOfAccounts});
    
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



// for authenticated Taxpayer
  readTaxPayerDashboardByEmail,
  readTaxPayerProfileByEmail,
  readTaxPayerPropertyByEmail,
  readTaxPayerDocumentsByEmail,
  readStatementOfAccountForAuthenticatedTaxpayer,
  readPaymentHistoryById,


  //for treasurer
    readTaxPayersForTreasurer,
    readTaxPayerProfileForTreasurer,
    insertStatementOfAccount,
    readStatementOfAccount,
    insertPayment,
    readPaymentHistory
};
