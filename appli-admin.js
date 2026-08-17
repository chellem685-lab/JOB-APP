import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

console.log("appli-admin.js loaded");

document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("applicantsTableBody");

    if (!tableBody) {
        console.log("Applicants table not found on this page.");
        return;
    }

    //    UPDATE APPLICATION STATUS
    async function updateApplicationStatus(applicationId, newStatus) {
        try {
            const applicationRef = doc(db, "applications", applicationId);

            await updateDoc(applicationRef, {
                status: newStatus
            });

            console.log(`Application ${applicationId} set to ${newStatus}`);

            return true;

        } catch (error) {
            console.error("Error updating status:", error);

            alert("Failed to update application status.");

            return false;
        }
    }

    //    SEND APPLICATION STATUS EMAIL
    async function sendApplicationStatusEmail(application, status) {
        try {
            console.log("Sending application status email...", application);

            const response = await fetch(
                "http://localhost:3000/send-application-status",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: application.applicantEmail,
                        applicantName: application.applicantName || "Applicant",
                        position: application.position,
                        status: status
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                console.error("Email notification failed:", result.message);

                alert("Application status updated, but the email was not sent.");

                return false;
            }

            console.log("Email notification sent.");

            return true;

        } catch (error) {
            console.error("Email notification error:", error);

            alert("Application status updated, but the email server could not be reached.");

            return false;
        }
    }

    //    DELETE APPLICATION
    async function deleteApplication(applicationId) {
        try {
            const applicationRef = doc(db, "applications", applicationId);

            await deleteDoc(applicationRef);

            console.log(`Application ${applicationId} deleted.`);

            return true;

        } catch (error) {
            console.error("Error deleting application:", error);

            alert("Failed to delete application.");

            return false;
        }
    }

    //    LOAD APPLICATIONS
    async function loadApplications() {
        try {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        Loading applicants...
                    </td>
                </tr>
            `;

            const applicationsRef = collection(db, "applications");

            const snapshot = await getDocs(applicationsRef);

            console.log("Applications found:", snapshot.size);

            if (snapshot.empty) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7">
                            No applications found.
                        </td>
                    </tr>
                `;

                return;
            }

            tableBody.innerHTML = "";

            snapshot.forEach((applicationDoc) => {
                const application = applicationDoc.data();

                const applicationId = applicationDoc.id;

                const row = document.createElement("tr");

                row.innerHTML = `
                        <td>
                            ${application.applicantName || "N/A"}
                        </td>

                        <td>
                            ${application.applicantEmail || "N/A"}
                        </td>

                        <td>
                            ${application.contactNumber || "N/A"}
                        </td>

                        <td>
                            ${application.position || "N/A"}
                        </td>

                        <td class="status-cell">
                            <span class="status-badge status-${(application.status || "Pending").toLowerCase()}">
                                ${application.status || "Pending"}
                            </span>
                        </td>

                        <td class="action-cell">

                            <button
                                type="button"
                                class="view-btn"
                                title="View">
                                <i class="ri-eye-line"></i>
                                <span>View</span>
                            </button>

                            <button
                                type="button"
                                class="approve-btn"
                                title="Approve">
                                <i class="ri-check-line"></i>
                                <span>Approve</span>
                            </button>

                            <button
                                type="button"
                                class="reject-btn"
                                title="Reject">
                                <i class="ri-close-line"></i>
                                <span>Reject</span>
                            </button>

                            <button
                                type="button"
                                class="delete-btn"
                                title="Delete">
                                <i class="ri-delete-bin-line"></i>
                                <span>Delete</span>
                            </button>

                        </td>
                    `;

                tableBody.appendChild(row);

                const statusCell = row.querySelector(".status-cell");

                //    VIEW APPLICATION
                const viewButton = row.querySelector(".view-btn");

                viewButton.addEventListener("click", () => {
                    alert(
                        `Applicant: ${application.applicantName || "N/A"}\n\n` +
                        `Email: ${application.applicantEmail || "N/A"}\n` +
                        `Contact: ${application.contactNumber || "N/A"}\n` +
                        `Position: ${application.position || "N/A"}\n` +
                        `Date Applied: ${application.dateApplied || "N/A"}\n` +
                        `Status: ${application.status || "Pending"}\n\n` +
                        `Cover Letter:\n${application.coverLetter || "N/A"}`
                    );
                });

                //    APPROVE APPLICATION
                const approveButton = row.querySelector(".approve-btn");

                approveButton.addEventListener("click", async () => {
                    const confirmApprove = confirm(
                        `Approve application ${application.applicantName || application.applicantEmail}?`
                    );

                    if (!confirmApprove) {
                        return;
                    }

                    const success = await updateApplicationStatus(applicationId, "Approved");

                    if (success) {
                        application.status = "Approved";

                        statusCell.innerHTML = `<span class="status-badge status-approved">Approved</span>`;

                        const emailSent = await sendApplicationStatusEmail(application, "Approved");

                        if (emailSent) {
                            alert("Application approved and email sent successfully.");
                        }
                    }
                });

                //    REJECT APPLICATION
                const rejectButton = row.querySelector(".reject-btn");

                rejectButton.addEventListener("click", async () => {
                    const confirmReject = confirm(
                        `Reject application ng ${application.applicantName || application.applicantEmail}?`
                    );

                    if (!confirmReject) {
                        return;
                    }

                    const success = await updateApplicationStatus(applicationId, "Rejected");

                    if (success) {
                        application.status = "Rejected";

                        statusCell.innerHTML = `<span class="status-badge status-rejected">Rejected</span>`;

                        const emailSent = await sendApplicationStatusEmail(application, "Rejected");

                        if (emailSent) {
                            alert("Application rejected and email sent successfully.");
                        }
                    }
                });

                //    DELETE APPLICATION
                const deleteButton = row.querySelector(".delete-btn");

                deleteButton.addEventListener("click", async () => {
                    const confirmDelete = confirm(
                        `Delete application of ${application.applicantName || application.applicantEmail}?`
                    );

                    if (!confirmDelete) {
                        return;
                    }

                    const success = await deleteApplication(applicationId);

                    if (success) {
                        row.remove();

                        alert("Application deleted successfully.");

                        if (tableBody.children.length === 0) {
                            tableBody.innerHTML = `
                                        <tr>
                                            <td colspan="7">
                                                No applications found.
                                            </td>
                                        </tr>
                                    `;
                        }
                    }
                });
            });

        } catch (error) {
            console.error("Error loading applications:", error);

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        Failed to load applications.
                    </td>
                </tr>
            `;
        }
    }

    //    ADMIN AUTH
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.log("No logged-in user.");
            return;
        }

        console.log("Admin user:", user.uid);

        await loadApplications();
    });

});