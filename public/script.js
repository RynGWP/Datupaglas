//-------------------LOGIN BUTTON LOADING ANIMATION-----------------------------
const CONFIG = {
  sounds: {
    success: '/sounds/sound5.wav',
    error: '/sounds/sound3.wav'
  },
  animations: {
    duration: 1000,
    loginDelay: 1500
  },
  endpoints: {
    login: '/login'
  },
  buttonStates: {
    initial: 'LOGIN',
    loading: '<span class="spinner"></span> Logging in...',
    success: '<span class="check-icon"></span> Success!'
  }
};

// Cache DOM elements
const loginElements = {
  button: $('#login-button'),
  email: $('[name="email"]'),
  password: $('[name="password"]')
};

// Sound handler with preloading
class SoundManager {
  constructor() {
    this.sounds = {};
    this.preloadSounds();
  }

  preloadSounds() {
    Object.entries(CONFIG.sounds).forEach(([key, path]) => {
      this.sounds[key] = new Audio(path);
      this.sounds[key].addEventListener('canplaythrough', () => {
        console.log(`Sound ${key} loaded`);
      });
    });
  }

  async play(soundType) {
    try {
      if (this.sounds[soundType]) {
        this.sounds[soundType].currentTime = 0;
        await this.sounds[soundType].play();
      }
    } catch (error) {
      console.warn(`Sound playback failed: ${error.message}`);
    }
  }
}

// Toast notification handler
const Toast = {
  success(message) {
    return Swal.fire({
      position: 'top-end',
      toast: true,
      icon: 'success',
      text: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'swal2-toast'
      }
    });
  },

  error(title, message) {
    return Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#0000FF',
      customClass: {
        popup: 'glassmorphism-popup'
      }
    });
  }
};

// Button state manager
class ButtonStateManager {
  constructor(button) {
    this.button = button;
    this.originalWidth = button.outerWidth();
  }

  setLoading() {
    this.button
      .css('min-width', this.originalWidth) // Prevent button width changes
      .html(CONFIG.buttonStates.loading)
      .addClass('loading')
      .prop('disabled', true);
  }

  setSuccess() {
    this.button
      .html(CONFIG.buttonStates.success)
      .removeClass('loading')
      .addClass('success');
  }

  reset() {
    this.button
      .html(CONFIG.buttonStates.initial)
      .removeClass('loading success')
      .prop('disabled', false);
  }
}

// Login form handler
class LoginHandler {
  constructor() {
    this.soundManager = new SoundManager();
    this.buttonManager = new ButtonStateManager(loginElements.button);
    this.setupEventListeners();
  }

  setupEventListeners() {
    loginElements.button.on('click', (e) => this.handleLogin(e));
  }

  validateFields() {
    return loginElements.email.val().trim() && 
           loginElements.password.val().trim();
  }

  async handleLogin(e) {
    e.preventDefault();

    if (!this.validateFields()) {
      this.buttonManager.setLoading();
      setTimeout(() => {
        this.buttonManager.reset();
        this.soundManager.play('error');
        Toast.error(
          'Login Error!',
          'Enter your email and password to login'
        );
      }, CONFIG.animations.duration);
      return;
    }

    try {
      this.buttonManager.setLoading();

      const response = await $.ajax({
        url: CONFIG.endpoints.login,
        method: 'POST',
        data: {
          email: loginElements.email.val().trim(),
          password: loginElements.password.val().trim()
        }
      });

      // Handle successful login
      await this.soundManager.play('success');
      this.buttonManager.setSuccess();
      await Toast.success('Logging in');
      
      setTimeout(() => {
        window.location.href = response.redirectUrl;
      }, CONFIG.animations.loginDelay);

    } catch (xhr) {
      this.buttonManager.reset();
      await this.soundManager.play('error');

      const errorMessage = xhr.status === 400
        ? xhr.responseJSON.message
        : 'Internal server error. Please try again later.';

      Toast.error('Login Error!', errorMessage);
    }
  }
}

// Initialize on document ready
$(document).ready(() => {
  const loginHandler = new LoginHandler();
});




