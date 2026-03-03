const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

let currentProfileID = null;

window.onload = async () => {

  const res = await fetch("/api/profile", {
    headers: { Authorization: token }
  });

  const data = await res.json();
  if (!data || !data._id) {
    window.location.href = "dashboard.html";
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
    <p><strong>Name:</strong> ${data.emergencyFirstName} ${data.emergencyMiddleName || ""} ${data.emergencyLastName}</p>
    <p><strong>Relationship:</strong> ${data.relationship}</p>
    <p><strong>Contact:</strong> ${data.emergencyContactNumber}</p>

    <hr>

    <h3>Medical Information</h3>
    <p><strong>Allergies:</strong> ${data.allergies}</p>
    <p><strong>Medications:</strong> ${data.medications}</p>
    <p><strong>Conditions:</strong> ${data.medicalConditions}</p>
    <p><strong>Past Illness:</strong> ${data.pastIllness || "N/A"}</p>
    <p><strong>Family History:</strong> ${data.familyHistory || "N/A"}</p>

    <hr>

    <h3>Insurance</h3>
    <p><strong>PhilHealth:</strong> ${data.philhealth || "N/A"}</p>
    <p><strong>HMO:</strong> ${data.hmo || "N/A"}</p>
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
  alert("New QR generated (visual refresh only for now)");
  generateQR();
}

function editProfile() {
  window.location.href = "dashboard.html";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}