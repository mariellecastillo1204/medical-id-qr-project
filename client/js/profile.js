const token = localStorage.getItem("token");

if (!token) {
  alert("Session expired. Please login again.");
  window.location.href = "login.html";
}

// Load profile when page opens
window.onload = async () => {
  try {
    const res = await fetch("/api/profile", {
      headers: { Authorization: token }
    });

    const data = await res.json();

    if (!data || data.message) {
      document.getElementById("profileData").innerHTML = "<p>No profile found.</p>";
      return;
    }

    // Display profile info
    document.getElementById("profileData").innerHTML = `
      <h3>Personal Information</h3>
      <p><strong>Name:</strong> ${data.firstName} ${data.middleName || ""} ${data.lastName}</p>
      <p><strong>Sex:</strong> ${data.sex}</p>
      <p><strong>Date of Birth:</strong> ${data.dob}</p>
      <p><strong>Blood Type:</strong> ${data.bloodType}</p>
      <p><strong>Contact Number:</strong> ${data.contactNumber}</p>
      <p><strong>Religion:</strong> ${data.religion}</p>

      <h3>Emergency Contact</h3>
      <p><strong>Name:</strong> ${data.emergencyFirstName} ${data.emergencyMiddleName || ""} ${data.emergencyLastName}</p>
      <p><strong>Relationship:</strong> ${data.relationship}</p>
      <p><strong>Contact Number:</strong> ${data.emergencyContactNumber}</p>

      <h3>Medical Information</h3>
      <p><strong>Allergies:</strong> ${data.allergies}</p>
      <p><strong>Medications:</strong> ${data.medications}</p>
      <p><strong>Medical Conditions:</strong> ${data.medicalConditions}</p>
      <p><strong>Past Illness:</strong> ${data.pastIllness || "N/A"}</p>
      <p><strong>Family History:</strong> ${data.familyHistory || "N/A"}</p>

      <h3>Insurance / Benefits</h3>
      <p><strong>PhilHealth ID:</strong> ${data.philhealth || "N/A"}</p>
      <p><strong>HMO Provider:</strong> ${data.hmo || "N/A"}</p>
    `;

    // Generate QR Code
    const publicURL = window.location.origin + "/public-profile/" + data._id;

    QRCode.toCanvas(publicURL, { width: 200 }, function (err, canvas) {
      if (!err) {
        document.getElementById("qrcode").appendChild(canvas);
      }
    });

  } catch (error) {
    console.error("Error loading profile:", error);
  }
};

// Redirect to dashboard for updating
function goToDashboard() {
  window.location.href = "dashboard.html";
}

// Logout function
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}