//------------------REGISTRATION FORM VALIDATION && BUTTON ANIMATION------------------------
$(document).ready(function () {
  // Cache DOM elements
  const $form = $("#signUpForm");
  const $signupButton = $("#signup-button");
  const $signupSpan = $("#signup-span");
  
  // Validation patterns
  const validators = {
    letterPattern: /^[A-Za-z\s]+$/,
    emailPattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    contactPattern: /^09\d{9}$/,
    allowedDomains: new Set(["gmail.com", "yahoo.com", "outlook.com"]),
    passwordPattern: {
      minLength: 8,
      regex: {
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        digit: /\d/,
        specialChar: /[_!@#$%^&*(),.?":{}|<>]/,
        spaces: /\s/
      }
    }
  };

  // Cache form elements
  const formElements = {
    firstName: $form.find('[name="firstName"]'),
    lastName: $form.find('[name="lastName"]'),
    email: $form.find('[name="email"]'),
    contactNumber: $form.find('[name="contactNumber"]'),
    barangay: $form.find('[name="barangay"]'),
    password: $form.find('[name="password"]'),
    confirmPassword: $form.find('[name="confirm-password"]')
  };

  // Prevent default form submission
  $form.on('submit', function(e) {
    e.preventDefault();
  });

  function validateForm() {
    const errors = new Map();
    let isValid = true;

    // Clear previous validation states
    $form.find(".is-invalid, .is-valid").removeClass("is-invalid is-valid");
    $form.find(".invalid-feedback").remove();

    // Validate First Name
    if (!formElements.firstName.val().trim()) {
      errors.set(formElements.firstName, "First name is required.");
      isValid = false;
    } else if (!validators.letterPattern.test(formElements.firstName.val().trim())) {
      errors.set(formElements.firstName, "First name should contain only letters.");
      isValid = false;
    }

    // Validate Last Name
    if (!formElements.lastName.val().trim()) {
      errors.set(formElements.lastName, "Last name is required.");
      isValid = false;
    } else if (!validators.letterPattern.test(formElements.lastName.val().trim())) {
      errors.set(formElements.lastName, "Last name should contain only letters.");
      isValid = false;
    }

    // Validate Email
    const email = formElements.email.val().trim();
    const emailDomain = email.split("@")[1];
    
    if (!email) {
      errors.set(formElements.email, "Email is required.");
      isValid = false;
    } else if (!validators.emailPattern.test(email)) {
      errors.set(formElements.email, "A valid email is required.");
      isValid = false;
    } else if (!validators.allowedDomains.has(emailDomain)) {
      errors.set(formElements.email, "Email is incorrect.");
      isValid = false;
    }

    // Validate Contact Number
    if (!validators.contactPattern.test(formElements.contactNumber.val().trim())) {
      errors.set(formElements.contactNumber, 'Contact number must begin with "09" and consist of 11 digits.');
      isValid = false;
    }

    // Validate Barangay
    if (!formElements.barangay.val()) {
      errors.set(formElements.barangay, "Barangay is required.");
      isValid = false;
    }

    // Validate Password
    const password = formElements.password.val().trim();
    const confirmPassword = formElements.confirmPassword.val().trim();
    
    if (!validatePassword(password)) {
      errors.set(formElements.password, "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.");
      isValid = false;
      showError($('[name="confirm-password"]'), "Confirm password is required");
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.set(formElements.confirmPassword, "Password not matched.");
      isValid = false;
    }

    // Show errors efficiently
    errors.forEach((message, element) => {
      showError(element, message);
    });

    return isValid;
  }

  function validatePassword(password) {
    const { minLength, regex } = validators.passwordPattern;
    return password.length >= minLength &&
           regex.uppercase.test(password) &&
           regex.lowercase.test(password) &&
           regex.digit.test(password) &&
           regex.specialChar.test(password) &&
           !regex.spaces.test(password);
  }

  function showError(element, message) {
    $('label').css('display','none');
    element.addClass("is-invalid")
          .after($('<div class="invalid-feedback">').text(message));
  }

  // Optimized AJAX submission
  function submitForm() {
    return $.ajax({
      url: "/bhwRegistration",
      type: "POST",
      data: $form.serialize(),
      cache: false
    });
  }

  // Event handler for signup button
  $signupButton.on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) {
      return false;
    }

    $signupButton.prop('disabled', true);  // Disable button during submission
    
    submitForm()
      .done(function(response) {
        $signupButton.prop('disabled', false);  // Re-enable button
        
        if (response.success) {
          Swal.fire({
            title: "Account Created Successfully!",
            text: "Redirect to login page.",
            icon: "success",
            confirmButtonColor: "#00FF00",
            confirmButtonText: "Confirm",
            allowOutsideClick: false,
            showClass: {
              popup: 'animate__animated animate__fadeIn faster'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOut faster'
            },
            customClass: {
              popup: "glassmorphism-popup",
            }
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = "Login";
            }
          });
        } else {
          showErrorAlert(response.message);
        }
      })
      .fail(function() {
        $signupButton.prop('disabled', false);  // Re-enable button
        showErrorAlert("Email already Taken.");
      });
    
    return false;
  });

  function showErrorAlert(message) {
    Swal.fire({
      title: "Error!",
      text: message,
      icon: "error",
      confirmButtonText: "Try Again",
      confirmButtonColor: "#0000FF",
      allowOutsideClick: false,
      showClass: {
        popup: 'animate__animated animate__fadeIn faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut faster'
      }
    });
  }
});

// Optimize select handling
document.addEventListener('DOMContentLoaded', function() {
  const selects = document.querySelectorAll('.custom-select');
  
  selects.forEach(select => {
    select.addEventListener('change', function() {
      this.closest('.select-wrapper').classList.toggle('has-value', this.value);
    });
  });
});

// Lazy load Lottie animation
document.addEventListener('DOMContentLoaded', function() {
  const animationContainer = document.getElementById('lottie-animation');
  if (animationContainer) {
    loadLottieAnimation();
  }
});


