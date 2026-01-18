export function speak(text: string) {
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  u.pitch = 1;
  speechSynthesis.speak(u);
}

export function listen(cb: (t: string) => void) {
  const R = (window as any).webkitSpeechRecognition;
  if (!R) return alert("Speech not supported");
  const r = new R();
  r.continuous = false;
  r.interimResults = false;
  r.onresult = e => cb(e.results[0][0].transcript);
  r.start();
}
