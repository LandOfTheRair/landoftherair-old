
type Side = 'left' | 'right';

class FloatingBox {
  private el;

  constructor(private value: number, private side: Side, private color: string) {}

  init(element) {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.backgroundColor = '#aaa';
    el.style.padding = '3px';
    el.style.zIndex = '550';
    el.style.minHeight = '24px';
    el.style.bottom = '0';
    el.style[this.side] = '10px';
    el.style.color = this.color;
    el.style.fontWeight = 'bold';
    el.style.border = '1px solid #000';
    el.innerText = `${this.value > 0 ? '+': ''}${this.value}`;
    element.appendChild(el);

    this.el = el;
    this.windUp();
  }

  windUp() {
    const scrollUp = () => {
      const val = parseInt(this.el.style.bottom);
      this.el.style.bottom = `${val+3}px`;
    };

    const int = setInterval(() => {
      scrollUp();
      if(parseInt(this.el.style.bottom) > 576) {
        clearInterval(int);
        this.el.parentNode.removeChild(this.el);
      }
    }, 25);

  }
}

export class XPBox extends FloatingBox {
  constructor(value: number) {
    super(value, 'left', 'green');
  }
}

export class HPBox extends FloatingBox {
  constructor(value: number) {
    super(value, 'right', value < 0 ? 'red' : 'blue');
  }
}