// Function to attach the click event handler to approveButton
$(document).ready(function () {
  attachApproveButtonHandler(); // Initially attach event handlers

  function attachApproveButtonHandler() {
      $(".approveButton").off("click").on("click", function (e) {
          e.preventDefault(); // Prevent the form from submitting
          
          const $button = $(this);
          $button.prop("disabled", true); // Disable button to prevent double submission
          
          const patientId = $button.data('patient-id');
          const status = $button.data('status');

          $('#patientId').val(patientId);
          $('#status').val(status);

          const formData = {
              patientId: $("#patientId").val(),
              status: $("#status").val()
          };

          console.log('Form Data:', formData); // Log data for debugging

          Swal.fire({
              title: "Pending Approval!",
              text: "Do you want to Approve this Patient?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Yes",
              confirmButtonColor: "#12be12c1",
              cancelButtonText: "Cancel",
              cancelButtonColor: "#FF0000",
              customClass: {
                  popup: "glassmorphism-popup",
              },
          }).then((result) => {
              if (result.isConfirmed) {
                  $.ajax({
                      url: "/pendingPatients/update",
                      method: "POST",
                      data: formData,
                      success: function (response) {
                          if (response.success) {
                              Swal.fire({
                                  title: "Success!",
                                  text: "Patient Registration Completed",
                                  icon: "success",
                                  showConfirmButton: false,
                                  timer: 1500,
                                  customClass: {
                                      popup: "glassmorphism-popup",
                                  },
                              });

                              $("#patientsTable").load(location.href + " #patientsTable > *", function () {
                                  attachApproveButtonHandler(); // Re-attach handlers after reload
                              });
                          } else {
                              Swal.fire({
                                  title: "Error!",
                                  text: response.message,
                                  icon: "error",
                                  confirmButtonText: "OK",
                                  confirmButtonColor: "#0000FF",
                              });
                          }
                      },
                      error: function (xhr) {
                          Swal.fire({
                              title: "Error!",
                              text: "Failed to update vaccination status",
                              icon: "error",
                              confirmButtonText: "OK",
                          });
                      },
                      complete: function () {
                          $button.prop("disabled", false);
                      },
                  });
              } else {
                  $button.prop("disabled", false);
              }
          });
      });
  }
});


//---------------------VACCINATION SCHEDULE-------------------------
$(document).ready(function () {
  $(".done-button").on("click", function (e) {
    e.preventDefault();

    // Store button reference to re-enable later if needed
    const $button = $(this);
    $button.prop("disabled", true); // Disable button to prevent double submission

    // Get data attributes from the clicked button
    const patientId = $button.data('patient-id');
    const scheduleId = $button.data('schedule-id');
    const status = $button.data('status');
    const vaccineName = $button.data('vaccine-name');
    const dateAdministered = $button.data('schedule-date');
    const gender = $button.data('gender');
    const barangay = $button.data('barangay');

    // Set hidden input values
    $('#patientId').val(patientId);
    $('#scheduleId').val(scheduleId);
    $('#status').val(status);
    $('#vaccineName').val(vaccineName);
    $('#dateAdministered').val(dateAdministered);
    $('#gender').val(gender);
    $('#barangay').val(barangay);


    const formData = {
      patientId: $("#patientId").val(),
      scheduleId: $("#scheduleId").val(),
      status: $("#status").val(), // Send status as "Taken"
      vaccineName: $('#vaccineName').val(),
      dateAdministered: $('#dateAdministered').val(),
      gender: $('#gender').val(),
      barangay: $('#barangay').val()
    };

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to mark this as Taken?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: "#12be12c1",
      cancelButtonText: "Cancel",
      cancelButtonColor: "#FF0000",
      customClass: {
        popup: "glassmorphism-popup",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Send the form data via AJAX POST request
        $.ajax({
          url: "/VaccinationStatus/update/",
          method: "POST",
          data: formData, // Ensure that status is sent in the request
          success: function (response) {
            if (response.success) {
              Swal.fire({
                position: 'top-end',
                toast: true,
                icon: 'success',
                text: 'Status Updated',            
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                customClass: {
                    popup: 'swal2-toast'
                }  
              });
              
              // Reload the table after successful update
              $("#vaccinationTable").load(
                location.href + " #vaccinationTable > *",
                function () {
                  attachDoneButtonHandler(); // Re-attach event handlers after table reload
                }
              );
            } else {
              Swal.fire({
                title: "Error!",
                text: response.message,
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#0000FF",
                customClass: {
                  popup: "glassmorphism-popup",
                },
              });
            }
          },
          error: function (xhr) {
            Swal.fire({
              title: "Error!",
              text: "Failed to update vaccination status",
              icon: "error",
              confirmButtonText: "OK",
              confirmButtonColor: "#0000FF",
            });
          },
          complete: function () {
            // Re-enable the button after completion
            $button.prop("disabled", false);
          },
        });
      } else {
        // Re-enable the button if the user cancels
        $button.prop("disabled", false);
      }
    });
  });
});


