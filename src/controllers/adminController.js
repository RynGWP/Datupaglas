import {
    fetchMonthlyReportsToAdmin,
    fetchTotalFullyImmunizeChild,
    fetchTotalMaleFullyImmunizeChild,
    fetchTotalFemaleFullyImmunizeChild,
    FethTotalEligiblePopulation,
    fetchMonthlyFICData,



    fetchTotalCompletelyImmunizeChild,
    fetchTotalMaleCompletelyImmunizeChild,
    fetchTotalFemaleCompletelyImmunizeChild,
    fetchMonthlyCICData
} from '../models/adminModel.js'

import { getAdminById } from "../models/adminModel.js";


//Fetch monthly reports to admin page 
async function fetchMonthlyReportsToAdminPage(req, res) {

  const adminId =  req.session.adminSession.adminId;

  const authenticatedUser = await getAdminById(adminId);

    try {
      const month = req.query.month || new Date().getMonth() + 1;
      const year = req.query.year || new Date().getFullYear();
  
      // Generate months array
      const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
      ];
  
      // Generate years array
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
      // Fetch reports
      const reports = await fetchMonthlyReportsToAdmin(month, year);
      console.log('Reports fetched:', reports);
  
      // Render with explicit data passing
      res.render('admin/reports', {
        authenticatedUser,
        reports: reports || [], // Ensure reports is always an array
        months: months,
        years: years,
        selectedMonth: parseInt(month),
        selectedYear: parseInt(year)
      });
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error generating report');
    }
  }



  //function to get total fully immunize child  (fetched to Graph)
  async function getTotalFICandCIC(req,res) {

    const adminId =  req.session.adminSession?.adminId;

    if (!adminId) {
      return res.status(401).send("Unauthorized");
    }

    const authenticatedUser = await getAdminById(adminId);
    console.log(authenticatedUser)
    try {
      //FIC
    const totalFIC =  await fetchTotalFullyImmunizeChild();
    const totalFicMale = await fetchTotalMaleFullyImmunizeChild();
    const totalFicFemale =  await fetchTotalFemaleFullyImmunizeChild();
    

    const totalCIC =  await fetchTotalCompletelyImmunizeChild();
    const totalCicMale = await fetchTotalMaleCompletelyImmunizeChild();
    const totalCicFemale =  await fetchTotalFemaleCompletelyImmunizeChild();
    

    //FOR GRAPH
    const monthlyFICData = await fetchMonthlyFICData();
    const monthlyCICData = await fetchMonthlyCICData();
      

    const totalEligiblePopulation =  await FethTotalEligiblePopulation();
    

    res.render('admin/adminDashboard' , 
      
      {

       authenticatedUser,
       totalFIC,
       totalFicMale,
       totalFicFemale,
       totalFIC,

       totalCIC,
       totalCicMale,
       totalCicFemale,
       totalEligiblePopulation,



       //graph
       monthlyFICData, // Pass the monthly data to the view
       monthlyCICData // Pass the monthly data to the view

    });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error fetching total FIC');
    }
  }
// FULLY IMMUNIZED SECTION


  export {
    fetchMonthlyReportsToAdminPage,
    getTotalFICandCIC
  }