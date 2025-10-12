// Debug script to check if progress slider is properly added
console.log("🔍 Checking progress slider implementation...");

// Check if the progress slider elements exist in the DOM
const checkProgressSlider = () => {
  // Look for progress slider in create dialog
  const createProgressSlider = document.querySelector('input[type="range"][id="progress"]');
  const createProgressLabel = document.querySelector('label[for="progress"]');
  
  // Look for progress slider in edit dialog
  const editProgressSlider = document.querySelector('input[type="range"][id="edit-progress"]');
  const editProgressLabel = document.querySelector('label[for="edit-progress"]');
  
  console.log("📊 Create Dialog Progress Slider:", createProgressSlider ? "✅ Found" : "❌ Not Found");
  console.log("📊 Create Dialog Progress Label:", createProgressLabel ? "✅ Found" : "❌ Not Found");
  console.log("✏️ Edit Dialog Progress Slider:", editProgressSlider ? "✅ Found" : "❌ Not Found");
  console.log("✏️ Edit Dialog Progress Label:", editProgressLabel ? "✅ Found" : "❌ Not Found");
  
  if (createProgressSlider) {
    console.log("Create slider value:", createProgressSlider.value);
    console.log("Create slider min/max:", createProgressSlider.min, createProgressSlider.max);
  }
  
  if (editProgressSlider) {
    console.log("Edit slider value:", editProgressSlider.value);
    console.log("Edit slider min/max:", editProgressSlider.min, editProgressSlider.max);
  }
};

// Run the check
checkProgressSlider();

// Also check after a delay in case elements are added dynamically
setTimeout(checkProgressSlider, 2000);