// Function to attach the click event handler to .done-button
function attachDoneButtonHandler() {
  $(".done-button")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();

        // Store button reference to re-enable later if needed
    const $button = $(this);
    $button.prop("disabled", true); // Disable button to prevent double submission

     // Get data attributes from the clicked button
     const patientId = $button.data('patient-id');
     const scheduleId = $button.data('schedule-id');
     const status = $button.data('status');
     const vaccineName = $button.data('vaccine-name');
     const dateAdministered = $button.data('schedule-date');
     const gender = $button.data('gender');
     const barangay = $button.data('barangay');
 
     // Set hidden input values
     $('#patientId').val(patientId);
     $('#scheduleId').val(scheduleId);
     $('#status').val(status);
     $('#vaccineName').val(vaccineName);
     $('#dateAdministered').val(dateAdministered);
     $('#gender').val(gender);
     $('#barangay').val(barangay);
 
 
     const formData = {
       patientId: $("#patientId").val(),
       scheduleId: $("#scheduleId").val(),
       status: $("#status").val(), // Send status as "Taken"
       vaccineName: $('#vaccineName').val(),
       dateAdministered: $('#dateAdministered').val(),
       gender: $('#gender').val(),
       barangay: $('#barangay').val()
     };
     
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to mark this as Taken?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: "#12be12c1",
      cancelButtonText: "Cancel",
      cancelButtonColor: "#FF0000",
      customClass: {
        popup: "glassmorphism-popup",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Send the form data via AJAX POST request
        $.ajax({
          url: "/VaccinationStatus/update/",
          method: "POST",
          data: formData, // Ensure that status is sent in the request
          success: function (response) {
            if (response.success) {
              Swal.fire({
                position: 'top-end',
                toast: true,
                icon: 'success',
                text: 'Status Updated',            
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                customClass: {
                    popup: 'swal2-toast'
                }  
              });

              // Reload the table after successful update
              $("#vaccinationTable").load(
                location.href + " #vaccinationTable > *",
                function () {
                  attachDoneButtonHandler(); // Re-attach event handlers after table reload
                }
              );
            } else {
              Swal.fire({
                title: "Error!",
                text: response.message,
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#0000FF",
                customClass: {
                  popup: "glassmorphism-popup",
                },
              });
            }
          },
          error: function (xhr) {
            Swal.fire({
              title: "Error!",
              text: "Failed to update vaccination status",
              icon: "error",
              confirmButtonText: "OK",
              confirmButtonColor: "#0000FF",
            });
          },
          complete: function () {
            // Re-enable the button after completion
            $button.prop("disabled", false);
          },
        });
      } else {
        // Re-enable the button if the user cancels
        $button.prop("disabled", false);
      }
    });
  });
}


// RE SCHED AND UPDATE STATUS FOR ALL PATIENTS VACCINATION 
$(document).ready(function () {
  // Utility function to show and populate a modal
  function showModal(modalId, formData) {
    Object.keys(formData).forEach((key) => {
      $(`#${modalId} #${key}`).val(formData[key]);
    });

    $(`#${modalId}`).modal("show");
  }

  // Utility function for AJAX submission and toast alert
function submitForm(url, formData, modalId, successMessage, updateCallback, $button) {
  $.ajax({
    url: url,
    type: "POST",
    data: formData,
    success: function (response) {
      if (response.success) {
        Swal.fire({
          position: 'top-end',
          toast: true,
          icon: 'success',
          text: successMessage,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: 'swal2-toast'
          }
        });

        // Run the callback to update the UI
        if (updateCallback) updateCallback(response);

        // Reset the form and modal after success
        $(`#${modalId}`).modal("hide");
        $(`#${modalId} form`)[0].reset();
      }
    },
    error: function () {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong! Please try again later.",
      });
    },
    complete: function () {
      // Re-enable the button whether success or failure
      if ($button) $button.prop("disabled", false);
    }
  });
}

// Handle edit status button clicks (event delegation)
$(document).on("click", ".editStatus", function () {
  const row = $(this).closest("tr");
  const scheduleId = row.find(".vaccinationTdid").text();
  const currentStatus = row.find("td:nth-child(5) p").text().trim();
  const placeOfVaccination = row.find(".vaccinationPlace").text().trim();

  const formData = {
    scheduleId: scheduleId,
    status: currentStatus === "Taken" ? "Taken" : "Not Taken",
    placeOfVaccination: placeOfVaccination
  };

  showModal("editVaccinationModal", formData);
});

