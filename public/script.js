
//-------------------LOGIN BUTTON LOADING ANIMATION-----------------------------
$(document).ready(function () {
  $("#login-button").on("click", function (e) {
    e.preventDefault(); // Prevent default form submission

    // Get the form input values
    const email = $('[name="email"]').val().trim();
    const password = $('[name="password"]').val().trim();

    // Show loading animation on button
    $("#login-button").html(""); // Remove innerHTML
    $("#login-button").addClass("loading-icon"); // Add loading-icon class
    $(".loading-icon").css("display", "inline-block"); // Show the loading-icon

    // If form fields are empty, show SweetAlert error and stop the process
    if (emptyFields()) {
      setTimeout(function () {
        $("#login-button").removeClass("loading-icon"); // Remove loading icon class
        $("#login-button").html("LOGIN"); // Restore button text

        Swal.fire({
          title: "Login Error!",
          text: "Enter your email and password to login",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: " #0000FF",
          customClass: {
            popup: "glassmorphism-popup",
          },
        });
      }, 1000); // Wait for 1 second
    } else {
      // If fields are valid, proceed with AJAX submission
      $.ajax({
        url: "/login", // Replace with your actual login route
        method: "POST",
        data: {
          email: email,
          password: password,
        },
        success: function (response) {
          // Play success sound
          let audio = new Audio('/sounds/sound1.wav');
          audio.play().catch(function (error) {
            console.error("Error playing success sound: ", error);
          });
          setTimeout(function () {
            
            // Delay the sound and redirection for 5 seconds (5000 ms)
            // Redirect to the appropriate dashboard
            window.location.href = response.redirectUrl;
          }, 5000); // 5-second delay
        },
        error: function (xhr) {
          // Handle errors (email or password incorrect)
          $("#login-button").removeClass("loading-icon"); // Remove loading icon class
          $("#login-button").html("LOGIN"); // Restore button text

          let errorMessage = "";
          if (xhr.status === 400) {
            errorMessage = xhr.responseJSON.message;

            // Play error sound
            let audio = new Audio('/sounds/sound3.wav');
            audio.play().catch(function (error) {
              console.error("Error playing error sound: ", error);
            });

          } else {
            errorMessage = "Internal server error. Please try again later.";
          }

          // Show SweetAlert for invalid email/password
          Swal.fire({
            title: "Login Error!",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#0000FF",
            customClass: {
              popup: "glassmorphism-popup",
            },
          });
        },
      });
    }
  });

  // Function to check if email and password fields are empty
  function emptyFields() {
    const email = $('[name="email"]').val().trim();
    const password = $('[name="password"]').val().trim();
    return email === "" || password === ""; // Return true if fields are empty
  }
});


