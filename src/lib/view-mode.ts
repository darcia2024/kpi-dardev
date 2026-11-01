export const viewModeStorageKey = "kpi-view";
export const mobileViewport = "width=device-width, initial-scale=1";
export const desktopViewport = "width=1280";

// Dijalankan di awal <body> (lihat layout.tsx) supaya pilihan desktop nggak berkedip dari tampilan HP dulu.
export const viewModeBootScript = `try{if(screen.width<900&&localStorage.getItem("${viewModeStorageKey}")==="desktop"){var m=document.querySelector('meta[name="viewport"]');if(m)m.setAttribute("content","${desktopViewport}");}}catch(e){}`;
