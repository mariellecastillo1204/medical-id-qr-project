const token = localStorage.getItem("token");
if (!token) window.location.href = "/pages/login.html";

let currentProfileToken = null;

window.onload = async () => {

  const res = await fetch("/api/profile", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  if (!data || !data._id) {
    window.location.href = "/pages/dashboard.html";
    return;
  }

  currentProfileToken = data.qrToken;

  const formattedDOB = new Date(data.dob).toLocaleDateString("en-US");

  document.getElementById("profileData").innerHTML = `
    <h3>Personal Information</h3>
    <p><strong>Name:</strong> ${data.firstName} ${data.middleName || ""} ${data.lastName}</p>
    <p><strong>Sex:</strong> ${data.sex}</p>
    <p><strong>Date of Birth:</strong> ${formattedDOB}</p>
    <p><strong>Blood Type:</strong> ${data.bloodType}</p>
    <p><strong>Contact:</strong> ${data.contactNumber}</p>
    <p><strong>Religion:</strong> ${data.religion}</p>
  `;

  generateQR(currentProfileToken);
};

function generateQR(tokenValue) {
  const url = window.location.origin + "/public-profile/" + tokenValue;

  document.getElementById("qrcode").innerHTML = "";

  QRCode.toCanvas(url, { width:200 }, (err, canvas) => {
    document.getElementById("qrcode").appendChild(canvas);
  });
}

async function generateNewQR() {

  const res = await fetch("/api/profile/regenerate-qr", {
    method: "POST",
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  currentProfileToken = data.qrToken;

  generateQR(currentProfileToken);

  alert("New QR generated. Old QR is now invalid.");
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