import { auth } from "./firebase.js";
import {
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const modal = document.getElementById("passwordModal");
const openBtn = document.querySelector(".change-password-btn");
const closeBtn = document.getElementById("closeModal");
const updateBtn = document.getElementById("updatePasswordBtn");

if (openBtn) {

    openBtn.addEventListener("click", () => {

        modal.style.display = "flex";

    });

}
if (closeBtn) {

    closeBtn.addEventListener("click", () => {

        modal.style.display = "none";

    });

}
if (updateBtn) {

    updateBtn.addEventListener("click", async () => {
        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPassword) {

            alert("New password does not match.");

            return;
        }

        try {

            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            await reauthenticateWithCredential(
                user,
                credential
            );

            await updatePassword(
                user,
                newPassword
            );

            alert("Password changed successfully!");

            modal.style.display = "none";
        } catch (error) {

            alert(error.message);

        }

    });
}
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async (e) => {

        e.preventDefault();
    
        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) {

            return;

        }
        try {
            await signOut(auth);

            window.location.href = "index.html";

        } catch (error) {

            console.error(error);

        }
    });

}