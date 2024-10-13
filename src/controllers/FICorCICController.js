import {
    insertFullyImmunized,
    insertCompletelyImmunized,
    getBirthdayAndLastVaccineDate
} from '../models/FICorCICModel.js';

// Update vaccination status and check if the patient should be fully or completely immunized
async function FICorCIC(req, res) {
    const { patientId, gender, barangay } = req.body;
  

    console.log('FROM REQUEST BODY', gender);
    try {

      // Get the registration and last vaccination date
      const { patientBirthday, last_vaccination_date } = await getBirthdayAndLastVaccineDate(patientId);
      const birthday = new Date(patientBirthday);    
      const lastVaccineDate = new Date(last_vaccination_date);
  
      // Calculate the difference between registration and last vaccine date  
      const oneDay = (1000 * 60 * 60 * 24);
      const diffInMs = lastVaccineDate - birthday;
      const diffInDays = diffInMs / oneDay; // Convert milliseconds to days
  
      const oneYearAnd28Days = 365 + 28;  
  
      // If the last vaccine date is less than 1 year and 28 days from the birthday
      if (diffInDays <= oneYearAnd28Days) {
        await insertFullyImmunized(patientId, date, remarks, barangay, gender);
        return res.status(200).json({ message: 'Patient fully immunized.' });
      } else {
        await insertCompletelyImmunized(patientId, date, remarks, barangay, gender);
        return res.status(200).json({ message: 'Patient completely immunized.' });
      }
  
    } catch (error) {
      console.error('Error processing immunization status:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }

  export {
    FICorCIC
  };