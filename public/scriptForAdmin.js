//----------------------------------DELETE USERS----------------------------
$(document).ready(function () {
    attachEventHandlers();
    loadUsersTable();
  
    function attachEventHandlers() {
      // Use event delegation for dynamically loaded elements
      $(document).on("click", ".deleteButtonForAdmin", attachDeleteButtonClickHandlerForUser);
    }
  
    // Load Users Table
    function loadUsersTable() {
      // Destroy the existing DataTable if it's already initialized
      if ($.fn.DataTable.isDataTable("#approvedUsersTable")) {
        $("#approvedUsersTable").DataTable().destroy();
      }
    
      $("#approvedUsersTable").load(location.href + " #approvedUsersTable > *", function () {
        // Reinitialize DataTable after loading new content
        $("#approvedUsersTable").DataTable();
    
        // Reattach event handlers
        attachEventHandlers();
      });
    }
    

    // Delete Button Handler for (Admin)
    function attachDeleteButtonClickHandlerForUser(e) {
      e.preventDefault();
      const firstname = $(this).closest("tr").find("td:eq(1)").text().trim();
      const lastname = $(this).closest("tr").find("td:eq(2)").text().trim();    
      const form = $(this).closest("form");
  
      Swal.fire({
        title: `Patient: ${firstname} ${lastname}`,
        text: "Are you sure you want to delete this BHW?",
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
              loadUsersTable();
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
  
   
  
  });


  // ------------------------------APPROVE USERS---------------------------------------
$(document).ready(function () {
    $(document).on("click", ".approveButtonForAdmin", function (e) {
      e.preventDefault();
      
  
      // Store button reference to re-enable later if needed
      const $button = $(this);
      $button.prop("disabled", true); // Disable button to prevent double submission
  
      // Get data attributes from the clicked button
      const userId = $button.data('user-id');
      const status = $button.data('status');
      
  
      // Set hidden input values
      $('#userId').val(userId);
      $('#status').val(status);
      
  
  
      const formData = {
        userId: $("#userId").val(),
        status: $("#status").val(), // Send status as "Approved"
      };
  
      Swal.fire({
        title: "Pending Approval!",
        text: "Do you want to Approve this BWH?",
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
            url: "/pendingUsers/update",
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
                $("#approvedUsersTable").load(
                  location.href + " #approvedUsersTable > *",
                  function () {
                    attachApproveButtonHandlerForAdmin(); // Re-attach event handlers after table reload
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


  // Function to attach the click event handler to approveButtonForAdmin
$(document).ready(function () {
    attachApproveButtonHandlerForAdmin(); // Initially attach event handlers
  
    function attachApproveButtonHandlerForAdmin() {
        $(".approveButtonForAdmin").off("click").on("click", function (e) {
            e.preventDefault(); // Prevent the form from submitting
            
            const $button = $(this);
            $button.prop("disabled", true); // Disable button to prevent double submission
            
            const patientId = $button.data('user-id');
            const status = $button.data('status');
  
            $('#userId').val(patientId);
            $('#status').val(status);
  
            const formData = {
                patientId: $("#userId").val(),
                status: $("#status").val()
            };
  
            console.log('Form Data:', formData); // Log data for debugging
  
            Swal.fire({
                title: "Pending Approval!",
                text: "Do you want to Approve this BHW?",
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
                        url: "/pendingUsers/update",
                        method: "POST",
                        data: formData,
                        success: function (response) {
                            if (response.success) {
                                Swal.fire({
                                    title: "Success!",
                                    text: "BHW Registration Completed",
                                    icon: "success",
                                    showConfirmButton: false,
                                    timer: 1500,
                                    customClass: {
                                        popup: "glassmorphism-popup",
                                    },
                                });
  
                                $("#approvedUsersTable").load(location.href + " #approvedUsersTable > *", function () {
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



  //------------------------------- VACCINE CRUD------------------------------------------
  // Function to handle form submission with AJAX
// function submitFormAjax(formId, url, successMessage) {
//   const form = $(`#${formId}`);
//   const formData = form.serialize();

//   $.ajax({
//       type: "POST",
//       url: url,
//       data: formData,
//       success: function (response) {
//           // Show success message
//           Swal.fire({
//             position: 'top-end',
//             toast: true,
//             icon: 'success',
//             text: successMessage,            
//             showConfirmButton: false,
//             timer: 3000,
//             timerProgressBar: true,
//             customClass: {
//                 popup: 'swal2-toast'
//             }  
//           }).then(() => {
//               // Close the modal and reload the table
//               form.closest('.modal').modal('hide');
//               location.reload(); // Or update the table dynamically
//           });
//       },
//       error: function (error) {
//           // Show error message
//           Swal.fire({
//               icon: 'error',
//               title: 'Error',
//               text: 'An error occurred while processing your request.',
//               confirmButtonText: 'OK'
//           });
//       }
//   });
// }

// // Attach the submit event for the add and edit forms
// $(document).ready(function () {
//   $('#addVaccineForm').on('submit', function (e) {
//       e.preventDefault();
//       submitFormAjax('addVaccineForm', '/createVaccines', 'Vaccine added successfully!');
//   });

//   $('#editVaccineForm').on('submit', function (e) {
//       e.preventDefault();
//       submitFormAjax('editVaccineForm', '/updateVaccines', 'Vaccine updated successfully!');
//   });
// });

$(document).ready(function () {

  attachEventHandlers();
  loadVaccineTable();

  function attachEventHandlers() {
      // Use event delegation for dynamically loaded elements
      $(document).on("click", ".deleteButtonForVaccines", attachDeleteButtonClickHandler);
      $(document).on("click", ".editButtonForVaccines", attachEditButtonClickHandler);
  }

  // Load Eligible Population Table
  function loadVaccineTable() {
      // Destroy the existing DataTable if it's already initialized
      if ($.fn.DataTable.isDataTable("#vaccineTable")) {
          $("#vaccineTable").DataTable().destroy();
      }

      // Load the table content dynamically
      $("#vaccineTable").load(location.href + " #vaccineTable > *", function () {
          // Reinitialize DataTable after loading new content
          $("#vaccineTable").DataTable();
          attachEventHandlers();
      });
  }


  // Insert Vaccines via AJAX
$("#addVaccineForm").on("submit", function (e) {
  e.preventDefault();

  const formData = {
      vaccineName: $("#vaccineName").val(),
      minimumAge: $("#minimumAge").val(),
      doses: $("#doses").val(),
      doseInterval: $("#doseInterval").val(),
  };

  $.ajax({
      url: "/createVaccines",
      method: "POST",
      data: formData,
      success: function (response) {
          if (response.success) {
              Swal.fire({
                  position: 'top-end',
                  toast: true,
                  icon: 'success',
                  text: 'Vaccine Added Successfully',
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true,
                  customClass: { popup: 'swal2-toast' }
              });
              loadVaccineTable(); // Refresh the eligible population table
              
              // Hide the modal and clear the form fields
              $('#addVaccineModal').modal('hide');
              $("#vaccineName").val('');
              $("#minimumAge").val('');
              $("#doses").val('');
              $("#doseInterval").val('');
              $("#doseInterval").val('');
     
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
                          const table = $('#vaccineTable').DataTable();
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
      $("#editVaccineModal").modal("show");
      const Data = getVaccineData($(this));
      populateEditModal(Data);
  }

  // Fetch Eligible Population Data
  function getVaccineData(button) {
      return {
          vaccineId: button.closest("tr").find("td:eq(0)").text(),
          vaccineName: button.closest("tr").find("td:eq(1)").text(),
          minimumAge: button.closest("tr").find("td:eq(2)").text(),
          doses: button.closest("tr").find("td:eq(3)").text(),
          doseInterval: button.closest("tr").find("td:eq(4)").text(),
      };
  }

  // Populate Edit Modal
  function populateEditModal(data) {
      $("#editVaccineId").val(data.vaccineId);
      $("#editVaccineName").val(data.vaccineName);
      $("#editMinimumAge").val(data.minimumAge);
      $("#editDoses").val(data.doses);
      $("#editDoseInterval").val(data.doseInterval);
  }

  // Update Eligible Population via AJAX
  $("#editVaccineForm").on("submit", function (e) {
      e.preventDefault();

      const formData = {
          vaccineId: $('#editVaccineId').val(),
          vaccineName: $('#editVaccineName').val(),
          minimumAge: $('#editMinimumAge').val(),
          doses: $('#editDoses').val(),
          doseInterval: $('#editDoseInterval').val(),
      };

      $.ajax({
          url: "/updateVaccines",
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
                  loadVaccineTable();
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

      $("#editVaccineModal").modal("hide");
  });
});






