// Form Validation Script for Datu Paglas Municipality Registration Form

document.addEventListener('DOMContentLoaded', function() {
    // Form and stepper initialization
    const form = document.getElementById('addUserForm');
    const stepper = document.querySelector('.bs-stepper');
    const nextButtons = document.querySelectorAll('.btn-primary.next');
    const prevButtons = document.querySelectorAll('.btn-secondary.previous');
    const finishButton = document.querySelector('.btn-success.finish');

    // Validation patterns with more robust regex
    const patterns = {
        firstName: /^[A-Za-zÀ-ÿ\s'-]{2,50}$/,  // Allow accented characters, apostrophes, hyphens
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        phone: /^(09|\+639)\d{9}$/,
        text: /^[A-Za-zÀ-ÿ\s,.-]{2,100}$/,
        positiveNumeric: /^\d+(\.\d{1,2})?$/,
        percentageRate: /^(100(\.0{1,2})?|[0-9]{1,2}(\.\d{1,2})?)%?$/,
        alphanumericText: /^[A-Za-z0-9\s,.-]{2,100}$/
    };

    // Step Validation Functions
    const validateStep1 = () => {
        const fields = [
            { id: 'firstname', pattern: patterns.firstName, errorMsg: 'Invalid first name (2-50 letters, spaces allowed)' },
            { id: 'middlename', pattern: patterns.firstName, errorMsg: 'Invalid middle name (2-50 letters, spaces allowed)' },
            { id: 'lastname', pattern: patterns.firstName, errorMsg: 'Invalid last name (2-50 letters, spaces allowed)' },
            { id: 'email', pattern: patterns.email, errorMsg: 'Invalid email address' },
            { id: 'phone', pattern: patterns.phone, errorMsg: 'Invalid phone number (09XXXXXXXXX or +639XXXXXXXXX)' },
            { id: 'place_of_birth', pattern: patterns.text, errorMsg: 'Invalid place of birth' },
            { id: 'completeAddress', pattern: patterns.text, errorMsg: 'Invalid complete address' }
        ];

        let isValid = true;

        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const value = input.value.trim();

            // Check if field is required and empty
            if (!value) {
                showError(input, 'This field is required');
                isValid = false;
                return;
            }

            // Validate against pattern if exists
            if (field.pattern && !field.pattern.test(value)) {
                showError(input, field.errorMsg);
                isValid = false;
            } else {
                clearError(input);
            }
        });

        // Additional specific validations
        const birthdayInput = document.querySelector('input[name="date_of_birth"]');
        if (!birthdayInput.value) {
            showError(birthdayInput, 'Date of Birth is required');
            isValid = false;
        }

        const statusSelect = document.getElementById('status');  // Note the capital S
        const genderSelect = document.getElementById('gender');

        if (statusSelect.value === '') {
            showError(statusSelect, 'Please select a status');
            isValid = false;
        }

        if (genderSelect.value === '') {
            showError(genderSelect, 'Please select a gender');
            isValid = false;
        }

        return isValid;
    };

    const validateStep2 = () => {
        const fields = [
            { id: 'additionalFirstname', pattern: patterns.firstName, errorMsg: 'Invalid first name (2-50 letters, spaces allowed)' },
            { id: 'additionalMiddlename', pattern: patterns.firstName, errorMsg: 'Invalid middle name (2-50 letters, spaces allowed)' },
            { id: 'additionalLastname', pattern: patterns.firstName, errorMsg: 'Invalid last name (2-50 letters, spaces allowed)' },
            { id: 'additionalEmail', pattern: patterns.email, errorMsg: 'Invalid email address' },
            { id: 'additionalPhone', pattern: patterns.phone, errorMsg: 'Phone number is not less than 11 digits' },
            { id: 'relationship', pattern: /^[A-Za-zÀ-ÿ\s'-]{2,50}$/, errorMsg: 'Invalid relationship description' },
            { id: 'additionalCompleteAddress', pattern: patterns.text, errorMsg: 'Invalid complete address' }
        ];

        let isValid = true;

        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const value = input.value.trim();

            // Check if field is required and empty
            if (!value) {
                showError(input, 'This field is required');
                isValid = false;
                return;
            }

            // Validate against pattern if exists
            if (field.pattern && !field.pattern.test(value)) {
                showError(input, field.errorMsg);
                isValid = false;
            } else {
                clearError(input);
            }
        });

        return isValid;
    };

    const validateStep3 = () => {
        const fields = [
            { 
                id: 'propertyType', 
                type: 'select', 
                errorMsg: 'Please select a property type',
                validate: value => value !== ''
            },
            { 
                id: 'marketValue', 
                pattern: patterns.positiveNumeric, 
                errorMsg: 'Invalid market value (must be a positive number)',
                label: 'Market Value'
            },
            { 
                id: 'areaSize', 
                pattern: patterns.positiveNumeric, 
                errorMsg: 'Invalid area size (must be a positive number)', 
                label: 'Area Size'
            },
            { 
                id: 'taxRate', 
                pattern: patterns.percentageRate, 
                errorMsg: 'Invalid tax rate (0-100%)', 
                label: 'Tax Rate'
            },
            { 
                id: 'ownershipType', 
                pattern: /^[A-Za-zÀ-ÿ\s'-]{2,50}$/, 
                errorMsg: 'Invalid ownership type (2-50 letters)',
                label: 'Ownership Type'
            },
            { 
                id: 'propertyUse', 
                pattern: patterns.alphanumericText, 
                errorMsg: 'Invalid property use description',
                label: 'Property Use'
            },
            { 
                id: 'classification', 
                pattern: /^[A-Za-zÀ-ÿ\s'-]{2,50}$/, 
                errorMsg: 'Invalid classification (2-50 letters)',
                label: 'Classification'
            },
            { 
                id: 'occupancyStatus', 
                pattern: /^[A-Za-zÀ-ÿ\s'-]{2,50}$/, 
                errorMsg: 'Invalid occupancy status (2-50 letters)',
                label: 'Occupancy Status'
            },
            { 
                id: 'property_location', 
                pattern: patterns.text, 
                errorMsg: 'Invalid Property Location ',
                label: 'Property Location'
            }
        ];
    
        let isValid = true;
    
        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const value = input.value.trim();
    
            // Check if field is required and empty
            if (!value) {
                showError(input, 'This field is required');
                isValid = false;
                return;
            }
    
            // Validate against pattern or select validation
            if (field.type === 'select') {
                if (value === '') {
                    showError(input, field.errorMsg);
                    isValid = false;
                }
            } else if (field.pattern && !field.pattern.test(value)) {
                showError(input, field.errorMsg);
                isValid = false;
            } else {
                clearError(input);
            }
        });
    
        // Date validation for assessment dates
        const lastAssessmentDate = document.querySelector('input[name="lastAssessmentDate"]');
        const nextAssessmentDate = document.querySelector('input[name="nextAssessmentDate"]');
    
        if (!lastAssessmentDate.value) {
            showError(lastAssessmentDate, 'Last Assessment Date is required');
            isValid = false;
        }
    
        if (!nextAssessmentDate.value) {
            showError(nextAssessmentDate, 'Next Assessment Date is required');
            isValid = false;
        }
    
        // Date comparison validation
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

    // Error Handling Functions
    const showError = (input, message) => {
        // Remove any existing error
        clearError(input);

        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback text-danger';
        errorDiv.textContent = message;

        // Add error styling to input
        input.classList.add('is-invalid');
        input.parentNode.appendChild(errorDiv);
    };

    const clearError = (input) => {
        input.classList.remove('is-invalid');
        const errorFeedback = input.parentNode.querySelector('.invalid-feedback');
        if (errorFeedback) {
            errorFeedback.remove();
        }
    };

    // Event Listeners for Next Buttons
    nextButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            let isStepValid = false;

            switch(index) {
                case 0: // First step validation
                    isStepValid = validateStep1();
                    break;
                case 1: // Second step validation
                    isStepValid = validateStep2();
                    break;
            }

            if (isStepValid) {
                // Use bs-stepper's next method
                stepper.querySelector(`#step${index + 2}-trigger`).click();
            }
        });
    });

    // Event Listeners for Previous Buttons
    prevButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Use bs-stepper's previous method
            stepper.querySelector(`#step${index + 1}-trigger`).click();
        });
    });

    // Final Form Submission Validation
    finishButton.addEventListener('click', function(e) {
        e.preventDefault();

        // Validate all steps
        const step1Valid = validateStep1();
        const step2Valid = validateStep2();
        const step3Valid = validateStep3();

        if (step1Valid && step2Valid && step3Valid) {
            // Set a flag in sessionStorage to show the toast after reload
            sessionStorage.setItem('showToastRegister', 'true');
            form.submit(); // Submit the form
        }
        
          else {
            const firstError = document.querySelector('.is-invalid');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
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

