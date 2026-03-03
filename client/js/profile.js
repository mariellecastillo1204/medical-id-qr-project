const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

window.onload = async () => {
  const res = await fetch("/api/profile", {
    headers: { Authorization: token }
  });

  const data = await res.json();
  if (!data) return;

  const formattedDOB = new Date(data.dob).toLocaleDateString("en-US");

  document.getElementById("profileData").innerHTML = `
    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
    <p><strong>DOB:</strong> ${formattedDOB}</p>
    <p><strong>Blood Type:</strong> ${data.bloodType}</p>
  `;

  const url = window.location.origin + "/public-profile/" + data._id;

  QRCode.toCanvas(url, { width: 200 }, (err, canvas) => {
    document.getElementById("qrcode").appendChild(canvas);
  });
};

function downloadQR() {
  const canvas = document.querySelector("#qrcode canvas");
  const link = document.createElement("a");
  link.download = "medical-qr.png";
  link.href = canvas.toDataURL();
  link.click();
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";

  function downloadQR() {
  const canvas = document.querySelector("#qrcode canvas");
  const link = document.createElement("a");
  link.download = "medical-qr.png";
  link.href = canvas.toDataURL();
  link.click();
}

}