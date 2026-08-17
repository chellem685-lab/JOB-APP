import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    verifyPasswordResetCode,
    confirmPasswordReset,
    signOut,
    deleteUser,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
// LOGIN

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Logged-in user:", user.uid);

            // GET USER DATA
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                alert("User data not found!");

                await signOut(auth);

                return;
            }

            const userData = userSnap.data();
            console.log("User data:", userData);

            // ROLE CHECK
            if (userData.role === "admin") {
                window.location.href = "dashboard.html";
                return;
            }

            if (userData.role === "applicant") {
                window.location.href = "applicant.html";
                return;
            }

            alert("Invalid user role.");
            await signOut(auth);
        } catch (error) {
            console.error("Login error:", error);

            if (error.code === "auth/invalid-credential") {
                alert("Incorrect email or password.");
            } else if (error.code === "auth/user-not-found") {
                alert("No account found with this email.");
            } else if (error.code === "auth/wrong-password") {
                alert("Incorrect password.");
            } else if (error.code === "auth/invalid-email") {
                alert("Invalid email address.");
            } else {
                alert("Login failed: " + error.message);
            }
        }
    });
}

// REGISTER

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fullName = document.getElementById("fullName")?.value.trim();
        const username = document.getElementById("username")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value;
        const confirmPassword = document.getElementById("confirmPassword")?.value;

        if (!fullName || !username || !email || !password || !confirmPassword) {
            alert("Please complete all required fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendEmailVerification(user);

            await setDoc(doc(db, "users", user.uid), {
                fullName: fullName,
                username: username,
                email: email,
                role: "applicant",
                createdAt: new Date()
            });

            alert("Registration successful! Please verify your email before logging in.");

            await signOut(auth);

            window.location.href = "index.html";

        } catch (error) {
            console.error("Registration error:", error);

            if (error.code === "auth/email-already-in-use") {
                alert("This email is already registered.");
            } else if (error.code === "auth/invalid-email") {
                alert("Invalid email address.");
            } else if (error.code === "auth/weak-password") {
                alert("Password is too weak.");
            } else {
                alert("Registration failed: " + error.message);
            }
        }
    });
}

// GOOGLE LOGIN

const googleLogin = document.getElementById("loginBtn");

if (googleLogin) {
    googleLogin.addEventListener("click", async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    fullName: user.displayName || "",
                    username: user.email?.split("@")[0] || "",
                    email: user.email,
                    role: "applicant",
                    createdAt: new Date()
                });

                window.location.href = "applicant.html";
                return;
            }

            const userData = userSnap.data();

            if (userData.role === "admin") {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "applicant.html";
            }

        } catch (error) {
            console.error("Google login error:", error);
            alert("Google login failed: " + error.message);
        }
    });
}
// LOGOUT

const logoutButtons = document.querySelectorAll("#logoutBtn, .logout-btn");

logoutButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        const confirmLogout = confirm("Are you sure you want to logout?");

        if (!confirmLogout) {
            return;
        }

        try {
            await signOut(auth);
            window.location.href = "index.html";
        } catch (error) {
            console.error("Logout error:", error);
            alert("Logout failed.");
        }
    });
});
// AUTH STATE

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        console.log("No logged-in user.");
        return;
    }

    console.log("Current authenticated user:", user.email);
});

// FORGOT PASSWORD

const forgotPassword = document.getElementById("forgotPassword");
const forgotPasswordModal = document.getElementById("forgotPasswordModal");
const closeForgotModal = document.getElementById("closeForgotModal");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const updatePasswordBtn = document.getElementById("updatePasswordBtn");
const forgotStep1 = document.getElementById("forgotStep1");
const forgotStep2 = document.getElementById("forgotStep2");
const forgotStep3 = document.getElementById("forgotStep3");
const resetEmail = document.getElementById("resetEmail");
const resetOtp = document.getElementById("resetOtp");
const newPassword = document.getElementById("newPassword");
const confirmNewPassword = document.getElementById("confirmNewPassword");

let resetEmailValue = "";

// OPEN FORGOT PASSWORD MODAL

if (forgotPassword) {
    forgotPassword.addEventListener("click", (e) => {
        e.preventDefault();

        forgotPasswordModal.style.display = "flex";
        forgotStep1.style.display = "block";
        forgotStep2.style.display = "none";
        forgotStep3.style.display = "none";
    });
}

// CLOSE MODAL

if (closeForgotModal) {
    closeForgotModal.addEventListener("click", () => {
        forgotPasswordModal.style.display = "none";
    });
}

// SEND OTP

if (sendOtpBtn) {
    sendOtpBtn.addEventListener("click", async () => {
        const email = resetEmail.value.trim();

        if (!email) {
            alert("Please enter your email address.");
            return;
        }

        try {
            sendOtpBtn.disabled = true;
            sendOtpBtn.textContent = "Sending...";

            const response = await fetch("http://localhost:3000/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email
                })
            });

            const result = await response.json();

            if (!result.success) {
                alert(result.message);
                return;
            }

            resetEmailValue = email;

            alert("OTP sent successfully. Please check your email.");

            forgotStep1.style.display = "none";
            forgotStep2.style.display = "block";

        } catch (error) {
            console.error("Send OTP error:", error);
            alert("Unable to connect to the OTP server.");
        } finally {
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = "Send Reset Email";
        }
    });
}

// VERIFY OTP

if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener("click", async () => {
        const otp = resetOtp.value.trim();

        if (!otp) {
            alert("Please enter the OTP.");
            return;
        }

        try {
            verifyOtpBtn.disabled = true;
            verifyOtpBtn.textContent = "Verifying...";

            const response = await fetch("http://localhost:3000/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: resetEmailValue,
                    otp: otp
                })
            });

            const result = await response.json();

            if (!result.success) {
                alert(result.message);
                return;
            }

            alert("OTP verified successfully.");

            window.resetToken = result.resetToken;

            forgotStep2.style.display = "none";
            forgotStep3.style.display = "block";

        } catch (error) {
            console.error("Verify OTP error:", error);
            alert("Unable to connect to the OTP server.");
        } finally {
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.textContent = "Verify OTP";
        }
    });
}

// UPDATE PASSWORD

if (updatePasswordBtn) {
    updatePasswordBtn.addEventListener("click", async () => {
        const password = newPassword.value;
        const confirmPassword = confirmNewPassword.value;

        if (!password || !confirmPassword) {
            alert("Please complete both password fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        try {
            updatePasswordBtn.disabled = true;
            updatePasswordBtn.textContent = "Updating...";

            const response = await fetch("http://localhost:3000/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: resetEmailValue,
                    newPassword: password,
                    resetToken: window.resetToken
                })
            });

            const result = await response.json();

            if (!result.success) {
                alert(result.message);
                return;
            }

            alert("Password reset successfully! You can now login.");

            forgotPasswordModal.style.display = "none";

            resetEmail.value = "";
            resetOtp.value = "";
            newPassword.value = "";
            confirmNewPassword.value = "";
            window.resetToken = null;

            forgotStep1.style.display = "block";
            forgotStep2.style.display = "none";
            forgotStep3.style.display = "none";

        } catch (error) {
            console.error("Reset password error:", error);
            alert("Unable to connect to the OTP server.");
        } finally {
            updatePasswordBtn.disabled = false;
            updatePasswordBtn.textContent = "Update Password";
        }
    });
}