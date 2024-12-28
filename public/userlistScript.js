document.addEventListener('DOMContentLoaded', () => {
    const editButtons = document.querySelectorAll('.edit-btn');
  
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.dataset.user_id;
        const firstname = button.dataset.firstname;
        const middlename = button.dataset.middlename;
        const lastname = button.dataset.lastname;
        const email = button.dataset.email;
        const userType = button.dataset.usertype;
        const password = button.dataset.password;
  
        document.getElementById('user_id').value = userId;
        document.getElementById('firstname').value = firstname;
        document.getElementById('middlename').value = middlename;
        document.getElementById('lastname').value = lastname;
        document.getElementById('email').value = email;
        document.getElementById('userType').value = userType;
        document.getElementById('password').value = password;
      });
    });
  });


  $('.addUserButton').on('click', function() {

    const addUserForm = document.querySelector('#addUserForm');

    addUserForm.submit();

    sessionStorage.setItem('showToastRegister', 'true');

});



  $('#updateButton').on('click', function() {

    const updateForm = document.querySelector('#updateUserForm');

    updateForm.submit();

    sessionStorage.setItem('showToastUpdate', 'true');

});



    // Select all delete buttons
    const deleteButtons = document.querySelectorAll('.deleteUser');
    
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

          })
        });
      });



$(document).ready(function () {

  if (sessionStorage.getItem('showToastUpdate') === 'true' ) {
    Toastify({
      text: "Updated Successfully",
      duration: 5000,
      close: true,
      gravity: "top",
      position: "right",
      progressBar: true,
      style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
      }
  }).showToast();
// Remove the flag to prevent showing the toast on subsequent reloads
sessionStorage.removeItem('showToastUpdate');



  } else if (sessionStorage.getItem('showToastDelete') === 'true') {
    Toastify({
      text: "Deleted Successfully",
      duration: 5000,
      close: true,
      gravity: "top",
      position: "right",
      progressBar: true,
      style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
      }
  }).showToast();

      // Remove the flag to prevent showing the toast on subsequent reloads
      sessionStorage.removeItem('showToastDelete');



  } else if (sessionStorage.getItem('showToastRegister') === 'true') {
    Toastify({
      text: "User Registration Successfull",
      duration: 5000,
      close: true,
      gravity: "top",
      position: "right",
      progressBar: true,
      style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
      }
  }).showToast();
  }
// Remove the flag to prevent showing the toast on subsequent reloads
sessionStorage.removeItem('showToastRegister');

});




