// Form Validation Script for Datu Paglas Municipality Registration Form

  document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.getElementById('addUserForm');
    const stepper = document.querySelector('.bs-stepper');
    const nextButtons = document.querySelectorAll('.btn-primary.next');
    const prevButtons = document.querySelectorAll('.btn-secondary.previous');
    const finishButton = document.querySelector('.btn-success.finish');

    // Property type and form elements
    const propertyTypeSelect = document.getElementById('propertyType');
    const agriMineralSection = document.getElementById('agriMineralSection');
    const commonForm = document.getElementById('commonForm');
    const transferRadio = document.getElementById("transfer");
    const ownerRadio = document.getElementById("owner");
    const transferFields = document.getElementById("transferFields");
    const landRadio = document.getElementById('land');
    const plantRadio = document.getElementById('plant');
    const landForm = document.getElementById('landForm');
    const plantForm = document.getElementById('plantForm');

    // Property assessment rates
    const propertyAssessmentRate = {
        Residential: '20',
        Commercial: '40',
        Agricultural: '50',
        Industrial: '50',
        Mineral: '50',
        Timberland: '20'
    };

    // Event Listeners for Form Display Logic
    propertyTypeSelect.addEventListener('change', function() {
        const propertyType = this.value;
        
        // Update assessment rate
        const assessmentRate = propertyAssessmentRate[propertyType] || '';
        document.getElementById('assessmentRate').value = assessmentRate;

        // Toggle agricultural/mineral section
        if (propertyType === 'Agricultural' || propertyType === 'Mineral') {
            agriMineralSection.style.display = 'block';
        } else {
            agriMineralSection.style.display = 'none';
        }

        // Toggle common form
        if (['Residential', 'Commercial', 'Industrial', 'Timberland'].includes(propertyType)) {
            commonForm.style.display = 'block';
        } else {
            commonForm.style.display = 'none';
        }
    });

    // Transfer fields toggle
    transferRadio.addEventListener("change", function() {
        transferFields.style.display = transferRadio.checked ? "block" : "none";
    });

    ownerRadio.addEventListener("change", function() {
        transferFields.style.display = "none";
    });

    // Agricultural/Mineral form toggle
    function toggleForms() {
        landForm.style.display = landRadio.checked ? 'block' : 'none';
        plantForm.style.display = plantRadio.checked ? 'block' : 'none';
    }

    landRadio.addEventListener('click', toggleForms);
    plantRadio.addEventListener('click', toggleForms);

    // Validation patterns
    const patterns = {
        firstName: /^[A-Za-zÀ-ÿ\s'-]{2,50}$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        phone: /^(09|\+639)\d{9}$/,
        text: /^[A-Za-zÀ-ÿ\s,.-]{2,100}$/,
        positiveNumeric: /^\d+(\.\d{1,2})?$/,
        alphanumeric: /^[A-Za-z0-9\s-]{1,50}$/
    };

    // Validation utility functions
    function showError(input, message) {
        clearError(input);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback text-danger';
        errorDiv.textContent = message;
        input.classList.add('is-invalid');
        input.parentNode.appendChild(errorDiv);
    }

    function clearError(input) {
        input.classList.remove('is-invalid');
        const errorFeedback = input.parentNode.querySelector('.invalid-feedback');
        if (errorFeedback) {
            errorFeedback.remove();
        }
    }

    function validateRequired(input, message = 'This field is required') {
        if (!input.value.trim()) {
            showError(input, message);
            return false;
        }
        clearError(input);
        return true;
    }

 // Step 1 Validation
 const validateStep1 = () => {
        let isValid = true;

        // Validate ownership type radio
        const ownershipRadios = document.querySelectorAll('input[name="ownership_type"]');
        const isOwnershipSelected = Array.from(ownershipRadios).some(radio => radio.checked);
        if (!isOwnershipSelected) {
            showError(ownershipRadios[0], 'Please select ownership type');
            isValid = false;
        }

        // Validate transfer fields if transfer is selected
        if (document.getElementById('transfer').checked) {
            const transferFields = ['trans_firstname', 'trans_lastname', 'trans_address'];
            transferFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!validateRequired(field)) {
                    isValid = false;
                }
            });
        }

        // Basic information validation
        const requiredFields = [
            'firstname', 'lastname', 'middlename', 'email', 'phone',
            'place_of_birth', 'completeAddress'
        ];

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!validateRequired(field)) {
                isValid = false;
            } else {
                // Pattern validation for specific fields
                if (fieldId === 'email' && !patterns.email.test(field.value)) {
                    showError(field, 'Invalid email format');
                    isValid = false;
                }
                if (fieldId === 'phone' && !patterns.phone.test(field.value)) {
                    showError(field, 'Phone number must be 11 digits starting with 09');
                    isValid = false;
                }
            }
        });

        // Validate select fields
        ['status', 'gender'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field.value === "") {
                showError(field, `Please select a ${fieldId}`);
                isValid = false;
            }
        });

        // Validate date of birth
        const dobInput = document.querySelector('input[name="date_of_birth"]');
        if (!validateRequired(dobInput, 'Date of Birth is required')) {
            isValid = false;
        }

        return isValid;
    };

    // Step 2 Validation
    const validateStep2 = () => {
        let isValid = true;

        const step2Fields = [
            'additionalFirstname', 'additionalMiddlename', 'additionalLastname',
            'additionalEmail', 'additionalPhone', 'relationship', 'additionalCompleteAddress'
        ];

        step2Fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!validateRequired(field)) {
                isValid = false;
            } else {
                if (fieldId === 'additionalEmail' && !patterns.email.test(field.value)) {
                    showError(field, 'Invalid email format');
                    isValid = false;
                }
                if (fieldId === 'additionalPhone' && !patterns.phone.test(field.value)) {
                    showError(field, 'Phone number must be 11 digits starting with 09');
                    isValid = false;
                }
            }
        });

        return isValid;
    };

    // Step 3 Validation
    const validateStep3 = () => {
        let isValid = true;

        // Validate property identification fields
        const propertyIdFields = [
            'taxDeclaration', 'propertyIndex', 'certificateTitle',
            'cadastralLot', 'lotNo', 'blockNo'
        ];

        propertyIdFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!validateRequired(field)) {
                isValid = false;
            }
        });

        // Validate property type selection
        const propertyType = document.getElementById('propertyType');
        if (!validateRequired(propertyType, 'Please select a property type')) {
            isValid = false;
        }

        // Validate based on property type
        if (propertyType.value === 'Agricultural' || propertyType.value === 'Mineral') {
            const agriMineralRadios = document.querySelectorAll('input[name="agriMineralSection"]');
            const isAgriMineralSelected = Array.from(agriMineralRadios).some(radio => radio.checked);
            if (!isAgriMineralSelected) {
                showError(agriMineralRadios[0], 'Please select a type');
                isValid = false;
            }

            // Validate specific fields based on selection
            if (document.getElementById('land').checked) {
                ['kindAgri', 'areaAgri', 'classAgri', 'unitValue'].forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (!validateRequired(field)) {
                        isValid = false;
                    }
                });
            } else if (document.getElementById('plant').checked) {
                ['kindPlant', 'noArea', 'unitPlant'].forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (!validateRequired(field)) {
                        isValid = false;
                    }
                });
            }
        } else if (['Residential', 'Commercial', 'Industrial'].includes(propertyType.value)) {
            ['kindCom', 'areaCom', 'unitCom', 'adjustment'].forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!validateRequired(field)) {
                    isValid = false;
                }
            });
        }

        // Validate common property fields
        const commonFields = [
            'marketValue', 'assessmentRate', 
            'propertyUse', 'classification', 'occupancyStatus',
            'property_location', 'north', 'south', 'east', 'west'
        ];

        commonFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!validateRequired(field)) {
                isValid = false;
            }
        });

        // Validate assessment dates
        const lastAssessmentDate = document.querySelector('input[name="lastAssessmentDate"]');
        const nextAssessmentDate = document.querySelector('input[name="nextAssessmentDate"]');

        if (!validateRequired(lastAssessmentDate, 'Last Assessment Date is required') ||
            !validateRequired(nextAssessmentDate, 'Next Assessment Date is required')) {
            isValid = false;
        }

        // Validate date order if both dates are present
        if (lastAssessmentDate.value && nextAssessmentDate.value) {
            const lastDate = new Date(lastAssessmentDate.value);
            const nextDate = new Date(nextAssessmentDate.value);
            if (nextDate <= lastDate) {
                showError(nextAssessmentDate, 'Next Assessment Date must be after Last Assessment Date');
                isValid = false;
            }
        }

        return isValid;
    };

    // Navigation event listeners
    nextButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            let isStepValid = false;

            switch(index) {
                case 0:
                    isStepValid = validateStep1();
                    break;
                case 1:
                    isStepValid = validateStep2();
                    break;
            }

            if (isStepValid) {
                stepper.querySelector(`#step${index + 2}-trigger`).click();
            }
        });
    });

    prevButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            stepper.querySelector(`#step${index + 1}-trigger`).click();
        });
    });

    // Form submission handling
    function handleFormSubmission(e) {
        e.preventDefault();
        
        // Validate all steps
        const step1Valid = validateStep1();
        const step2Valid = validateStep2();
        const step3Valid = validateStep3();

        if (step1Valid && step2Valid && step3Valid) {
            // Show loading state
            if (window.Swal) {
                Swal.fire({
                    title: 'Processing...',
                    text: 'Please wait while we submit your form.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }

            // Set success flag
            sessionStorage.setItem('showToastRegister', 'true');
            
            // Submit the form
            form.submit();
        } else {
            // Focus on first error
            const firstError = document.querySelector('.is-invalid');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Show error message
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please check all required fields and try again.',
                });
            }
        }
    }

    // Attach submission handlers
    form.addEventListener('submit', handleFormSubmission);
    finishButton.addEventListener('click', function(e) {
        e.preventDefault();
        handleFormSubmission(e);
    });
});




