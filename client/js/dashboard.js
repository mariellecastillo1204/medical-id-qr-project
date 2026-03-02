const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const profileView = document.getElementById("profileView");
const form = document.getElementById("medicalForm");
const qrImage = document.getElementById("qrImage");

// LOAD PROFILE ON PAGE LOAD
window.onload = loadProfile;

async function loadProfile() {
  const res = await fetch("https://medical-id-qr-project.onrender.com", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!data) return;

  profileView.innerHTML = `
    <h3>${data.firstName || ""} ${data.lastName || ""}</h3>
    <p>Blood Type: ${data.bloodType || ""}</p>
    <p>Contact: ${data.contactNumber || ""}</p>
    <p>Emergency: ${data.emergencyFirstName || ""} ${data.emergencyLastName || ""}</p>
    <p>Emergency Number: ${data.emergencyNumber || ""}</p>
  `;

  if (data.qrCode) {
    qrImage.src = data.qrCode;
  }

  // AUTO-FILL FORM
  document.getElementById("firstName").value = data.firstName || "";
  document.getElementById("lastName").value = data.lastName || "";
  document.getElementById("bloodType").value = data.bloodType || "";
  document.getElementById("contactNumber").value = data.contactNumber || "";
  document.getElementById("emergencyFirstName").value = data.emergencyFirstName || "";
  document.getElementById("emergencyLastName").value = data.emergencyLastName || "";
  document.getElementById("emergencyNumber").value = data.emergencyNumber || "";
  document.getElementById("allergies").value = data.allergies || "";
  document.getElementById("medications").value = data.medications || "";
  document.getElementById("medicalConditions").value = data.medicalConditions || "";
}

function toggleEdit() {
  form.style.display = form.style.display === "none" ? "block" : "none";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    firstName: firstName.value,
    lastName: lastName.value,
    bloodType: bloodType.value,
    contactNumber: contactNumber.value,
    emergencyFirstName: emergencyFirstName.value,
    emergencyLastName: emergencyLastName.value,
    emergencyNumber: emergencyNumber.value,
    allergies: allergies.value,
    medications: medications.value,
    medicalConditions: medicalConditions.value
  };

  const res = await fetch("https://medical-id-qr-project.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    alert("Profile Saved");
    loadProfile();
    form.style.display = "none";
  } else {
    alert("Error saving profile");
  }
});

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}