// Handle submit for Vaccination Status form
$("#editVaccinationStatus").on("submit", function (e) {
  e.preventDefault();

  const formData = {
    scheduleId: $("#editVaccinationModal #scheduleId").val(),
    status: $("#editVaccinationModal #status").val(),
    placeOfVaccination: $("#editVaccinationModal #placeOfVaccination").val()
  };

  const $button = $(this).find('button[type="submit"]');
  $button.prop("disabled", true); // Disable button to prevent multiple clicks

  submitForm(
    "/allVaccinationStatus/update/",
    formData,
    "editVaccinationModal",
    'Status Updated',
    function (response) {
      const row = $("tr")
        .find(`.vaccinationTdid:contains(${formData.scheduleId})`)
        .closest("tr");

      // Update the current row
      row.find("td:nth-child(5) p")
        .text(formData.status === "Taken" ? "Taken" : "Not Taken")
        .attr("class", formData.status === "Taken" ? "text-lime" : "text-danger");
      
      row.find(".vaccinationPlace").text(formData.placeOfVaccination);

      // Update the next row if it exists
      const nextRow = row.next();
      if (nextRow.length > 0) {
        nextRow.find("td:nth-child(5) p")
          .text(response.nextStatus)
          .attr("class", response.nextStatus === "Taken" ? "text-lime" : "text-danger");

        nextRow.find(".vaccinationPlace").text(response.nextPlaceOfVaccination);
      }

      // Ensure mobile UI also updates correctly
      $("#vaccinationTable .vaccinationTdShowtoMobile p").addClass("mb-0");
    },
    $button
  );
});


  // Handle edit schedule button clicks (event delegation)
  $(document).on("click", ".editSchedule", function () {
    const row = $(this).closest("tr");
    const scheduleId = row.find(".vaccinationTdid").text();
    const currentSchedule = row.find("td:nth-child(3)").text().trim();

    // Show modal for editing schedule
    showModal("editScheduleModal", { scheduleId: scheduleId, vaccinationSchedule: currentSchedule });
    
    // Reset the selected option when opening the modal
    selectedOption = null; // Reset the selected option
  });

  let selectedOption = null;

  // Track schedule option changes (e.g., next week, next 2 weeks, etc.)
  $('input[name="scheduleOptions"]').on('change', function () {
    selectedOption = $(this).val();
  });

  // Handle submit for Vaccination Schedule form
  $("#editVaccinationSchedule").on("submit", function (e) {
    e.preventDefault();

    const scheduleId = $("#editScheduleModal #scheduleId").val();
    const currentSchedule = new Date($("#editScheduleModal #vaccinationSchedule").val());

    let newScheduleDate = new Date(currentSchedule);

    if (selectedOption) {
      switch (selectedOption) {
        case '1':
          newScheduleDate.setDate(newScheduleDate.getDate() + 7); // Add 1 week
          break;
        case '2':
          newScheduleDate.setDate(newScheduleDate.getDate() + 14); // Add 2 weeks
          break;
        case '3':
          newScheduleDate.setDate(newScheduleDate.getDate() + 21); // Add 3 weeks
          break;
        case '4':
          newScheduleDate.setDate(newScheduleDate.getDate() + 28); // Add 1 month
          break;
        default:
          Swal.fire('Error', 'Please select a valid schedule option.', 'error');
          return;
      }
    } else {
      // If no option is selected, use the input date as the new schedule date
      newScheduleDate = currentSchedule; // Use the input value directly
    }

    const formData = {
      scheduleId: scheduleId,
      vaccinationSchedule: $("#editScheduleModal #vaccinationSchedule").val(),
      newVaccinationSchedule: newScheduleDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), // Format date for backend
    };

    const $button = $(this).find('button[type="submit"]');
    $button.prop("disabled", true); // Disable button to prevent multiple clicks

    submitForm(
      "/allVaccinationSched/update/",
      formData,
      "editScheduleModal",
      'Schedule Updated',
      function () {
        const row = $("tr")
          .find(`.vaccinationTdid:contains(${formData.scheduleId})`)
          .closest("tr");

        // Update the schedule text in the table
        row.find("td:nth-child(3)").text(formData.newVaccinationSchedule);

        // Append the edit button if not present
        if (row.find(".editSchedule").length === 0) {
          const buttonHtml = `
            <button type="button" class="btn btn-sm text-light me-5 editSchedule" aria-label="EditSchedule">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="blue" class="bi bi-pencil-square me-1" viewBox="0 0 16 16">
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
              </svg>
            </button>`;
          row.find("td:nth-child(3)").append(buttonHtml);
        }
      },
      $button
    );

    // Reset selected option after submission
    selectedOption = null; // Clear selected option for next time
  });

  // Handle modal close to prevent errors
  $('#editScheduleModal, #editVaccinationModal').on('hidden.bs.modal', function () {
    // Reset form data and re-enable buttons when modals are closed
    $(this).find('form')[0].reset();
    $(this).find('button[type="submit"]').prop("disabled", false);
    selectedOption = null; // Clear the selected option on modal close
  });
});


