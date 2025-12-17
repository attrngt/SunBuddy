function setResult(type) {
  document.getElementById("quizResult").innerText =
    "Rekomendasi: SunBuddy " + type;
}

// ===============================
// MODAL GAMBAR PRODUK
// ===============================
function openImageModal(element) {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const img = element.querySelector("img");

  modalImage.src = img.src;
  modalImage.alt = img.alt;
  modal.classList.add("show");
}

function closeImageModal() {
  const modal = document.getElementById("imageModal");
  modal.classList.remove("show");
}

// Close modal saat klik background
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("imageModal");
  const closeBtn = document.querySelector(".modal-close");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeImageModal);
  }

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeImageModal();
      }
    });
  }
});

// ===============================
// EDIT REWARDS DI SINI
// ===============================
const rewards = [
  "Sticker",
  "Keychain",
  "+1",
  "carambol",
];

let rotation = 0;

// ===============================
// WARNA SEGMENT
// ===============================
const color1 = "#ffd08a";
const color2 = "#ffffff";

function getSegmentColor(index, total) {
  if (total % 2 === 0) {
    return index % 2 === 0 ? color1 : color2;
  } else {
    return index % 2 === 0 ? color2 : color1;
  }
}

// ===============================
// GENERATE GRADIENT WHEEL
// ===============================
function generateWheelGradient() {
  const total = rewards.length;
  const deg = 360 / total;
  let stops = [];

  for (let i = 0; i < total; i++) {
    const start = i * deg;
    const end = (i + 1) * deg;
    const color = getSegmentColor(i, total);
    stops.push(`${color} ${start}deg ${end}deg`);
  }

  return `conic-gradient(${stops.join(",")})`;
}

// ===============================
// TAMPILKAN TEKS HADIAH
// ===============================
function displayRewards() {
  const wheel = document.getElementById("wheel");
  const total = rewards.length;
  const segmentDeg = 360 / total;

  wheel.style.background = generateWheelGradient();
  wheel.innerHTML = "";

  rewards.forEach((reward, i) => {
    const angle = i * segmentDeg + segmentDeg / 2;
    const rad = (angle - 90) * (Math.PI / 180);
    const radius = 85;

    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;

    const label = document.createElement("div");
    label.className = "pie-segment";
    label.style.left = `calc(50% + ${x}px)`;
    label.style.top = `calc(50% + ${y}px)`;
    label.style.transform = "translate(-50%, -50%)";
    label.innerText = reward;

    wheel.appendChild(label);
  });
}
function spinWheel() {
  const wheel = document.getElementById("wheel");
  const spinResult = document.getElementById("spinResult");
  const segment = 360 / rewards.length;

  spinResult.classList.remove("show");

  // spin realistis
  const extraSpin = Math.floor(Math.random() * 360) + 1440;
  rotation += extraSpin;

  wheel.style.transform = `rotate(${rotation}deg)`;

  setTimeout(() => {
    // derajat akhir wheel
    const finalDeg = ((rotation % 360) + 360) % 360;

    /**
     * LOGIKA FINAL:
     * - Panah di 0° (atas)
     * - Wheel muter searah jarum jam
     * - Segment ke-i berada di:
     *   i * segment  → (i+1)*segment
     */
    const index = Math.floor((360 - finalDeg) / segment) % rewards.length;

    spinResult.innerText = rewards[index];
    spinResult.classList.add("show");

    // Fungsi untuk hide dengan animasi
    const hideNotification = () => {
      spinResult.classList.add("hide");
      setTimeout(() => {
        spinResult.classList.remove("show");
        spinResult.classList.remove("hide");
      }, 300);
    };

    // Auto-hide setelah 4 detik
    const hideTimer = setTimeout(() => {
      hideNotification();
    }, 4000);

    // Hide saat diklik area lain
    const closeOnClick = (e) => {
      // Jangan tutup jika klik di pop notification sendiri atau di wheel
      if (!spinResult.contains(e.target) && !wheel.contains(e.target)) {
        hideNotification();
        clearTimeout(hideTimer);
        document.removeEventListener("click", closeOnClick);
      }
    };

    document.addEventListener("click", closeOnClick);
  }, 4000);
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  displayRewards();
});

function getUVStatus(uv) {
  if (uv < 3) return "Rendah";
  if (uv < 6) return "Sedang";
  if (uv < 8) return "Tinggi";
  if (uv < 11) return "Sangat Tinggi";
  return "Ekstrem";
}

navigator.geolocation.getCurrentPosition(
  async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    /* =========================
       AMBIL NAMA DAERAH
    ========================= */
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const geoData = await geoRes.json();

      const address = geoData.address;
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        "Daerah tidak diketahui";

      const state = address.state || "";
      const country = address.country || "";

      document.getElementById("uvLocation").innerText = `Lokasi: ${city}${
        state ? ", " + state : ""
      }`;
    } catch (err) {
      document.getElementById("uvLocation").innerText = "Lokasi tidak tersedia";
    }

    /* =========================
       AMBIL UV INDEX
    ========================= */
    const uvRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index`
    );
    const uvData = await uvRes.json();
    const uv = uvData.current.uv_index;

    document.getElementById("uvValue").innerText = `UV Index: ${uv}`;

    document.getElementById("uvStatus").innerText = `Status: ${getUVStatus(
      uv
    )}`;
  },
  () => {
    document.getElementById("uvLocation").innerText = "Izin lokasi ditolak";
  }
);