document.addEventListener('DOMContentLoaded', function() {

// Check if the toast flag is set
if (sessionStorage.getItem('showToastRegister') === 'true') {
    // Show the Toastify notification
    Toastify({
        text: "Registered successfully!",
        duration: 5000, // Show the toast for 3 seconds
        close: true,
        gravity: "top", // Toast position
        position: "right", // Toast alignment
        progressBar: true, // Enable progress bar
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();

    // Remove the flag from sessionStorage to prevent showing it again
    sessionStorage.removeItem('showToastRegister');


    // for delete toast
} else if (sessionStorage.getItem('showToastDelete') === 'true') {
    // Show the Toastify notification
    Toastify({
        text: "Deleted successfully!",
        duration: 5000, // Show the toast for 3 seconds
        close: true,
        gravity: "top", // Toast position
        position: "right", // Toast alignment
        progressBar: true, // Enable progress bar
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();

    // Remove the flag from sessionStorage to prevent showing it again
    sessionStorage.removeItem('showToastDelete');
}



    // Select all delete buttons
    const deleteButtons = document.querySelectorAll('.deleteTaxPayer');
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the form associated with this button
        const form = this.closest('form');
        
        // Use SweetAlert2 for confirmation
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes',
          customClass: {
            popup: "glassmorphism-popup",
          }
        }).then((result) => {
          if (result.isConfirmed) {
            // Submit the form if confirmed
            form.submit();

            sessionStorage.setItem('showToastDelete', 'true');
          }
        });
      });
    });
  });

