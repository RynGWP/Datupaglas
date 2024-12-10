function getNextWednesday(date) {
    const resultDate = new Date(date);
    let daysUntilWednesday = (3 - date.getDay() + 7) % 7;
    if (daysUntilWednesday === 0) daysUntilWednesday = 7;
    resultDate.setDate(date.getDate() + daysUntilWednesday);
    return resultDate;
  }
  
  function convertDateFormat(dateStr) {
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }


  function calculateAgeInMonths(birthday, registrationDate) {
    const birthDate = new Date(birthday);
    const regDate = new Date(registrationDate);
    const ageInMonths = (regDate.getFullYear() - birthDate.getFullYear()) * 12 + (regDate.getMonth() - birthDate.getMonth());
    return ageInMonths;
  }
  

  export { getNextWednesday,
           convertDateFormat,
           calculateAgeInMonths };