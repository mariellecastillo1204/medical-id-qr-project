const token = localStorage.getItem("token");
if (!token) window.location.href = "pages/login.html";

let currentProfileID = null;

window.onload = async () => {

  const res = await fetch("/api/profile", {
    headers: { Authorization: token }
  });

  const data = await res.json();

  if (!data || !data._id) {
    window.location.href = "pages/dashboard.html";
    return;
  }

  currentProfileID = data._id;

  const formattedDOB = new Date(data.dob).toLocaleDateString("en-US");

  document.getElementById("profileData").innerHTML = `
    <h3>Personal Information</h3>
    <p><strong>Name:</strong> ${data.firstName} ${data.middleName || ""} ${data.lastName}</p>
    <p><strong>Sex:</strong> ${data.sex}</p>
    <p><strong>Date of Birth:</strong> ${formattedDOB}</p>
    <p><strong>Blood Type:</strong> ${data.bloodType}</p>
    <p><strong>Contact:</strong> ${data.contactNumber}</p>
    <p><strong>Religion:</strong> ${data.religion}</p>

    <hr>

    <h3>Emergency Contact</h3>
    <p>${data.emergencyFirstName} ${data.emergencyLastName}</p>
    <p>${data.relationship}</p>
    <p>${data.emergencyContactNumber}</p>

    <hr>

    <h3>Medical Information</h3>
    <p>Allergies: ${data.allergies}</p>
    <p>Medications: ${data.medications}</p>
    <p>Conditions: ${data.medicalConditions}</p>
    <p>Past Illness: ${data.pastIllness || "N/A"}</p>
    <p>Family History: ${data.familyHistory || "N/A"}</p>

    <hr>

    <h3>Insurance</h3>
    <p>PhilHealth: ${data.philhealth || "N/A"}</p>
    <p>HMO: ${data.hmo || "N/A"}</p>
  `;

  generateQR();
};

function generateQR() {
  const url = window.location.origin + "/public-profile/" + currentProfileID;

  document.getElementById("qrcode").innerHTML = "";

  QRCode.toCanvas(url, { width:200 }, (err, canvas) => {
    document.getElementById("qrcode").appendChild(canvas);
  });
}

function downloadQR() {
  const canvas = document.querySelector("#qrcode canvas");
  const link = document.createElement("a");
  link.download = "medical-qr.png";
  link.href = canvas.toDataURL();
  link.click();
}

function generateNewQR() {
  alert("QR refreshed.");
  generateQR();
}

function editProfile() {
  window.location.href = "dashboard.html";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}