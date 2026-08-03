import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


const companySelect = document.getElementById("company");
const otherCompanyGroup = document.getElementById("otherCompanyGroup");

if (companySelect && otherCompanyGroup) {

    companySelect.addEventListener("change", () => {

        if (companySelect.value === "Other") {
            otherCompanyGroup.style.display = "block";
        } else {
            otherCompanyGroup.style.display = "none";
        }

    });

}


// SAVE APPLICATION
const applicationForm = document.getElementById("applicationForm");

if (applicationForm) {

    applicationForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        let company = document.getElementById("company").value;

        if (company === "Other") {
            company = document.getElementById("otherCompany").value;
        }

        const position = document.getElementById("position").value;
        const dateApplied = document.getElementById("dateApplied").value;
        const status = document.getElementById("status").value;
        const notes = document.getElementById("notes").value;


        try {

            await addDoc(collection(db, "applications"), {

                company: company,
                position: position,
                dateApplied: dateApplied,
                status: status,
                notes: notes,
                createdAt: new Date().toISOString()

            });


            alert("Job Application Saved!");

            applicationForm.reset();

            window.location.href = "index.html";


        } catch(error) {

            console.error("Firebase Error:", error);
            alert("Failed to save data");

        }

    });

}



// DISPLAY APPLICATIONS
const applicationList = document.getElementById("applicationList");


if (applicationList) {


    async function loadApplications() {

        try {

            const querySnapshot = await getDocs(
                collection(db, "applications")
            );


            applicationList.innerHTML = "";


            querySnapshot.forEach((item) => {


                const data = item.data();


                applicationList.innerHTML += `

                <tr>

                    <td>${data.company || ""}</td>

                    <td>${data.position || ""}</td>

                    <td>${data.dateApplied || ""}</td>

                    <td>${data.status || ""}</td>

                    <td>${data.notes || ""}</td>

                    <td>

                        <button class="edit-btn" data-id="${item.id}">
                            Edit
                        </button>

                        <button class="delete-btn" data-id="${item.id}">
                            Delete
                        </button>

                    </td>

                </tr>

                `;

            });



            document.querySelectorAll(".delete-btn").forEach(btn => {

                btn.addEventListener("click", async () => {


                    if (!confirm("Delete this application?")) return;


                    await deleteDoc(
                        doc(db, "applications", btn.dataset.id)
                    );


                    loadApplications();


                });

            });



            document.querySelectorAll(".edit-btn").forEach(btn => {

                btn.addEventListener("click", () => {

                    window.location.href =
                    `edit.html?id=${btn.dataset.id}`;

                });

            });



        } catch(error) {

            console.error("Load Error:", error);

        }

    }


    loadApplications();

}



// EDIT PAGE
const editForm = document.getElementById("editForm");


if (editForm) {

    const params = new URLSearchParams(
        window.location.search
    );

    const id = params.get("id");


    if (id) {

        const ref = doc(
            db,
            "applications",
            id
        );


        const snapshot = await getDoc(ref);


        if (snapshot.exists()) {

            const data = snapshot.data();
            document.getElementById("docId").value = id;
            document.getElementById("company").value = data.company;
            document.getElementById("position").value = data.position;
            document.getElementById("dateApplied").value = data.dateApplied;
            document.getElementById("status").value = data.status;
            document.getElementById("notes").value = data.notes;

        }

    }

}