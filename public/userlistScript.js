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



  $('.updateButton').on('click', function() {
    var Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });

    setTimeout(function() {
        Toast.fire({
            icon: 'success',
            title: 'Updated Successfully.'
        });
    }, 3000); // Delay in milliseconds
});