//------------------PATIENT REGISTRATION SWEET ALERT and VALIDATION----------------------------
$(document).ready(function () {
  $("#patientRegistrationButton").on("click", function (e) {
    e.preventDefault();
    console.log("Button clicked");

    if (validatePatientForm()) {
      $("#signup-span").html(""); // Remove the innerHTML
      $("#signup-span").addClass("loading-icon"); // Add loading-icon class to the signup span
      $(".loading-icon").css("display", "inline-block"); // Show the loading-icon

      $("#signup-span").removeClass("loading-icon");
      Swal.fire({
        title: "Success!",
        text: "Patient Registered Successfully",
        icon: "success",
        showConfirmButton: false,
        timer: 1500, // Auto-close after 1 second
        customClass: {
          popup: "glassmorphism-popup",
        },
      }).then(() => {
        $("#patientForm").submit(); // Submit the form after SweetAlert confirmation
      });
      $("#signup-span").html("SIGN UP");
    } else {
      console.log("Form validation failed");
    }
  });

  //validateForm function
  function validatePatientForm() {
    let isValid = true;

    // Clear previous errors
    $("#patientForm").find(".is-invalid").removeClass("is-invalid");
    $("#patientForm").find(".invalid-feedback").remove();

    // Regular expression to check for letters including "ñ" and "Ñ" only
    const letterPattern = /^[A-Za-zñÑ\s]+$/;

    // Validate First Name
    const firstName = $('[name="firstName"]').val().trim();
    if (firstName === "") {
      showError($('[name="firstName"]'), "First name is required.");
      isValid = false;
    } else if (!letterPattern.test(firstName)) {
      showError(
        $('[name="firstName"]'),
        "First name should contain only letters."
      );
      isValid = false;
    } else {
      markValid($('[name="firstName"]'));
    }

    // Validate Last Name
    const lastName = $('[name="lastName"]').val().trim();
    if (lastName === "") {
      showError($('[name="lastName"]'), "Last name is required.");
      isValid = false;
    } else if (!letterPattern.test(lastName)) {
      showError(
        $('[name="lastName"]'),
        "Last name should contain only letters."
      );
      isValid = false;
    } else {
      markValid($('[name="lastName"]'));
    }

     // Validate Last Name (parent)
     const parentlastName = $('[name="parentLastName"]').val().trim();
     if (parentlastName === "") {
       showError($('[name="parentLastName"]'), "Parent Last name is required.");
       isValid = false;
     } else if (!letterPattern.test(parentlastName)) {
       showError(
         $('[name="parentLastname"]'),
         "Parent Last name should contain only letters."
       );
       isValid = false;
     } else {
       markValid($('[name="parentLastName"]'));
     }
 

    // Validate Email
    const email = $('[name="email"]').val().trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com" , "usm.edu.ph"];
    const emailDomain = email.split("@")[1];

    if (email === "") {
      showError($('[name="email"]'), "Email is required.");
      isValid = false;
    } else if (!emailPattern.test(email)) {
      showError($('[name="email"]'), "A valid email is required.");
      isValid = false;
    } else if (!allowedDomains.includes(emailDomain)) {
      showError($('[name="email"]'), "Email domain is not allowed.");
      isValid = false;
    } else {
      markValid($('[name="email"]'));
    }
    0;

    // Validate Contact Number
    const contactNumber = $('[name="contactNumber"]').val().trim();
    const contactPattern = /^09\d{9}$/; // Example pattern for 11-digit contact number
    if (!contactPattern.test(contactNumber)) {
      showError(
        $('[name="contactNumber"]'),
        'Contact number must begin with "09" and consist of 11 digits.'
      );
      isValid = false;
    } else {
      markValid($('[name="contactNumber"]'));
    }

    // Validate Birthday
    const birthday = $('[name="birthday"]').val().trim();
    if (birthday === "") {
      showError($('[name="birthday"]'), "Birthday is required.");
      isValid = false;
    } else {
      markValid($('[name="birthday"]'));
    }

    // Validate registration Date
    const registrationDate = $('[name="registrationDate"]').val().trim();
    if (registrationDate === "") {
      showError(
        $('[name="registrationDate"]'),
        "Registration Date is required."
      );
      isValid = false;
    } else {
      markValid($('[name="registrationDate"]'));
    }
    // Validate Barangay
    const barangay = $('[name="barangay"]').val();
    if (barangay === null || barangay === "") {
      showError($('[name="barangay"]'), "Barangay is required.");
      isValid = false;
    } else {
      markValid($('[name="barangay"]'));
    }

    // Validate gender
    const gender = $('[name="gender"]').val();
    if (gender === null || gender === "") {
      showError($('[name="gender"]'), "Gender is required.");
      isValid = false;
    } else {
      markValid($('[name="gender"]'));
    }
  
    // Validate Password
    const password = $('[name="password"]').val().trim();
    const confirmPassword = $('[name="confirm-password"]').val().trim();
    if (!validatePassword(password)) {
      showError(
        $('[name="password"]'),
        "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character."
      );
      showError($('[name="confirm-password"]'), "Confirm password is required");
      isValid = false;
    } else if (password !== confirmPassword) {
      showError($('[name="confirm-password"]'), "Password not matched.");
      isValid = false;
    } else if (password === confirmPassword) {
      markValid($('[name="password"]'));
      markValid($('[name="confirm-password"]'));
    }

    return isValid;
  }

  function showError(element, message) {
    const label = $('label').css('display','none');
 

    element.addClass("is-invalid");
    const errorDiv = $('<div class="invalid-feedback">' + message + "</div>");
    if (element.is("select")) {
      element.parent().append(errorDiv); // Append error message for select
    } else {
      element.after(errorDiv); // Append error message for other inputs
    }
  }

  function validatePassword(password) {
      const minLength = 8;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasDigit = /\d/.test(password);
      const hasSpecialChar = /[_!@#$%^&*(),.?":{}|<>]/.test(password);
      const noSpaces = !/\s/.test(password);
      return password.length >= minLength && hasUppercase && hasLowercase && hasDigit && hasSpecialChar && noSpaces;
  }

  function markValid(element) {
    element.addClass("is-valid");
  }
});


//-------------------PATIENTS CRUD----------------------------
$(document).ready(function () {
  attachEventHandlers();
  loadPatientsTable();
 

  function attachEventHandlers() {
    // Use event delegation for dynamically loaded elements
    $(document).on("click", ".deleteButton", attachDeleteButtonClickHandler);
    $(document).on("click", ".viewButton", attachViewButtonClickHandler);
    $(document).on("click", ".editButton", attachEditButtonClickHandler);
  }

  // Load Patients Table
  function loadPatientsTable() {
    // Destroy the existing DataTable if it's already initialized
    if ($.fn.DataTable.isDataTable("#approvedPatientsTable")) {
      $("#approvedPatientsTable").DataTable().destroy();
    }
  
    $("#approvedPatientsTable").load(location.href + " #approvedPatientsTable > *", function () {
      // Reinitialize DataTable after loading new content
      $("#approvedPatientsTable").DataTable();
  
      // Reattach event handlers
      attachEventHandlers();
    });
  }


  // Delete Button Handler for (Patients)
  function attachDeleteButtonClickHandler(e) {
    e.preventDefault();
    const firstname = $(this).closest("tr").find("td:eq(1)").text().trim();
    const lastname = $(this).closest("tr").find("td:eq(2)").text().trim();    
    const form = $(this).closest("form");

    Swal.fire({
      title: `Patient: ${firstname} ${lastname}`,
      text: "Are you sure you want to delete this patient?",
      icon: "warning",
      confirmButtonColor: "#12be12c1",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonColor: "#FF0000",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "glassmorphism-popup",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: form.attr("action"),
          method: "POST",
          success: function (response) {
            Swal.fire({
              position: 'top-end',
              toast: true,
              icon: 'success',
              text: 'Deleted Successfully',            
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              customClass: {
                  popup: 'swal2-toast'
              }  
            });
            loadPatientsTable();
          },
          error: function () {
            Swal.fire({
              title: "Error!",
              text: "Failed to delete patient",
              icon: "error",
              confirmButtonText: "OK",
              customClass: {
                popup: "glassmorphism-popup",
              },
            });
          },
        });
      }
    });
  }
 

  // View Button Handler
  function attachViewButtonClickHandler() {
    $("#viewPatientModal").modal("show");
    const patientData = getPatientData($(this));
    populateViewModal(patientData);
  }

  // Edit Button Handler
  function attachEditButtonClickHandler() {
    $("#editPatientModal").modal("show");
    const patientData = getPatientData($(this));
    populateEditModal(patientData);
  }

  // Fetch Patient Data
  function getPatientData(button) {
    return {
      id: button.closest("tr").find("td:eq(0)").text(),
      firstName: button.closest("tr").find("td:eq(1)").text(),
      lastName: button.closest("tr").find("td:eq(2)").text(),
      email: button.closest("tr").find("td:eq(3)").text(),
      contactNumber: button.closest("tr").find("td:eq(4)").text(),
      birthday: button.closest("tr").find("td:eq(5)").text(),
      registrationDate: button.closest("tr").find("td:eq(6)").text(),
      barangay: button.closest("tr").find("td:eq(7)").text(),
      gender: button.closest("tr").find("td:eq(8)").text(),
    };
  }

  // Populate View Modal
  function populateViewModal(data) {
    $("#patientId").text(data.id);
    $("#patientFirstName").text(data.firstName);
    $("#patientLastName").text(data.lastName);
    $("#patientEmail").text(data.email);
    $("#patientContact").text(data.contactNumber);
    $("#patientBirthday").text(data.birthday);
    $("#patientRegistrationDate").text(data.registrationDate);
    $("#patientBarangay").text(data.barangay);
    $("#patientGender").text(data.gender);
  }

  // Populate Edit Modal
  function populateEditModal(data) {
    $("#patientId").val(data.id);
    $("#firstName").val(data.firstName);
    $("#lastName").val(data.lastName);
    $("#email").val(data.email);
    $("#contactNumber").val(data.contactNumber);
    $("#birthday").val(data.birthday);
    $("#registrationDate").val(data.registrationDate);
    $("#barangay").val(data.barangay);
    $("#gender").val(data.gender);

    let audio = new Audio('/sounds/sound4.wav');
    audio.play();
  }

  // Update Patient via AJAX
  $("#editPatientForm").on("submit", function (e) {
    e.preventDefault();

    const formData = {
      patientId: $("#patientId").val(),
      firstName: $("#firstName").val(),
      lastName: $("#lastName").val(),
      email: $("#email").val(),
      contactNumber: $("#contactNumber").val(),
      birthday: $("#birthday").val(),
      registrationDate: $("#registrationDate").val(),
      barangay: $("#barangay").val(),
      gender: $("#gender").val(),
    };
    $("#editPatientModal").modal("hide");
    loadPatientsTable(); // Refresh the patient table
    $.ajax({
      url: "/patients/update",
      method: "POST",
      data: formData,
      success: function (response) {
        if (response.success) {
          Swal.fire({
            position: 'top-end',
            toast: true,
            icon: 'success',
            text: 'Updated Successfully',            
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
                popup: 'swal2-toast'
            }  
            
          });
            
           
    let audio = new Audio('/sounds/sound5.wav');
    audio.play();
        
        } else {
          Swal.fire({
            title: "Error!",
            text: response.message,
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      },
      error: function (xhr) {
        Swal.fire({
          title: "Error!",
          text: "Failed updating patient",
          icon: "error",
          confirmButtonText: "OK",
        });
      },
    });
  });

});