//------------------REGISTRATION FORM VALIDATION && BUTTON ANIMATION------------------------
$(document).ready(function () {
  $("#signup-button").on("click", function (e) {
    e.preventDefault();
    console.log("Button clicked");

    if (validateForm()) {
      $("#signup-span").html(""); // Remove the innerHTML
      $("#signup-span").addClass("loading-icon"); // Add loading-icon class to the login button
      $(".loading-icon").css("display", "inline-block"); // Show the loading-icon

      // Perform AJAX request to backend
      $.ajax({
        url: "/bhwRegistration", // Your backend route
        type: "POST",
        data: $("#signUpForm").serialize(), // Serialize form data
        success: function (response) {
          // Simulate server delay or processing time
          setTimeout(function () {
            $("#signup-span").removeClass("loading-icon"); // Remove the loading-icon class

            // Success Registration Sweet Alert
            if (response.success) {
              Swal.fire({
                title: "Account Created Successfully!",
                text: "Redirect to login page.",
                icon: "success",
                confirmButtonColor: "#00FF00",
                confirmButtonText: "Confirm",
                customClass: {
                  popup: "glassmorphism-popup",
                },
              }).then(() => {
                window.location.href = "Login"; // Redirect to login page
              });
            } else {
              // Error Registration Sweet Alert
              Swal.fire({
                title: "Error!",
                text: response.message, // Display error from backend
                icon: "error",
                confirmButtonText: "Try Again",
                confirmButtonColor: "#0000FF",
                customClass: {
                  popup: "glassmorphism-popup",
                },
              });
            }
          }, 1000); // Delay for 3 seconds
        },
        error: function (xhr, status, error) {
          $("#signup-span").removeClass("loading-icon"); // Remove loading state in case of error
          Swal.fire({
            title: "Error!",
            text: "Email already Taken.",
            icon: "error",
            confirmButtonText: "Try Again",
            confirmButtonColor: "#0000FF",
            customClass: {
              popup: "glassmorphism-popup",
            },
          });
        },
      });
    } else {
      console.log("Form validation failed");
    }
  });

  function validateForm() {
    let isValid = true;

    // Clear previous errors
    $("#signUpForm").find(".is-invalid").removeClass("is-invalid");
    $("#signUpForm").find(".invalid-feedback").remove();

    // Regular expression to check for letters only
    const letterPattern = /^[A-Za-z\s]+$/;

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

    // Validate Email
    const email = $('[name="email"]').val().trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];
    const emailDomain = email.split("@")[1];

    if (email === "") {
      showError($('[name="email"]'), "Email is required.");
      isValid = false;
    } else if (!emailPattern.test(email)) {
      showError($('[name="email"]'), "A valid email is required.");
      isValid = false;
    } else if (!allowedDomains.includes(emailDomain)) {
      showError($('[name="email"]'), "Email is incorrect.");
      isValid = false;
    } else {
      markValid($('[name="email"]'));
    }

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

    // Validate Barangay
    const barangay = $('[name="barangay"]').val();
    if (barangay === null || barangay === "") {
      showError($('[name="barangay"]'), "Barangay is required.");
      isValid = false;
    } else {
      markValid($('[name="barangay"]'));
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

  //showError function
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

  //markValid function
  function markValid(element) {
    element.addClass("is-valid");
  }

  //validatePassword Function
  function validatePassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[_!@#$%^&*(),.?":{}|<>]/.test(password);
    const noSpaces = !/\s/.test(password);
    return (
      password.length >= minLength &&
      hasUppercase &&
      hasLowercase &&
      hasDigit &&
      hasSpecialChar &&
      noSpaces
    );
  }
});


// ------------------------------APPROVE PATIENT---------------------------------------
$(document).ready(function () {
  $(document).on("click", ".approveButton", function (e) {
    e.preventDefault();
    

    // Store button reference to re-enable later if needed
    const $button = $(this);
    $button.prop("disabled", true); // Disable button to prevent double submission

    // Get data attributes from the clicked button
    const patientId = $button.data('patient-id');
    const status = $button.data('status');
    

    // Set hidden input values
    $('#patientId').val(patientId);
    $('#status').val(status);
    


    const formData = {
      patientId: $("#patientId").val(),
      status: $("#status").val(), // Send status as "Approved"
    };

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
        // Send the form data via AJAX POST request
        $.ajax({
          url: "/pendingPatients/update",
          method: "POST",
          data: formData, // Ensure that status is sent in the request
          success: function (response) {
            if (response.success) {
              Swal.fire({
                position: 'top-end',
                toast: true,
                icon: 'success',
                text: 'Success',            
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                customClass: {
                    popup: 'swal2-toast'
                }  
              });

              // Reload the table after successful update
              $("#patientsTable").load(
                location.href + " #patientsTable > *",
                function () {
                  attachApproveButtonHandler(); // Re-attach event handlers after table reload
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
              text: "Failed to Update Status",
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
                text: 'Success',            
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
    const scheduleId = $button.data('schedule-id');
    const status = $button.data('status');
    const vaccineName = $button.data('vaccine-name');
    const dateAdministered = $button.data('schedule-date');
    const barangay = $button.data('barangay');

    // Set hidden input values
    $('#scheduleId').val(scheduleId);
    $('#status').val(status);
    $('#vaccineName').val(vaccineName);
    $('#dateAdministered').val(dateAdministered);
    $('#barangay').val(barangay);

    const formData = {
      scheduleId: $("#scheduleId").val(),
      status: $("#status").val(), // Send status as "Taken"
      vaccineName: $('#vaccineName').val(),
      dateAdministered: $('#dateAdministered').val(),
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
                text: 'Success',            
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

  // Utility function for AJAX submission
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
          if (updateCallback) updateCallback();

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

    const formData = {
      scheduleId: scheduleId,
      status: currentStatus === "Taken" ? "Taken" : "Not Taken",
    };

    showModal("editVaccinationModal", formData);
  });

  // Handle submit for Vaccination Status form
  $("#editVaccinationStatus").on("submit", function (e) {
    e.preventDefault();

    const formData = {
      scheduleId: $("#editVaccinationModal #scheduleId").val(),
      status: $("#editVaccinationModal #status").val(),
    };

    const $button = $(this).find('button[type="submit"]');
    $button.prop("disabled", true); // Disable button to prevent multiple clicks

    submitForm(
      "/allVaccinationStatus/update/",
      formData,
      "editVaccinationModal",
      'Success',
      function () {
        const row = $("tr")
          .find(`.vaccinationTdid:contains(${formData.scheduleId})`)
          .closest("tr");
        
        row.find("td:nth-child(5) p")
          .text(formData.status === "Taken" ? "Taken" : "Not Taken")
          .attr("class", formData.status === "Taken" ? "text-lime" : "text-danger");

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
    const currentSchedule = row.find("td:nth-child(3)").text();

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
      'Success',
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

//-------------------Date picker-----------------------------
$(document).ready(function() {
  $('#datepickerBirthday').datepicker({
      dateFormat: "mm/dd/yy", // Adjust the format to YYYY-MM-DD
      showAnim: "slideDown",  // Animation effect when opening
      changeMonth: true,      // Option to change months
      changeYear: true,       // Option to change years
      yearRange: "2000:2100"  // Limit the year range
  });
});

$(document).ready(function() {
  $('#datepickerRegistrationDate').datepicker({
      dateFormat: "mm/dd/yy", // Adjust the format to YYYY-MM-DD
      showAnim: "slideDown",  // Animation effect when opening
      changeMonth: true,      // Option to change months
      changeYear: true,       // Option to change years
      yearRange: "2000:2100"  // Limit the year range
  });
});

//-------------------MY PATIENTS----------------------------
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
    $("#patientsTableBody").load(
      location.href + " #patientsTableBody > *",
      function () {
        attachEventHandlers(); // Reattach event handlers after loading new content
      }
    );
  }

  // Delete Button Handler
  function attachDeleteButtonClickHandler(e) {
    e.preventDefault();
    const firstname = $(this).closest("tr").find("td:eq(1)").text();
    const lastname = $(this).closest("tr").find("td:eq(2)").text();
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
              text: 'Success',            
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
            text: 'Success',            
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
