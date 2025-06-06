const supabaseUrl = 'https://luehtxfysokdxjiqhsyb.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZWh0eGZ5c29rZHhqaXFoc3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDE3ODgsImV4cCI6MjA2NDgxNzc4OH0.c76_B78rttDf4LkI3JSDCauXgnOoTgdFLJY-5zAW9lI';
  const client = supabase.createClient(supabaseUrl, supabaseKey);

const coming = document.getElementById('coming');
const notComing = document.getElementById('notComing');

coming.addEventListener('change', () => {
  if (coming.checked) notComing.checked = false;
});
notComing.addEventListener('change', () => {
  if (notComing.checked) coming.checked = false;
});

document.getElementById('rsvpForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nameInput = document.getElementById('name').value.trim();
  const rsvp = coming.checked ? true : notComing.checked ? false : null;

  if (rsvp === null) {
    alert("Vänligen välj om du kommer eller inte.");
    return;
  }

  // Step 1: Check if the name is on the invited list
  const { data: invitedData, error: invitedError } = await client
    .from('Invited')
    .select('name')
    .ilike('name', nameInput);

  if (invitedError) {
    alert("Fel vid kontroll av namn: " + invitedError.message);
    return;
  }

  if (invitedData.length === 0) {
    alert("Namnet finns inte på inbjudningslistan.");
    return;
  }

  const guestName = invitedData[0].name;

  // ✅ Step 2: Check if the guest already RSVP'd
  const { data: existingRSVP, error: checkError } = await client
    .from('Handler')
    .select('name')
    .ilike('name', guestName);

    console.log(existingRSVP)
  if (checkError) {
    alert("Fel vid kontroll av RSVP-status: " + checkError.message);
    return;
  }

  if (existingRSVP.length > 0) {
    alert("Du har redan RSVP:at. Tack!");
    return;
  }

  // ✅ Step 3: Insert RSVP
  const { error: insertError } = await client
    .from('Handler')
    .insert([{ name: guestName, status: rsvp }]);

  if (insertError) {
    alert("Ett fel uppstod: " + insertError.message);
  } else {
    alert(`Tack ${guestName}! Din RSVP har sparats som "${rsvp ? "Kommer" : "Kommer inte"}".`);
    document.getElementById('rsvpForm').style.display = "none";
    document.getElementById('blur').style.display = "none";
  }
});
