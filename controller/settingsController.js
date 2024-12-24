import { updateUser, deleteUser } from "../model/userModel.js";
import { 
  signIn, 
  getEmail, 
  getRole, 
  clearEmail, 
  clearRole, 
  clearToken 
} from "../model/authModel.js";


async function handlePasswordUpdate(e) {
    e.preventDefault();
  
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
  
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'New password and confirm password do not match!'
      });
      return;
    }
  
    try {
      const email = getEmail();
      await signIn(email, currentPassword);
  
      const userData = {
        email: email,
        password: newPassword,
        role: getRole()
      };
  
      await updateUser(email, userData);
  
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Password has been updated successfully.',
        showConfirmButton: false,
        timer: 1500
      });
  
      changePasswordForm.reset();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to update password. Please verify your current password.'
      });
    }
  }
  
  async function handleAccountDeletion(e) {
    e.preventDefault();
  
    const confirmPassword = document.getElementById("deleteConfirmPassword").value;
  
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone. Your account will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete my account'
    });
  
    if (result.isConfirmed) {
      try {
        const email = getEmail();
        await signIn(email, confirmPassword);
        await deleteUser(email);
  
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Your account has been deleted successfully.',
          showConfirmButton: false,
          timer: 1500
        });
  
        clearEmail();
        clearRole();
        clearToken();
  
        window.parent.location.href = "/index.html";
  
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to delete account. Please verify your password.'
        });
      }
    }
  }


document.addEventListener("DOMContentLoaded", () => {
  const changePasswordForm = document.getElementById("changePasswordForm");
  changePasswordForm.addEventListener("submit", handlePasswordUpdate);

  const deleteAccountForm = document.getElementById("deleteAccountForm");
  deleteAccountForm.addEventListener("submit", handleAccountDeletion);
});

