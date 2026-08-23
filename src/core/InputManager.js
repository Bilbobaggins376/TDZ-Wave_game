export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.keysPressedThisFrame = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.mouseClickedThisFrame = false;
    this.rightClickedThisFrame = false;

    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (!this.keys.has(key)) this.keysPressedThisFrame.add(key);
      this.keys.add(key);
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.key.toLowerCase()));

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });
    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 2) {
        this.rightClickedThisFrame = true;
        return;
      }
      this.mouseDown = true;
      this.mouseClickedThisFrame = true;
    });
    window.addEventListener("mouseup", (e) => {
      if (e.button !== 2) this.mouseDown = false;
    });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  getMoveVector() {
    let x = 0;
    let y = 0;
    if (this.keys.has("w") || this.keys.has("arrowup")) y -= 1;
    if (this.keys.has("s") || this.keys.has("arrowdown")) y += 1;
    if (this.keys.has("a") || this.keys.has("arrowleft")) x -= 1;
    if (this.keys.has("d") || this.keys.has("arrowright")) x += 1;

    const len = Math.hypot(x, y);
    return len > 0 ? { x: x / len, y: y / len } : { x: 0, y: 0 };
  }

  isKeyPressed(key) {
    return this.keys.has(key);
  }

  wasKeyPressed(key) {
    return this.keysPressedThisFrame.has(key);
  }

  // Returns 1-9 if a number key was pressed this frame, else null.
  numberKeyPressed() {
    for (let n = 1; n <= 9; n++) {
      if (this.keysPressedThisFrame.has(String(n))) return n;
    }
    return null;
  }

  endFrame() {
    this.mouseClickedThisFrame = false;
    this.rightClickedThisFrame = false;
    this.keysPressedThisFrame.clear();
  }
}