//-------------------ELIGIBLE POPULATION CRUD----------------------------
$(document).ready(function () {

  attachEventHandlers();
  loadEligiblePopulationTable();

  function attachEventHandlers() {
      // Use event delegation for dynamically loaded elements
      $(document).on("click", ".deleteButtonForEligiblePopulation", attachDeleteButtonClickHandler);
      $(document).on("click", ".editButtonForEligiblePopulation", attachEditButtonClickHandler);
  }

  // Load Eligible Population Table
  function loadEligiblePopulationTable() {
      // Destroy the existing DataTable if it's already initialized
      if ($.fn.DataTable.isDataTable("#eligiblePopulationTable")) {
          $("#eligiblePopulationTable").DataTable().destroy();
      }

      // Load the table content dynamically
      $("#eligiblePopulationTable").load(location.href + " #eligiblePopulationTable > *", function () {
          // Reinitialize DataTable after loading new content
          $("#eligiblePopulationTable").DataTable();
          attachEventHandlers();
      });
  }


  // Insert Eligible Population via AJAX
$("#insertEligiblePopulationForm").on("submit", function (e) {
  e.preventDefault();

  const formData = {
      eligiblePopulation: $("#eligiblePopulationInput").val(),
      dateOfEligiblePopulation: $("#eligiblePopulationDate").val(),
  };

  $.ajax({
      url: "/eligiblePopulation/insert",
      method: "POST",
      data: formData,
      success: function (response) {
          if (response.success) {
              Swal.fire({
                  position: 'top-end',
                  toast: true,
                  icon: 'success',
                  text: 'Inserted Successfully',
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true,
                  customClass: { popup: 'swal2-toast' }
              });
              loadEligiblePopulationTable(); // Refresh the eligible population table
              
              // Hide the modal and clear the form fields
              $("#addEligiblePopulationModal").modal("hide");
              $("#eligiblePopulationInput").val('');
              $("#eligiblePopulationDate").val('');
          } else {
              Swal.fire({
                  title: "Error!",
                  text: response.message,
                  icon: "error",
                  confirmButtonText: "OK",
                  customClass: { popup: "glassmorphism-popup" },
              });
          }
      },
      error: function () {
          Swal.fire({
              title: "Error!",
              text: "Failed to insert record",
              icon: "error",
              confirmButtonText: "OK",
              customClass: { popup: "glassmorphism-popup" },
          });
      }
  });
});



  // Delete Button Handler
  function attachDeleteButtonClickHandler(e) {
      e.preventDefault();
      const form = $(this).closest("form");

      Swal.fire({
          title: 'Are you sure?',
          text: "This action cannot be undone",
          icon: "warning",
          confirmButtonColor: "#12be12c1",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonColor: "#FF0000",
          cancelButtonText: "Cancel",
          customClass: { popup: "glassmorphism-popup" },
      }).then((result) => {
          if (result.isConfirmed) {
              $.ajax({
                  url: form.attr("action"),
                  method: "POST",
                  success: function (response) {
                      if (response.success) {
                          Swal.fire({
                              position: 'top-end',
                              toast: true,
                              icon: 'success',
                              text: 'Deleted Successfully',
                              showConfirmButton: false,
                              timer: 3000,
                              timerProgressBar: true,
                              customClass: { popup: 'swal2-toast' }
                          });
                          const row = form.closest('tr');
                          const table = $('#eligiblePopulationTable').DataTable();
                          table.row(row).remove().draw();
                      } else {
                          Swal.fire({
                              title: "Error!",
                              text: response.message,
                              icon: "error",
                              confirmButtonText: "OK",
                              customClass: { popup: "glassmorphism-popup" },
                          });
                      }
                  },
                  error: function () {
                      Swal.fire({
                          title: "Error!",
                          text: "Failed to delete record",
                          icon: "error",
                          confirmButtonText: "OK",
                          customClass: { popup: "glassmorphism-popup" },
                      });
                  },
              });
          }
      });
  }

  // Edit Button Handler
  function attachEditButtonClickHandler() {
      $("#updateEligiblePopulationModal").modal("show");
      const Data = getEligiblePopulationData($(this));
      populateEditModal(Data);
  }

  // Fetch Eligible Population Data
  function getEligiblePopulationData(button) {
      return {
          id: button.closest("tr").find("td:eq(0)").text(),
          barangay: button.closest("tr").find("td:eq(1)").text(),
          eligiblePopulation: button.closest("tr").find("td:eq(2)").text(),
          date: button.closest("tr").find("td:eq(3)").text(),
      };
  }

  // Populate Edit Modal
  function populateEditModal(data) {
      $("#eligibleId").val(data.id);
      $("#eligiblePopulation").val(data.eligiblePopulation);
      $("#PopulationDate").val(data.date);
  }

  // Update Eligible Population via AJAX
  $("#updateEligiblePopulation").on("submit", function (e) {
      e.preventDefault();

      const formData = {
          eligibleId: $("#eligibleId").val(),
          eligiblePopulation: $("#eligiblePopulation").val(),
          PopulationDate: $("#PopulationDate").val(),
      };

      $.ajax({
          url: "/eligiblePopulation/update",
          method: "POST",
          data: formData,
          success: function (response) {
              if (response.success) {
                  Swal.fire({
                      position: 'top-end',
                      toast: true,
                      icon: 'success',
                      text: 'Updated Successfully',
                      showConfirmButton: false,
                      timer: 3000,
                      timerProgressBar: true,
                      customClass: { popup: 'swal2-toast' }
                  });
                  loadEligiblePopulationTable();
              } else {
                  Swal.fire({
                      title: "Error!",
                      text: response.message,
                      icon: "error",
                      confirmButtonText: "OK",
                  });
              }
          },
          error: function () {
              Swal.fire({
                  title: "Error!",
                  text: "Failed updating eligible population",
                  icon: "error",
                  confirmButtonText: "OK",
              });
          },
      });

      $("#updateEligiblePopulationModal").modal("hide");
  });
});
