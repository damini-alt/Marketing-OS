async function fetchSheet() {
  const url = "https://docs.google.com/spreadsheets/d/2PACX-1vRS6__4xz9eXFvO8qTheLpxf2EAcyoO3INpwA6vIKSQT13FLSdtgrseTrtEalpv4r1nAxsJcJDI08HD/gviz/tq?tqx=out:json&gid=0";
  const res = await fetch(url);
  const text = await res.text();
  console.log(text.substring(0, 500));
}
fetchSheet();
