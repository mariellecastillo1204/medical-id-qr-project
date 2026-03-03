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

  if (!data || !data._id) {
    window.location.href = "/pages/dashboard.html";
    return;
  }

  currentQRToken = data.qrToken;

  document.getElementById("profileData").innerHTML = `
    <p><strong>Name:</strong> ${data.firstName} ${data.middleName || ""} ${data.lastName}</p>
    <p><strong>Sex:</strong> ${data.sex}</p>
    <p><strong>Date of Birth:</strong> ${new Date(data.dob).toLocaleDateString()}</p>
    <p><strong>Blood Type:</strong> ${data.bloodType}</p>
    <p><strong>Contact:</strong> ${data.contactNumber}</p>
    <p><strong>Religion:</strong> ${data.religion}</p>
    <p><strong>Allergies:</strong> ${data.allergies}</p>
    <p><strong>Medications:</strong> ${data.medications}</p>
    <p><strong>Medical Conditions:</strong> ${data.medicalConditions}</p>
    <p><strong>Emergency Contact:</strong> ${data.emergencyFirstName} ${data.emergencyLastName}</p>
  `;

  generateQR(currentQRToken);
};

function generateQR(tokenValue) {
  const url = window.location.origin + "/public-profile/" + tokenValue;
  document.getElementById("qrcode").innerHTML = "";

  QRCode.toCanvas(url,{width:200},(err,canvas)=>{
    document.getElementById("qrcode").appendChild(canvas);
  });
}

async function generateNewQR(){
  const res = await fetch("/api/profile/regenerate-qr",{
    method:"POST",
    headers:{ Authorization:"Bearer "+token }
  });

  const data = await res.json();

  if (!res.ok) {
    alert("QR regeneration failed");
    return;
  }

  currentQRToken = data.qrToken;
  generateQR(currentQRToken);
  alert("New QR generated. Old QR disabled.");
}

function downloadQR(){
  const canvas = document.querySelector("#qrcode canvas");
  const link = document.createElement("a");
  link.download="medical-identification-qr.png";
  link.href=canvas.toDataURL();
  link.click();
}

function editProfile(){
  window.location.href="/pages/dashboard.html";
}

function logout(){
  localStorage.removeItem("token");
  window.location.href="/pages/login.html";
}