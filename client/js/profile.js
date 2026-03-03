const token = localStorage.getItem("token");
if (!token) window.location.href = "/pages/login.html";

let currentQRToken = null;

window.onload = async () => {

  const res = await fetch("/api/profile", {
    headers: { Authorization: "Bearer " + token }
  });

  if (!res.ok) {
    logout();
    return;
  }

  const data = await res.json();
  currentQRToken = data.qrToken;

  document.getElementById("profileData").innerHTML = `
    <h3>Personal Information</h3>
    <p><strong>Full Name:</strong> ${data.firstName} ${data.middleName || ""} ${data.lastName}</p>
    <p><strong>Sex:</strong> ${data.sex}</p>
    <p><strong>Date of Birth:</strong> ${data.dob ? new Date(data.dob).toLocaleDateString() : "N/A"}</p>
    <p><strong>Blood Type:</strong> ${data.bloodType}</p>
    <p><strong>Contact Number:</strong> ${data.contactNumber}</p>
    <p><strong>Religion:</strong> ${data.religion}</p>

    <h3>Emergency Contact</h3>
    <p><strong>Name:</strong> ${data.emergencyFirstName} ${data.emergencyMiddleName || ""} ${data.emergencyLastName}</p>
    <p><strong>Relationship:</strong> ${data.emergencyRelationship}</p>
    <p><strong>Contact Number:</strong> ${data.emergencyContactNumber}</p>

    <h3>Medical Information</h3>
    <p><strong>Height:</strong> ${data.height} cm</p>
    <p><strong>Weight:</strong> ${data.weight} kg</p>
    <p><strong>Allergies:</strong> ${data.allergies}</p>
    <p><strong>Medications:</strong> ${data.medications}</p>
    <p><strong>Medical Conditions:</strong> ${data.medicalConditions}</p>
    <p><strong>Past Illness:</strong> ${data.pastIllness}</p>
    <p><strong>Family History:</strong> ${data.familyHistory}</p>

    <h3>Insurance</h3>
    <p><strong>PhilHealth ID:</strong> ${data.philhealth}</p>
    <p><strong>HMO:</strong> ${data.hmo}</p>
  `;

  generateQR(currentQRToken);
};

function generateQR(tokenValue) {
  const url = window.location.origin + "/public-profile/" + tokenValue;
  document.getElementById("qrcode").innerHTML = "";
  QRCode.toCanvas(url, { width: 200 }, (err, canvas) => {
    document.getElementById("qrcode").appendChild(canvas);
  });
}

async function generateNewQR() {
  const res = await fetch("/api/profile/regenerate-qr", {
    method: "POST",
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();
  currentQRToken = data.qrToken;
  generateQR(currentQRToken);
  alert("New QR generated successfully!");
}

function downloadQR() {
  const canvas = document.querySelector("#qrcode canvas");
  const link = document.createElement("a");
  link.download = "medical-identification-qr.png";
  link.href = canvas.toDataURL();
  link.click();
}

function editProfile() {
  window.location.href = "/pages/dashboard.html";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/pages/login.html";
}