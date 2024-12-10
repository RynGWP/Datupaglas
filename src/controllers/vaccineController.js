import { ensureAuthenticated } from '../middleware/authMiddleware.js';
import {  addCustomVaccine,
          allAdditionalVaccines,
          updateVaccines,
          deleteVaccines
       } from '../models/vaccineModel.js';

import {getAdminById} from '../models/adminModel.js';

//create additional vaccine
async function addCustomVaccinesForPatients(req, res) {


    // Ensure admin is authenticated
    const adminId =  req.session.adminSession?.adminId;

    if (!adminId) {
      return res.status(401).send("Unauthorized");
    }
  
   
    
    let {
      vaccineName,
       minimumAge,
       doseInterval,
       doses
    } = req.body;
  
    let minAgeMonths = minimumAge * 12;
  
    try {
      const success = addCustomVaccine(vaccineName, minAgeMonths, doseInterval, doses);
      res.json({success:true });

 
    } catch (error) {
      console.error("Error adding vaccines", error.stack);
      res.status(500).send("Error adding vaccines");
    }
  }



  //read vaccines
  async function fetchAllVaccines(req, res) {
         
    // Ensure admin is authenticated
    const adminId =  req.session.adminSession?.adminId;

    const authenticatedUser = await getAdminById(adminId);
  
    if (!adminId) {
      return res.status(401).send("Unauthorized");
    }
  
    try {
        const result = await allAdditionalVaccines();
        console.log('rows: ', result);
        res.render('admin/createVaccines', {vaccines: result, authenticatedUser});
    } catch (error) {
        console.error("Error fetching vaccines", error.stack);
        res.status(500).send("Error fetching vaccines");
      }
  }


 // Update vaccines function
async function updateVaccineData(req, res) {

  // Ensure admin is authenticated
  const adminId = req.session.adminSession?.adminId;

  if (!adminId) {
    return res.status(401).send("Unauthorized");
  }

  try {
    let { vaccineId,
          vaccineName,
          minimumAge,
          doseInterval,
          doses
        } = req.body;

    // Convert minimumAge to months
    const minAgeMonths = minimumAge * 12;

    // Call the update function
    const update = await updateVaccines(vaccineId, vaccineName, minAgeMonths, doses, doseInterval);

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating vaccines", error.stack);
    res.status(500).send("Error updating vaccines");
  }
}


async function destroyVaccines(req, res) {
  // Ensure admin is authenticated
  const adminId = req.session.adminSession?.adminId;

  if (!adminId) {
    return res.status(401).send("Unauthorized");
  }

  const id = req.params.id;
  try {
    await deleteVaccines(id);
    res.json({success:true});
  } catch (error) {
    console.error("Error deleting vaccines", error.stack);
    res.status(500).send("Error deleting vaccines");
  }
}
  

export {
    addCustomVaccinesForPatients,
    fetchAllVaccines,
    updateVaccineData,
    destroyVaccines
};