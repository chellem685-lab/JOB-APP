import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

console.log("appli-dashboard.js loaded");

document.addEventListener("DOMContentLoaded", () => {

    onAuthStateChanged(auth, async (user) => {

        if (!user) {
            return;
        }

        console.log("Firebase user:", user);

        const applicationsRef = collection(db, "applications");
        const applicationsQuery = query(applicationsRef, where("applicantId", "==", user.uid));

        try {

            const snapshot = await getDocs(applicationsQuery);
            const tableBody = document.getElementById("applicationsTableBody");

            if (tableBody) {

                if (snapshot.empty) {

                    tableBody.innerHTML = `
                        <tr><td colspan="4">No applications available.</td></tr>
                    `;

                } else {

                    tableBody.innerHTML = "";

                    snapshot.forEach((applicationDoc) => {

                        const application = applicationDoc.data();
                        const row = document.createElement("tr");

                        row.innerHTML = `
                            <td>${application.position || "N/A"}</td>
                            <td>${application.dateApplied || "N/A"}</td>
                            <td>${application.status || "Pending"}</td>
                            <td><button type="button">View</button></td>
                        `;

                        tableBody.appendChild(row);

                    });

                }

            }

        } catch (error) {
            console.error("Error loading applications:", error);
        }

    });

    /* SIDEBAR NAVIGATION */

    const navLinks = document.querySelectorAll(".menu li a[data-target]");
    const sections = document.querySelectorAll("main.main-content > section.table-section");

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("data-target");

            sections.forEach((section) => {
                section.style.display = section.id === targetId ? "block" : "none";
            });

            document.querySelectorAll(".menu li").forEach((li) => li.classList.remove("active"));
            link.closest("li").classList.add("active");
        });
    });

    /* APPLICATION MODAL ELEMENTS */

    const applyButtons = document.querySelectorAll(".apply-btn");
    const applicationModal = document.getElementById("applicationModal");
    const closeApplicationModal = document.getElementById("closeApplicationModal");
    const cancelApplication = document.getElementById("cancelApplication");
    const applicationPosition = document.getElementById("applicationPosition");
    const applicationJobTitle = document.getElementById("applicationJobTitle");
    const applicationName = document.getElementById("applicationName");
    const applicationEmail = document.getElementById("applicationEmail");
    const applicationContact = document.getElementById("applicationContact");
    const applicationCoverLetter = document.getElementById("applicationCoverLetter");
    const applicationForm = document.getElementById("applicationForm");

    /* APPLY BUTTON — nagbubukas ng modal at nag-a-autofill */

    applyButtons.forEach((button) => {
        button.addEventListener("click", async function () {

            const position = button.getAttribute("data-position");
            applicationPosition.value = position;
            applicationJobTitle.textContent = position;

            const currentUser = auth.currentUser;

            if (currentUser) {

                applicationEmail.value = currentUser.email || "";

                try {

                    const userRef =
                        doc(
                            db,
                            "users",
                            currentUser.uid
                        );

                    const userSnap =
                        await getDoc(
                            userRef
                        );

                    if (userSnap.exists()) {

                        const userData =
                            userSnap.data();

                        applicationName.value =
                            userData.fullName || "";

                    } else {

                        applicationName.value =
                            currentUser.displayName || "";

                    }

                } catch (error) {

                    console.error(
                        "Error loading user data:",
                        error
                    );

                    applicationName.value =
                        currentUser.displayName || "";

                }

            }

            applicationModal.style.display = "flex";
        });
    });

    /* CLOSE BUTTON */

    if (closeApplicationModal) {
        closeApplicationModal.addEventListener("click", () => {
            applicationModal.style.display = "none";
        });
    }

    /* CANCEL BUTTON */

    if (cancelApplication) {
        cancelApplication.addEventListener("click", () => {
            applicationModal.style.display = "none";
        });
    }

    /* SUBMIT APPLICATION — nagsa-save papunta sa Firestore */

    if (applicationForm) {
        applicationForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const user = auth.currentUser;
            if (!user) {
                alert("Please log in first.");
                return;
            }

            try {

                let applicantName =
                    applicationName.value;

                if (!applicantName) {

                    const userRef =
                        doc(
                            db,
                            "users",
                            user.uid
                        );

                    const userSnap =
                        await getDoc(
                            userRef
                        );

                    if (userSnap.exists()) {

                        const userData =
                            userSnap.data();

                        applicantName =
                            userData.fullName || "";

                    }

                }

                await addDoc(collection(db, "applications"), {
                    applicantId: user.uid,
                    applicantName: applicantName,
                    applicantEmail: applicationEmail.value,
                    contactNumber: applicationContact.value,
                    coverLetter: applicationCoverLetter.value,
                    position: applicationPosition.value,
                    dateApplied: new Date().toISOString().split("T")[0],
                    status: "Pending"
                });

                alert("Application submitted!");
                applicationModal.style.display = "none";
                applicationForm.reset();
                location.reload();

            } catch (error) {
                console.error("Error submitting application:", error);
                alert("Failed to submit application. Please try again.");
            }
        });
    }

});